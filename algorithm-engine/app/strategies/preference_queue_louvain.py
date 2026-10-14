"""
Preference-Priority Queue + Louvain Strategy (Strategy 2).

How it works
─────────────
Phase 1 — FIFO Queue Placement
  1. Students submit three ranked room-type preferences:
       1st choice: INDIVIDUAL | 2_SHARING | 3_SHARING | 4_SHARING
       2nd choice: (fallback)
       3rd choice: (fallback)
  2. Sort all students by submission timestamp (ascending) — earliest
     submitter gets first pick.
  3. For each student (in FIFO order):
       - Try to place them in the queue for their 1st choice category.
       - If that category queue is already full (>= total available bed
         slots for that category), try the 2nd choice, then the 3rd.
       - If all queues are full, mark the student UNALLOCATED.
  NOTE: "queue capacity" for a category = number of available rooms of
        that sharing type × sharing count  (i.e. the total bed slots).

Phase 2 — Louvain Clustering per Category
  4. For each (gender, category) queue:
       - Run Louvain-based compatibility graph clustering on the students
         in that queue (same logic as GraphClusteringStrategy).
       - Assign resulting groups to available rooms of that type.

Key differences from Strategy 1 (graph_clustering):
  Strategy 1: single roomType field, no FIFO, global Louvain.
  Strategy 2: three ranked room-type prefs, FIFO fairness, per-category
              capacity bounded queues, independent Louvain per category.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import networkx as nx
import community as community_louvain  # python-louvain

from app.schemas.student import StudentData
from app.schemas.room import RoomData
from app.strategies.base import AlgorithmStrategy, AllocationResult, RoommateGroup
from app.strategies.graph_clustering import (
    EXPLICIT_PREFERENCE_BONUS,
    compute_compatibility,
    _normalize,
    _ac_preference,
    _get_explicit_roommate_ids,
    _room_compatible,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CATEGORY_ORDER = ["INDIVIDUAL", "2_SHARING", "3_SHARING", "4_SHARING"]

_CATEGORY_TO_SIZE: Dict[str, int] = {
    "INDIVIDUAL": 1,
    "2_SHARING": 2,
    "3_SHARING": 3,
    "4_SHARING": 4,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize_room_type(raw: Optional[str]) -> Optional[str]:
    """Normalise a raw room-type string to one of the canonical category keys."""
    if not raw:
        return None
    u = raw.strip().upper().replace("-", "_").replace(" ", "_")
    if "1" in u or "INDIVIDUAL" in u or "SINGLE" in u:
        return "INDIVIDUAL"
    if "4" in u:
        return "4_SHARING"
    if "3" in u:
        return "3_SHARING"
    if "2" in u:
        return "2_SHARING"
    return None


def _student_preferences(student: StudentData) -> List[str]:
    """
    Return the student's ranked room-type preferences as a list of up to 3
    canonical category keys.  Falls back to the legacy `roomType` field if
    the new preference fields are absent.
    """
    pref = student.preference
    if pref is None:
        return []

    ranked: List[str] = []
    for raw in [pref.roomTypePreference1, pref.roomTypePreference2, pref.roomTypePreference3]:
        cat = _normalize_room_type(raw)
        if cat and cat not in ranked:
            ranked.append(cat)

    # Backward-compat: if no ranked fields, fall back to single legacy roomType
    if not ranked:
        legacy = _normalize_room_type(pref.roomType)
        if legacy:
            ranked = [legacy]

    return ranked


def _submission_time(student: StudentData) -> datetime:
    """Parse submittedAt ISO string; fall back to datetime.max for unknown timestamps."""
    raw = (student.preference.submittedAt or "") if student.preference else ""
    if raw:
        for fmt in (
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d",
        ):
            try:
                # Trim to expected length to be safe
                return datetime.strptime(raw[:26], fmt)
            except ValueError:
                continue
        try:
            return datetime.fromisoformat(raw.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            pass
    return datetime.max   # unknown → last in queue


def _compute_queue_capacities(rooms: List[RoomData]) -> Dict[str, int]:
    """
    For each room-type category, compute the total bed slots available.
    capacity[category] = sum(room.sharing_count) for all available rooms.
    """
    caps: Dict[str, int] = defaultdict(int)
    for room in rooms:
        if not room.is_available:
            continue
        size = room.sharing_count
        if size == 1:
            caps["INDIVIDUAL"] += 1
        elif size == 2:
            caps["2_SHARING"] += 2
        elif size == 3:
            caps["3_SHARING"] += 3
        elif size == 4:
            caps["4_SHARING"] += 4
    return dict(caps)


# ---------------------------------------------------------------------------
# Main Strategy
# ---------------------------------------------------------------------------

class PreferenceQueueLouvainStrategy(AlgorithmStrategy):
    """
    Strategy 2 — FIFO preference queuing + per-category Louvain clustering.
    """

    @property
    def name(self) -> str:
        return "preference_queue_louvain"

    @property
    def description(self) -> str:
        return (
            "Students express 3 ranked room-type preferences (Individual / 2-Sharing / "
            "3-Sharing / 4-Sharing). Submissions are sorted by timestamp (FIFO) and placed "
            "into per-category queues bounded by actual room availability. When a category "
            "is full, the student falls back to their next preference. If all queues are "
            "full, the student is left UNALLOCATED. Louvain community detection then runs "
            "independently on each category queue for optimal roommate grouping."
        )

    def run(self, students: List[StudentData], rooms: List[RoomData]) -> AllocationResult:
        logger.info(
            "PreferenceQueueLouvainStrategy: %d students, %d available rooms",
            len(students), len(rooms),
        )

        if not students:
            return AllocationResult()

        # ── Phase 1: FIFO queue placement ─────────────────────────────────────
        sorted_students = sorted(students, key=_submission_time)
        logger.info(
            "Students sorted by submittedAt — first: %s, last: %s",
            sorted_students[0].id if sorted_students else "N/A",
            sorted_students[-1].id if sorted_students else "N/A",
        )

        capacity = _compute_queue_capacities(rooms)
        logger.info("Room category bed-slot capacities: %s", dict(capacity))

        # queues[gender][category] = ordered list of students
        queues: Dict[str, Dict[str, List[StudentData]]] = defaultdict(
            lambda: defaultdict(list)
        )
        unallocated_ids: List[int] = []

        for student in sorted_students:
            gender = _normalize(student.gender) or "UNKNOWN"
            prefs = _student_preferences(student)

            if not prefs:
                logger.warning("Student %s has no room-type preference — UNALLOCATED", student.id)
                unallocated_ids.append(student.id)
                continue

            placed = False
            for cat in prefs:
                # Total bed slots already taken across all genders for this category
                current_usage = sum(
                    len(q)
                    for g_queues in queues.values()
                    for c, q in g_queues.items()
                    if c == cat
                )
                cap = capacity.get(cat, 0)
                if current_usage < cap:
                    queues[gender][cat].append(student)
                    placed = True
                    logger.debug(
                        "  Student %s → queue (%s, %s) [%d/%d bed slots used]",
                        student.id, gender, cat, current_usage + 1, cap,
                    )
                    break
                else:
                    logger.debug(
                        "  Student %s: %s queue full (%d/%d), trying next pref",
                        student.id, cat, current_usage, cap,
                    )

            if not placed:
                logger.info("  Student %s UNALLOCATED — all preferred queues full", student.id)
                unallocated_ids.append(student.id)

        # ── Phase 2: Louvain clustering per (gender, category) queue ──────────
        all_groups: List[RoommateGroup] = []
        available_rooms = [r for r in rooms if r.is_available]

        for gender, cat_queues in queues.items():
            for category, queue in cat_queues.items():
                group_size = _CATEGORY_TO_SIZE.get(category, 2)
                logger.info(
                    "  Clustering (%s, %s): %d students → groups of %d",
                    gender, category, len(queue), group_size,
                )

                if not queue:
                    continue

                groups, leftover_ids = self._cluster_queue(
                    queue, group_size, gender, category
                )

                # Assign rooms to groups
                for group in groups:
                    prefs_ac = [_ac_preference(s) for s in queue if s.id in group.student_ids]
                    ac_pref = self._resolve_group_ac_preference(prefs_ac)

                    assigned = False
                    for room in available_rooms:
                        if _room_compatible(room, group_size, ac_pref):
                            group.assigned_room_id = room.id
                            group.assigned_room_number = room.roomNumber
                            group.assigned_hostel_id = room.hostelId
                            available_rooms.remove(room)
                            assigned = True
                            break

                    if not assigned:
                        # Relax AC constraint: try any same-size room
                        for room in available_rooms:
                            if room.sharing_count == group_size:
                                group.assigned_room_id = room.id
                                group.assigned_room_number = room.roomNumber
                                group.assigned_hostel_id = room.hostelId
                                available_rooms.remove(room)
                                assigned = True
                                group.notes = (group.notes or "") + " [AC preference relaxed]"
                                break

                    if not assigned:
                        group.notes = (group.notes or "") + " [No room available — UNALLOCATED]"
                        unallocated_ids.extend(group.student_ids)
                        continue

                    all_groups.append(group)

                unallocated_ids.extend(leftover_ids)

        result = AllocationResult(
            groups=all_groups,
            unallocated_student_ids=list(set(unallocated_ids)),
        )
        logger.info(
            "PreferenceQueueLouvainStrategy done. %d groups, %d allocated, %d unallocated.",
            len(result.groups), result.allocated_count, result.unallocated_count,
        )
        return result

    # ── Internal clustering ────────────────────────────────────────────────────

    def _cluster_queue(
        self,
        students: List[StudentData],
        group_size: int,
        gender: str,
        category: str,
    ) -> Tuple[List[RoommateGroup], List[int]]:
        """
        Build a weighted compatibility graph and run Louvain on the given queue.
        Mirrors GraphClusteringStrategy._cluster_bucket but operates on a
        pre-filtered FIFO queue instead of a broadly-bucketed set.
        """
        if len(students) < group_size:
            logger.warning(
                "    Queue (%s, %s): only %d students, need %d for a full group — all UNALLOCATED",
                gender, category, len(students), group_size,
            )
            return [], [s.id for s in students]

        if group_size == 1:
            groups = [
                RoommateGroup(
                    student_ids=[s.id],
                    student_names=[s.full_name],
                    room_type=category,
                    gender=gender,
                    compatibility_score=100.0,
                    has_explicit_preference=False,
                    notes="Single occupancy (preference_queue_louvain strategy)",
                )
                for s in students
            ]
            return groups, []

        id_to_student = {s.id: s for s in students}
        explicit_pairs: set = set()
        for s in students:
            for rid in _get_explicit_roommate_ids(s):
                if rid in id_to_student:
                    explicit_pairs.add((min(s.id, rid), max(s.id, rid)))

        G = nx.Graph()
        for s in students:
            G.add_node(s.id)

        for i, s1 in enumerate(students):
            for s2 in students[i + 1:]:
                base_score = compute_compatibility(s1, s2)
                pair = (min(s1.id, s2.id), max(s1.id, s2.id))
                bonus = EXPLICIT_PREFERENCE_BONUS if pair in explicit_pairs else 0.0
                weight = base_score + bonus
                if weight > 0:
                    G.add_edge(s1.id, s2.id, weight=weight, base_score=base_score)

        partition: Dict[int, int] = community_louvain.best_partition(
            G, weight="weight", resolution=1.0, randomize=False,
        )

        communities: Dict[int, List[int]] = {}
        for student_id, comm_id in partition.items():
            communities.setdefault(comm_id, []).append(student_id)

        sized_groups = self._resize_communities(list(communities.values()), group_size, G)

        groups: List[RoommateGroup] = []
        for member_ids in sized_groups:
            avg_score = self._avg_pairwise_score(member_ids, G, attr="base_score")
            has_exp = any(
                (min(a, b), max(a, b)) in explicit_pairs
                for i, a in enumerate(member_ids)
                for b in member_ids[i + 1:]
            )
            names = [id_to_student[sid].full_name for sid in member_ids if sid in id_to_student]
            note = "Preference queue strategy"
            if has_exp:
                note += "; explicit preference honored"
            groups.append(RoommateGroup(
                student_ids=member_ids,
                student_names=names,
                room_type=category,
                gender=gender,
                compatibility_score=avg_score,
                has_explicit_preference=has_exp,
                notes=note,
            ))

        allocated_ids = {sid for g in groups for sid in g.student_ids}
        leftover = [s.id for s in students if s.id not in allocated_ids]
        return groups, leftover

    # ── Resize utilities ───────────────────────────────────────────────────────

    def _resize_communities(
        self,
        communities: List[List[int]],
        target_size: int,
        G: nx.Graph,
    ) -> List[List[int]]:
        pool: List[int] = []
        exact_groups: List[List[int]] = []
        for community in communities:
            if len(community) == target_size:
                exact_groups.append(community)
            elif len(community) > target_size:
                sub, remainder = self._greedy_split(community, target_size, G)
                exact_groups.extend(sub)
                pool.extend(remainder)
            else:
                pool.extend(community)
        while len(pool) >= target_size:
            group = self._pick_best_group(pool, target_size, G)
            exact_groups.append(group)
            for sid in group:
                pool.remove(sid)
        return exact_groups

    def _greedy_split(
        self, members: List[int], size: int, G: nx.Graph
    ) -> Tuple[List[List[int]], List[int]]:
        groups = []
        remaining = list(members)
        while len(remaining) >= size:
            group = self._pick_best_group(remaining, size, G)
            groups.append(group)
            for sid in group:
                remaining.remove(sid)
        return groups, remaining

    def _pick_best_group(self, pool: List[int], size: int, G: nx.Graph) -> List[int]:
        from itertools import combinations
        best_combo = pool[:size]
        best_score = -1.0
        for combo in combinations(pool, size):
            score = self._avg_pairwise_score(list(combo), G)
            if score > best_score:
                best_score = score
                best_combo = list(combo)
        return best_combo

    @staticmethod
    def _avg_pairwise_score(
        member_ids: List[int], G: nx.Graph, attr: str = "weight"
    ) -> float:
        total, count = 0.0, 0
        for i, a in enumerate(member_ids):
            for b in member_ids[i + 1:]:
                if G.has_edge(a, b):
                    total += G[a][b].get(attr, G[a][b].get("weight", 0.0))
                count += 1
        avg = round(total / count, 2) if count > 0 else 0.0
        return min(100.0, avg)

    @staticmethod
    def _resolve_group_ac_preference(prefs: List[str]) -> str:
        unique = {p for p in prefs if p}
        if not unique or unique == {"BOTH"}:
            return "BOTH"
        if unique.issubset({"AC", "BOTH"}):
            return "AC"
        if unique.issubset({"NON_AC", "BOTH"}):
            return "NON_AC"
        return "BOTH"
