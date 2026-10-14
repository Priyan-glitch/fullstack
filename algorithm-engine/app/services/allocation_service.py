"""
Allocation Service — Orchestrator.

Sequence:
  1. Fetch data (preferences + students + rooms) via data_fetcher
  2. Instantiate the requested strategy from the registry
  3. Run the strategy → AllocationResult
  4. Persist AllocationRun + AllocationGroup records to the DB
  5. Return the saved AllocationRun id
"""
import logging
from datetime import datetime
import httpx
from sqlalchemy.orm import Session

from app.config import get_settings

from app.services.data_fetcher import (
    DataFetchError,
    fetch_submitted_preferences,
    fetch_all_students,
    fetch_available_rooms,
    build_student_list,
)
from app.strategies.registry import get_strategy
from app.strategies.base import AllocationResult, RoommateGroup
from app.models.allocation_run import AllocationRun
from app.models.allocation_group import AllocationGroup

logger = logging.getLogger(__name__)


class AllocationError(Exception):
    """Raised when the allocation run cannot complete."""


def run_allocation(
    strategy_name: str,
    run_by: str,
    notes: str | None,
    db: Session,
    year: int | None = None,
) -> AllocationRun:
    """
    Full allocation pipeline. Returns the saved AllocationRun ORM object.
    Year filter: if provided (1-4), only students in that year are processed.
    """
    logger.info("=== Allocation run started. Strategy: %s ===", strategy_name)

    # ── 1. Resolve strategy ────────────────────────────────────────────────
    try:
        strategy = get_strategy(strategy_name)
    except ValueError as e:
        raise AllocationError(str(e)) from e

    # ── 2. Fetch data ──────────────────────────────────────────────────────
    try:
        preferences = fetch_submitted_preferences()
        student_map = fetch_all_students()
        rooms = fetch_available_rooms()
    except DataFetchError as e:
        raise AllocationError(f"Failed to fetch input data: {e}") from e

    if not preferences:
        raise AllocationError("No submitted preferences found. Cannot run allocation.")

    students = build_student_list(preferences, student_map, year=year)
    if not students:
        year_label = f"Year {year}" if year else "any year"
        raise AllocationError(
            f"No students with submitted preferences found for {year_label}."
        )
    logger.info("Running strategy on %d students, %d rooms", len(students), len(rooms))

    # ── 3. Run the strategy ────────────────────────────────────────────────
    try:
        result: AllocationResult = strategy.run(students, rooms)
    except Exception as e:
        logger.exception("Strategy raised an exception")
        raise AllocationError(f"Strategy failed: {e}") from e

    # ── 4. Persist results ─────────────────────────────────────────────────
    run = AllocationRun(
        strategy=strategy_name,
        status="DRAFT",
        year=year,
        total_students=len(students),
        allocated_count=result.allocated_count,
        unallocated_count=result.unallocated_count,
        total_groups=len(result.groups),
        avg_compatibility_score=result.avg_compatibility_score,
        run_by=run_by,
        notes=notes,
        created_at=datetime.utcnow(),
    )
    db.add(run)
    db.flush()   # get run.id before committing

    for group in result.groups:
        ag = _group_to_model(group, run.id)
        db.add(ag)

    # Also store unallocated as a sentinel group (room_id=None)
    if result.unallocated_student_ids:
        sentinel = AllocationGroup(
            run_id=run.id,
            room_id=None,
            room_number=None,
            hostel_id=None,
            student_ids=",".join(str(i) for i in result.unallocated_student_ids),
            student_names="",
            group_size="0",
            compatibility_score=0.0,
            has_explicit_preference="false",
            notes="UNALLOCATED — no matching room or insufficient group size",
        )
        db.add(sentinel)

    db.commit()
    db.refresh(run)
    logger.info("=== Allocation run %s saved (status=DRAFT). ===", run.id)
    return run


def approve_run(run_id: str, db: Session) -> AllocationRun:
    run = _get_run_or_raise(run_id, db)
    if run.status != "DRAFT":
        raise AllocationError(f"Run {run_id} is not in DRAFT status (current: {run.status})")
    run.status = "APPROVED"
    run.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(run)
    try:
        _sync_approved_allocation(run_id, db)
    except Exception as e:
        logger.exception("Failed to sync approved allocation to downstream services: %s", e)
    return run


def reject_run(run_id: str, db: Session) -> AllocationRun:
    run = _get_run_or_raise(run_id, db)
    if run.status != "DRAFT":
        raise AllocationError(f"Run {run_id} is not in DRAFT status (current: {run.status})")
    run.status = "REJECTED"
    db.commit()
    db.refresh(run)
    return run


def get_run(run_id: str, db: Session) -> AllocationRun:
    return _get_run_or_raise(run_id, db)


def list_runs(db: Session) -> list[AllocationRun]:
    return db.query(AllocationRun).order_by(AllocationRun.created_at.desc()).all()


def get_groups_for_run(run_id: str, db: Session) -> list[AllocationGroup]:
    return (
        db.query(AllocationGroup)
        .filter(AllocationGroup.run_id == run_id)
        .all()
    )


# ── Private helpers ────────────────────────────────────────────────────────────

def _sync_approved_allocation(run_id: str, db: Session):
    """
    Push approved allocation results to downstream services:
    1. hostel-service: update rooms with occupiedCount and status=FULL, update hostel capacity.
    2. student-service: assign roomNumber and hostelBlock to each student.
    """
    settings = get_settings()
    groups = (
        db.query(AllocationGroup)
        .filter(AllocationGroup.run_id == run_id, AllocationGroup.room_id.isnot(None))
        .all()
    )

    with httpx.Client(timeout=15.0) as client:
        for group in groups:
            if not group.room_id:
                continue

            student_ids = [int(sid) for sid in group.student_ids.split(",") if sid.strip().isdigit()]
            room_id = group.room_id
            room_number = group.room_number
            hostel_id = group.hostel_id

            # 1. Update Room in hostel-service
            try:
                room_res = client.get(f"{settings.hostel_service_url}/api/rooms/{room_id}")
                if room_res.status_code == 200:
                    room_data = room_res.json()
                    new_occ = min(room_data.get("capacity", 2), len(student_ids))
                    room_data["occupiedCount"] = new_occ
                    room_data["status"] = "FULL" if new_occ >= room_data.get("capacity", 2) else "OCCUPIED"
                    put_res = client.put(f"{settings.hostel_service_url}/api/rooms/{room_id}", json=room_data)
                    logger.info("Updated room %s in hostel-service: status=%s", room_id, put_res.status_code)
            except Exception as e:
                logger.error("Failed to sync room %s to hostel-service: %s", room_id, e)

            # 2. Update Hostel in hostel-service
            if hostel_id:
                try:
                    hostel_res = client.get(f"{settings.hostel_service_url}/api/hostels/{hostel_id}")
                    if hostel_res.status_code == 200:
                        hostel_data = hostel_res.json()
                        curr_avail = hostel_data.get("availableCapacity", hostel_data.get("totalCapacity", 100))
                        hostel_data["availableCapacity"] = max(0, curr_avail - len(student_ids))
                        client.put(f"{settings.hostel_service_url}/api/hostels/{hostel_id}", json=hostel_data)
                except Exception as e:
                    logger.error("Failed to sync hostel %s to hostel-service: %s", hostel_id, e)

            # 3. Update Students in student-service
            for sid in student_ids:
                try:
                    student_res = client.get(f"{settings.student_service_url}/api/students/{sid}")
                    if student_res.status_code == 200:
                        s_data = student_res.json()
                        s_data["roomNumber"] = room_number
                        s_data["hostelBlock"] = f"Block {hostel_id}" if hostel_id else "Main Block"
                        put_s_res = client.put(f"{settings.student_service_url}/api/students/{sid}", json=s_data)
                        logger.info("Updated student %s roomNumber=%s in student-service: status=%s", sid, room_number, put_s_res.status_code)
                except Exception as e:
                    logger.error("Failed to sync student %s to student-service: %s", sid, e)


def _get_run_or_raise(run_id: str, db: Session) -> AllocationRun:
    run = db.query(AllocationRun).filter(AllocationRun.id == run_id).first()
    if not run:
        raise AllocationError(f"Allocation run '{run_id}' not found")
    return run


def _group_to_model(group: RoommateGroup, run_id: str) -> AllocationGroup:
    return AllocationGroup(
        run_id=run_id,
        room_id=str(group.assigned_room_id) if group.assigned_room_id else None,
        room_number=group.assigned_room_number,
        hostel_id=str(group.assigned_hostel_id) if group.assigned_hostel_id else None,
        student_ids=",".join(str(i) for i in group.student_ids),
        student_names=",".join(group.student_names),
        group_size=str(len(group.student_ids)),
        compatibility_score=group.compatibility_score,
        has_explicit_preference="true" if group.has_explicit_preference else "false",
        notes=group.notes,
    )
