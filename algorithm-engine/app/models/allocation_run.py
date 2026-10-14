"""
AllocationRun — one allocation batch job.
Tracks which strategy was used, run status, and summary statistics.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Float
from app.database import Base


class AllocationRun(Base):
    __tablename__ = "allocation_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    strategy = Column(String(50), nullable=False)          # e.g. "graph_clustering"
    status = Column(String(20), nullable=False, default="DRAFT")  # DRAFT | APPROVED | REJECTED
    year = Column(Integer, nullable=True)                  # academic year filter (NULL = all years)

    total_students = Column(Integer, default=0)
    allocated_count = Column(Integer, default=0)
    unallocated_count = Column(Integer, default=0)
    total_groups = Column(Integer, default=0)
    avg_compatibility_score = Column(Float, default=0.0)

    run_by = Column(String(100), nullable=True)            # Admin identifier
    notes = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "strategy": self.strategy,
            "status": self.status,
            "year": self.year,
            "total_students": self.total_students,
            "allocated_count": self.allocated_count,
            "unallocated_count": self.unallocated_count,
            "total_groups": self.total_groups,
            "avg_compatibility_score": round(self.avg_compatibility_score or 0.0, 2),
            "run_by": self.run_by,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
        }
