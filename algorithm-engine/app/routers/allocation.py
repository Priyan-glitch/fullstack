"""
Allocation Router — REST API endpoints.

All endpoints are under /api/v1/allocation/.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.allocation import (
    AllocationRunRequest,
    AllocationRunResponse,
    AllocationRunSummaryResponse,
    AllocationGroupResponse,
    StrategiesResponse,
    StrategyInfo,
)
from app.services import allocation_service as svc
from app.services.allocation_service import AllocationError
from app.strategies.registry import list_strategies, DEFAULT_STRATEGY

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/allocation", tags=["Allocation"])


# ── Strategies ─────────────────────────────────────────────────────────────────

@router.get("/strategies", response_model=StrategiesResponse, summary="List available strategies")
def get_strategies():
    """Returns all registered allocation strategies and the current default."""
    return StrategiesResponse(
        strategies=[StrategyInfo(**s) for s in list_strategies()],
        default=DEFAULT_STRATEGY,
    )


# ── Trigger a run ──────────────────────────────────────────────────────────────

@router.post("/run", response_model=AllocationRunSummaryResponse, status_code=201,
             summary="Trigger a new allocation run")
def trigger_allocation(payload: AllocationRunRequest, db: Session = Depends(get_db)):
    """
    Triggers a new allocation run using the specified strategy.
    The result is saved as a DRAFT — admin must approve it to make it final.
    """
    logger.info("POST /run  strategy=%s  run_by=%s  year=%s", payload.strategy, payload.run_by, payload.year)
    try:
        run = svc.run_allocation(
            strategy_name=payload.strategy,
            run_by=payload.run_by or "admin",
            notes=payload.notes,
            db=db,
            year=payload.year,
        )
    except AllocationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during allocation run")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

    return _run_to_summary(run)


# ── List all runs ──────────────────────────────────────────────────────────────

@router.get("/runs", response_model=list[AllocationRunSummaryResponse],
            summary="List all allocation runs")
def list_runs(db: Session = Depends(get_db)):
    """Returns all past allocation runs, newest first."""
    runs = svc.list_runs(db)
    return [_run_to_summary(r) for r in runs]


# ── Get a specific run (with groups) ──────────────────────────────────────────

@router.get("/runs/{run_id}", response_model=AllocationRunResponse,
            summary="Get full details of an allocation run")
def get_run(run_id: str, db: Session = Depends(get_db)):
    """Returns the full allocation result including all roommate groups."""
    try:
        run = svc.get_run(run_id, db)
    except AllocationError as e:
        raise HTTPException(status_code=404, detail=str(e))

    groups = svc.get_groups_for_run(run_id, db)
    run_dict = run.to_dict()
    run_dict["groups"] = [_group_to_response(g) for g in groups]
    return AllocationRunResponse(**run_dict)


# ── Approve ────────────────────────────────────────────────────────────────────

@router.post("/runs/{run_id}/approve", response_model=AllocationRunSummaryResponse,
             summary="Approve a draft allocation run")
def approve_run(run_id: str, db: Session = Depends(get_db)):
    """Marks a DRAFT run as APPROVED. This makes the allocation final."""
    try:
        run = svc.approve_run(run_id, db)
    except AllocationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _run_to_summary(run)


# ── Reject ─────────────────────────────────────────────────────────────────────

@router.post("/runs/{run_id}/reject", response_model=AllocationRunSummaryResponse,
             summary="Reject a draft allocation run")
def reject_run(run_id: str, db: Session = Depends(get_db)):
    """Marks a DRAFT run as REJECTED (admin can trigger a new run instead)."""
    try:
        run = svc.reject_run(run_id, db)
    except AllocationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _run_to_summary(run)


# ── Private helpers ────────────────────────────────────────────────────────────

def _run_to_summary(run) -> AllocationRunSummaryResponse:
    return AllocationRunSummaryResponse(
        id=run.id,
        strategy=run.strategy,
        status=run.status,
        year=run.year,
        total_students=run.total_students or 0,
        allocated_count=run.allocated_count or 0,
        unallocated_count=run.unallocated_count or 0,
        total_groups=run.total_groups or 0,
        avg_compatibility_score=round(run.avg_compatibility_score or 0.0, 2),
        run_by=run.run_by,
        created_at=run.created_at.isoformat() if run.created_at else None,
    )


def _group_to_response(g) -> AllocationGroupResponse:
    d = g.to_dict()
    # Convert int lists to str lists for the schema
    d["student_ids"] = [str(i) for i in d["student_ids"]]
    return AllocationGroupResponse(**d)
