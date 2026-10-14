"""
Pydantic request/response schemas for the allocation API.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Request ──────────────────────────────────────────────────────────────────

class AllocationRunRequest(BaseModel):
    strategy: str = "graph_clustering"   # must match a key in STRATEGY_REGISTRY
    run_by: Optional[str] = "admin"
    notes: Optional[str] = None
    year: Optional[int] = None           # None = all years; 1/2/3/4 = filter to that year


# ── Response ─────────────────────────────────────────────────────────────────

class AllocationGroupResponse(BaseModel):
    id: str
    run_id: str
    room_id: Optional[str]
    room_number: Optional[str]
    hostel_id: Optional[str]
    student_ids: List[str]
    student_names: List[str]
    group_size: int
    compatibility_score: float
    has_explicit_preference: bool
    notes: Optional[str]


class AllocationRunResponse(BaseModel):
    id: str
    strategy: str
    status: str
    year: Optional[int]                  # academic year filter used (None = all years)
    total_students: int
    allocated_count: int
    unallocated_count: int
    total_groups: int
    avg_compatibility_score: float
    run_by: Optional[str]
    notes: Optional[str]
    created_at: Optional[str]
    approved_at: Optional[str]
    groups: Optional[List[AllocationGroupResponse]] = None


class AllocationRunSummaryResponse(BaseModel):
    """Lightweight version without groups — used in list view."""
    id: str
    strategy: str
    status: str
    year: Optional[int]                  # academic year filter used (None = all years)
    total_students: int
    allocated_count: int
    unallocated_count: int
    total_groups: int
    avg_compatibility_score: float
    run_by: Optional[str]
    created_at: Optional[str]


class StrategyInfo(BaseModel):
    name: str
    description: str


class StrategiesResponse(BaseModel):
    strategies: List[StrategyInfo]
    default: str
