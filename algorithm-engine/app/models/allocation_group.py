"""
AllocationGroup — one roommate group within an allocation run.
Each group maps a set of students to a specific room.
"""
import uuid
from sqlalchemy import Column, String, Float, ForeignKey
from app.database import Base


class AllocationGroup(Base):
    __tablename__ = "allocation_groups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("allocation_runs.id"), nullable=False)

    room_id = Column(String(50), nullable=True)            # hostel-service room ID (null = unallocated)
    room_number = Column(String(20), nullable=True)
    hostel_id = Column(String(50), nullable=True)

    student_ids = Column(String(500), nullable=False)      # comma-separated student IDs
    student_names = Column(String(1000), nullable=True)    # comma-separated names (for display)
    group_size = Column(String(5), nullable=False)         # "2" or "3"

    compatibility_score = Column(Float, default=0.0)       # avg pairwise score
    has_explicit_preference = Column(String(5), default="false")  # "true" if any explicit roommate match
    notes = Column(String(500), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "run_id": self.run_id,
            "room_id": self.room_id,
            "room_number": self.room_number,
            "hostel_id": self.hostel_id,
            "student_ids": self.student_ids.split(",") if self.student_ids else [],
            "student_names": self.student_names.split(",") if self.student_names else [],
            "group_size": int(self.group_size),
            "compatibility_score": round(self.compatibility_score or 0.0, 2),
            "has_explicit_preference": self.has_explicit_preference == "true",
            "notes": self.notes,
        }
