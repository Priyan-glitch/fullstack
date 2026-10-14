"""
Pydantic schemas for student data consumed from student-service.
These mirror the fields in StudentPreferenceDTO + StudentDTO from the Java backend.
"""
from pydantic import BaseModel
from typing import Optional


class StudentPreferenceData(BaseModel):
    """
    Mirrors StudentPreferenceDTO from student-service.
    All fields are optional to be resilient to partial submissions.
    """
    id: Optional[int] = None
    studentId: int

    # Room preferences
    roomType: Optional[str] = None              # "2_SHARING" | "3_SHARING" (legacy / fallback)
    acPreference: Optional[str] = None          # "AC" | "NON_AC" | "BOTH"

    # Ranked room-type preferences (Strategy 2 — PreferenceQueueLouvain)
    # Each field holds one of: "INDIVIDUAL", "2_SHARING", "3_SHARING", "4_SHARING"
    roomTypePreference1: Optional[str] = None   # 1st choice
    roomTypePreference2: Optional[str] = None   # 2nd choice
    roomTypePreference3: Optional[str] = None   # 3rd choice

    # ISO-8601 timestamp when the preference was submitted — used for FIFO queue ordering
    submittedAt: Optional[str] = None

    # Explicit roommate preferences (comma-separated IDs)
    preferredRoommateIds: Optional[str] = None

    # Lifestyle
    sleepTime: Optional[str] = None
    wakeUpTime: Optional[str] = None
    studyTiming: Optional[str] = None       # "MORNING_PERSON" | "NIGHT_OWL" | "FLEXIBLE"
    noisePreference: Optional[str] = None
    cleanlinessLevel: Optional[int] = None  # 1–5

    # Study & Social
    studyPreference: Optional[str] = None   # "ALONE" | "GROUP_STUDY" | "DOESNT_MATTER"
    studyFrequency: Optional[str] = None
    studyEnvironment: Optional[str] = None
    socialPreference: Optional[str] = None
    personalSpace: Optional[str] = None
    visitorPreference: Optional[str] = None

    submitted: Optional[bool] = False

    class Config:
        extra = "ignore"   # Ignore unknown fields from the service


class StudentData(BaseModel):
    """
    Mirrors StudentDTO — basic profile info needed for allocation context.
    """
    id: int
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    gender: Optional[str] = None       # "Male" | "Female"
    department: Optional[str] = None
    year: Optional[int] = None         # Academic year: 1 | 2 | 3 | 4
    hostelBlock: Optional[str] = None

    # Embedded preference (merged before passing to strategy)
    preference: Optional[StudentPreferenceData] = None

    @property
    def full_name(self) -> str:
        parts = [self.firstName or "", self.lastName or ""]
        return " ".join(p for p in parts if p).strip() or f"Student#{self.id}"

    class Config:
        extra = "ignore"
