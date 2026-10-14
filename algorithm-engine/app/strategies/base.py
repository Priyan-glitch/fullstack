"""
Abstract Base Class for all allocation strategies.

To add a new algorithm:
  1. Create a new file in app/strategies/
  2. Subclass AlgorithmStrategy and implement run()
  3. Add one entry to STRATEGY_REGISTRY in registry.py

Nothing else needs to change.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from app.schemas.student import StudentData
from app.schemas.room import RoomData


@dataclass
class RoommateGroup:
    """
    One resolved roommate group that will be assigned to a room.
    """
    student_ids: List[int]
    student_names: List[str]
    room_type: str                          # "2_SHARING" or "3_SHARING"
    gender: Optional[str] = None           # "MALE" | "FEMALE"
    compatibility_score: float = 0.0
    has_explicit_preference: bool = False  # True if ≥1 explicit preference was honored
    assigned_room_id: Optional[int] = None
    assigned_room_number: Optional[str] = None
    assigned_hostel_id: Optional[int] = None
    notes: Optional[str] = None


@dataclass
class AllocationResult:
    """
    Full result returned by a strategy's run() method.
    """
    groups: List[RoommateGroup] = field(default_factory=list)
    unallocated_student_ids: List[int] = field(default_factory=list)

    @property
    def allocated_count(self) -> int:
        return sum(len(g.student_ids) for g in self.groups)

    @property
    def unallocated_count(self) -> int:
        return len(self.unallocated_student_ids)

    @property
    def avg_compatibility_score(self) -> float:
        if not self.groups:
            return 0.0
        scores = [g.compatibility_score for g in self.groups if g.compatibility_score > 0]
        return min(100.0, round(sum(scores) / len(scores), 2)) if scores else 0.0


class AlgorithmStrategy(ABC):
    """
    Every allocation algorithm must implement this interface.
    The run() method receives clean, validated student and room data
    and returns an AllocationResult.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Short machine-readable name, e.g. 'graph_clustering'."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description shown in the admin UI."""
        ...

    @abstractmethod
    def run(
        self,
        students: List[StudentData],
        rooms: List[RoomData],
    ) -> AllocationResult:
        """
        Core allocation logic.

        Args:
            students: List of students with embedded preferences.
                      Only students with submitted=True are passed.
            rooms:    List of available rooms from hostel-service.

        Returns:
            AllocationResult with groups and unallocated student IDs.
        """
        ...
