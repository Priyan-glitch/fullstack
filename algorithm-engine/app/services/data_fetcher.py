"""
Data Fetcher — HTTP client that pulls data from student-service and hostel-service.

Uses httpx (synchronous) so we don't need to manage an async event loop
in a plain FastAPI background task context.
"""
import logging
from typing import List, Dict
import httpx

from app.config import get_settings
from app.schemas.student import StudentData, StudentPreferenceData
from app.schemas.room import RoomData

logger = logging.getLogger(__name__)
settings = get_settings()

# Timeouts (seconds)
REQUEST_TIMEOUT = 30.0


class DataFetchError(Exception):
    """Raised when data cannot be fetched from a downstream service."""


def _get(url: str) -> dict | list:
    """Make a synchronous GET request and return parsed JSON."""
    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            response = client.get(url)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise DataFetchError(
            f"HTTP {e.response.status_code} from {url}: {e.response.text}"
        ) from e
    except httpx.RequestError as e:
        raise DataFetchError(f"Connection error fetching {url}: {e}") from e


def fetch_submitted_preferences() -> List[StudentPreferenceData]:
    """
    Fetch all submitted (locked) student preferences from student-service.
    Endpoint: GET /api/preferences/submitted
    """
    url = f"{settings.student_service_url}/api/preferences/submitted"
    logger.info("Fetching submitted preferences from %s", url)
    raw: list = _get(url)
    prefs = []
    for item in raw:
        try:
            prefs.append(StudentPreferenceData(**item))
        except Exception as e:
            logger.warning("Skipping malformed preference entry: %s — %s", item, e)
    logger.info("Fetched %d submitted preferences", len(prefs))
    return prefs


def fetch_all_students() -> Dict[int, StudentData]:
    """
    Fetch all students from student-service (to get gender, name, etc.).
    Endpoint: GET /api/students
    Returns a dict keyed by student ID.
    """
    url = f"{settings.student_service_url}/api/students"
    logger.info("Fetching all students from %s", url)
    raw: list = _get(url)
    students: Dict[int, StudentData] = {}
    for item in raw:
        try:
            s = StudentData(**item)
            students[s.id] = s
        except Exception as e:
            logger.warning("Skipping malformed student entry: %s — %s", item, e)
    logger.info("Fetched %d students", len(students))
    return students


def fetch_available_rooms() -> List[RoomData]:
    """
    Fetch all available rooms from hostel-service.
    Endpoint: GET /api/rooms   (then filter by status=AVAILABLE)
    """
    url = f"{settings.hostel_service_url}/api/rooms"
    logger.info("Fetching rooms from %s", url)
    raw: list = _get(url)
    rooms = []
    for item in raw:
        try:
            room = RoomData(**item)
            if room.is_available:
                rooms.append(room)
        except Exception as e:
            logger.warning("Skipping malformed room entry: %s — %s", item, e)
    logger.info("Fetched %d available rooms", len(rooms))
    return rooms


def build_student_list(
    preferences: List[StudentPreferenceData],
    students: Dict[int, StudentData],
    year: int | None = None,
) -> List[StudentData]:
    """
    Merge preference data into StudentData objects.
    Only students who have a profile AND submitted preferences are included.
    If `year` is given (1–4), only students in that academic year are included.
    """
    result: List[StudentData] = []
    for pref in preferences:
        student = students.get(pref.studentId)
        if student is None:
            logger.warning(
                "Preference for student %d found but no student profile — skipping",
                pref.studentId,
            )
            continue

        # ── Year filter ──────────────────────────────────────────────────────
        if year is not None and student.year != year:
            logger.debug(
                "Skipping student %d (year=%s) — filter is year=%d",
                pref.studentId, student.year, year,
            )
            continue

        # Attach preference inline
        student.preference = pref
        result.append(student)

    if year is not None:
        logger.info(
            "Year filter=%d applied: %d students selected", year, len(result)
        )
    return result
