"""
Pydantic schemas for room data consumed from hostel-service.
Mirrors Room entity fields from the Java backend.
"""
from pydantic import BaseModel
from typing import Optional


class RoomData(BaseModel):
    """Mirrors Room entity from hostel-service."""
    id: int
    hostelId: Optional[int] = None
    roomNumber: Optional[str] = None
    floor: Optional[int] = None
    block: Optional[str] = None
    roomType: Optional[str] = None     # "2-SHARING" | "3-SHARING"
    capacity: Optional[int] = None
    occupiedCount: Optional[int] = 0
    status: Optional[str] = "AVAILABLE"  # AVAILABLE | OCCUPIED | FULL | MAINTENANCE
    amenities: Optional[str] = None    # comma-separated or JSON string

    @property
    def available_slots(self) -> int:
        return (self.capacity or 0) - (self.occupiedCount or 0)

    @property
    def is_available(self) -> bool:
        return self.status == "AVAILABLE" and self.available_slots > 0

    @property
    def sharing_count(self) -> int:
        """Returns 2 or 3 based on roomType string."""
        if self.roomType and "3" in self.roomType:
            return 3
        return 2

    @property
    def is_ac(self) -> bool:
        if not self.amenities:
            return False
        import re
        return bool(re.search(r"\bAC\b", self.amenities, re.IGNORECASE) or "AIR CONDITION" in self.amenities.upper())

    class Config:
        extra = "ignore"
