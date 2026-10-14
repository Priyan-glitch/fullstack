"""
Graph-Based Clustering Strategy using the Louvain community detection algorithm.

How it works
─────────────
1. Build a weighted compatibility graph where every student is a node.
2. Add a weighted edge between every pair of same-gender, same-roomType students.
   Edge weight = compatibility_score(student_a, student_b).
3. Give explicit preferred-roommate pairs a very high bonus edge weight (+100)
   so Louvain almost always keeps them together.
4. Run Louvain community detection to partition the graph into natural clusters.
5. Post-process clusters:
   a. Split oversized clusters, merge undersized ones.
   b. Assign each cluster to a matching available room (same sharing type, AC match).
6. Return AllocationResult with groups and any unallocated students.

Compatibility Scoring Weights
──────────────────────────────
Field                   Weight
──────────────────────────────
Explicit preference      +100  (bonus — NOT part of max score)
Study timing (sleep)      20
Wake up time              15
Study timing (M/N)        20
Noise preference          15
Cleanliness level         15
Study preference          10
AC preference             10
Social preference         10
Visitor preference         5
──────────────────────────────
Max base score           100
"""

from __future__ import annotations

import logging
from typing import List, Optional, Dict, Tuple
import networkx as nx
import community as community_louvain   # python-louvain

from app.schemas.student import StudentData
from app.schemas.room import RoomData
from app.strategies.base import AlgorithmStrategy, AllocationResult, RoommateGroup

logger = logging.getLogger(__name__)

# ── Scoring weights ────────────────────────────────────────────────────────────
EXPLICIT_PREFERENCE_BONUS = 100.0

WEIGHTS = {
    "sleep_time": 20,
    "wake_up_time": 15,
    "study_timing": 20,
    "noise_preference": 15,
    "cleanliness_level": 15,
    "study_preference": 10,
    "ac_preference": 10,
    "social_preference": 10,
    "visitor_preference": 5,
}
MAX_BASE_SCORE = sum(WEIGHTS.values())   # 100


# ── Helpers ────────────────────────────────────────────────────────────────────

def _normalize(val: Optional[str]) -> Optional[str]:
    return val.strip().upper() if val else None


def _score_string_match(a: Optional[str], b: Optional[str], weight: int) -> float:
    """Award full weight if both values match, 0 otherwise. None is treated as wildcard (half score)."""
    na, nb = _normalize(a), _normalize(b)
    if na is None or nb is None:
        return weight * 0.5          # one side unknown — partial credit
    return float(weight) if na == nb else 0.0


def _score_cleanliness(a: Optional[int], b: Optional[int], weight: int) -> float:
    """Score inversely proportional to the absolute difference (0–4 scale → max diff 4)."""
    if a is None or b is None:
        return weight * 0.5
    diff = abs(a - b)
    return weight * max(0.0, 1.0 - diff / 4.0)


def _score_ac(a: Optional[str], b: Optional[str], weight: int) -> float:
    """
    AC preference compatibility.
    Both AC → full score.  Both NON_AC → full score.
    One is BOTH → full score.  Mismatch (AC vs NON_AC) → 0.
    """
    na, nb = _normalize(a), _normalize(b)
    if na is None or nb is None:
        return weight * 0.5
    if "BOTH" in (na, nb):
        return float(weight)
    return float(weight) if na == nb else 0.0


def compute_compatibility(s1: StudentData, s2: StudentData) -> float:
    """
    Compute a compatibility score in [0, MAX_BASE_SCORE] between two students.
    Does NOT include the explicit-preference bonus.
    """
    p1 = s1.preference
    p2 = s2.preference
    if p1 is None or p2 is None:
        return 0.0

    score = 0.0
    score += _score_string_match(p1.sleepTime,        p2.sleepTime,        WEIGHTS["sleep_time"])
    score += _score_string_match(p1.wakeUpTime,       p2.wakeUpTime,       WEIGHTS["wake_up_time"])
    score += _score_string_match(p1.studyTiming,      p2.studyTiming,      WEIGHTS["study_timing"])
    score += _score_string_match(p1.noisePreference,  p2.noisePreference,  WEIGHTS["noise_preference"])
    score += _score_cleanliness(p1.cleanlinessLevel,  p2.cleanlinessLevel, WEIGHTS["cleanliness_level"])
    score += _score_string_match(p1.studyPreference,  p2.studyPreference,  WEIGHTS["study_preference"])
    score += _score_ac(p1.acPreference,               p2.acPreference,     WEIGHTS["ac_preference"])
    score += _score_string_match(p1.socialPreference, p2.socialPreference, WEIGHTS["social_preference"])
    score += _score_string_match(p1.visitorPreference,p2.visitorPreference,WEIGHTS["visitor_preference"])
    return round(score, 2)


def _get_explicit_roommate_ids(student: StudentData) -> List[int]:
    """Parse comma-separated preferredRoommateIds into a list of ints."""
    if not student.preference or not student.preference.preferredRoommateIds:
        return []
    raw = student.preference.preferredRoommateIds
    ids = []
    for part in raw.split(","):
        part = part.strip()
        if part.isdigit():
            ids.append(int(part))
    return ids


def _room_type_key(student: StudentData) -> str:
    """Normalise to 'INDIVIDUAL', '2_SHARING', '3_SHARING', or '4_SHARING'."""
    rt = (student.preference.roomType or "2_SHARING") if student.preference else "2_SHARING"
    rt_upper = rt.upper()
    if "1" in rt_upper or "INDIVIDUAL" in rt_upper or "SINGLE" in rt_upper:
        return "INDIVIDUAL"
    if "4" in rt_upper:
        return "4_SHARING"
    if "3" in rt_upper:
        return "3_SHARING"
    return "2_SHARING"


def _ac_preference(student: StudentData) -> str:
    if not student.preference or not student.preference.acPreference:
        return "BOTH"
    return _normalize(student.preference.acPreference) or "BOTH"


def _room_compatible(room: RoomData, group_size: int, ac_pref: str) -> bool:
    """Check if a room can host a group given size and AC preference."""
    if not room.is_available:
        return False
    if room.sharing_count != group_size:
        return False
    # AC constraint: AC-preferred students must have an AC room.
    # NON_AC students can't go to an AC-only room.
    # BOTH is compatible with anything.
    if ac_pref == "AC" and not room.is_ac:
        return False
    if ac_pref == "NON_AC" and room.is_ac:
        return False
    return True


# ── Main Strategy ──────────────────────────────────────────────────────────────

class GraphClusteringStrategy(AlgorithmStrategy):

    @property
    def name(self) -> str:
        return "graph_clustering"

    @property
    def description(self) -> str:
        return (
            "Builds a weighted compatibility graph between students and runs "
            "Louvain community detection to find natural roommate clusters. "
            "Explicit roommate preferences receive a large bonus weight to "
            "ensure they are almost always honored."
        )

    def run(self, students: List[StudentData], rooms: List[RoomData]) -> AllocationResult:
        logger.info("GraphClusteringStrategy: starting with %d students, %d rooms",
                    len(students), len(rooms))

        if not students:
            return AllocationResult()

        # ── Step 1: Segment students by (gender, room_type) ───────────────────
        # Allocation is always within the same gender & room-type bucket.
        buckets: Dict[Tuple[str, str], List[StudentData]] = {}
        for s in students:
            gender = _normalize(s.gender) or "UNKNOWN"
            rt = _room_type_key(s)
            key = (gender, rt)
            buckets.setdefault(key, []).append(s)

        all_groups: List[RoommateGroup] = []
        all_unallocated: List[int] = []
        available_rooms = list(rooms)   # mutable copy

        for (gender, room_type), bucket in buckets.items():
            if room_type == "INDIVIDUAL":
                group_size = 1
            elif room_type == "4_SHARING":
                group_size = 4
            elif room_type == "3_SHARING":
                group_size = 3
            else:
                group_size = 2
            logger.info("  Bucket (%s, %s): %d students", gender, room_type, len(bucket))

            groups, unallocated = self._cluster_bucket(bucket, group_size, gender, room_type)

            # ── Step 2: Assign rooms ──────────────────────────────────────────
            for group in groups:
                # Representative AC preference for the group
                # Policy: if any student wants AC, try AC; if any wants NON_AC, respect that
                prefs = [_ac_preference(s) for s in bucket if s.id in group.student_ids]
                ac_pref = self._resolve_group_ac_preference(prefs)

                assigned = False
                for room in available_rooms:
                    if _room_compatible(room, group_size, ac_pref):
                        group.assigned_room_id = room.id
                        group.assigned_room_number = room.roomNumber
                        group.assigned_hostel_id = room.hostelId
                        available_rooms.remove(room)
                        assigned = True
                        break

                if not assigned and available_rooms:
                    # Fallback: assign closest available room
                    room = next((r for r in available_rooms if r.sharing_count == group_size), available_rooms[0])
                    group.assigned_room_id = room.id
                    group.assigned_room_number = room.roomNumber
                    group.assigned_hostel_id = room.hostelId
                    available_rooms.remove(room)
                    assigned = True
                    group.notes = (group.notes or "") + " [Fallback room assigned]"

                if not assigned:
                    group.notes = (group.notes or "") + " [No matching room available]"
                    logger.warning("    No room found for group %s", group.student_ids)

                all_groups.append(group)

            all_unallocated.extend(unallocated)

        # ── Step 3: Fallback Allocation for Leftover Students ─────────────────
        if all_unallocated and available_rooms:
            logger.info("Applying fallback allocation for %d leftover students...", len(all_unallocated))
            fallback_groups, still_unallocated = self._apply_fallback_allocation(
                all_unallocated, students, available_rooms
            )
            all_groups.extend(fallback_groups)
            all_unallocated = still_unallocated

        result = AllocationResult(groups=all_groups, unallocated_student_ids=all_unallocated)
        logger.info(
            "GraphClusteringStrategy: done. %d groups, %d allocated, %d unallocated.",
            len(result.groups), result.allocated_count, result.unallocated_count,
        )
        return result

    # ── Internal helpers ───────────────────────────────────────────────────────

    def _apply_fallback_allocation(
        self,
        unallocated_ids: List[int],
        students: List[StudentData],
        available_rooms: List[RoomData],
    ) -> Tuple[List[RoommateGroup], List[int]]:
        """
        Fallback allocation rule:
        When students cannot form full groups under strict partitioning (e.g. odd number
        of applicants or mismatched sharing preferences), allocate them to remaining available rooms.
        1. Segment leftovers by gender (students of the same gender can share rooms).
        2. Pair or group leftover students together based on lifestyle compatibility.
        3. If an odd student remains and surplus rooms exist, assign as single occupant.
        """
        id_to_student = {s.id: s for s in students}
        leftovers = [id_to_student[sid] for sid in unallocated_ids if sid in id_to_student]

        by_gender: Dict[str, List[StudentData]] = {}
        for s in leftovers:
            g = _normalize(s.gender) or "UNKNOWN"
            by_gender.setdefault(g, []).append(s)

        fallback_groups: List[RoommateGroup] = []
        still_unallocated: List[int] = []

        for gender, g_students in by_gender.items():
            # Step A: Pair students of same gender if >= 2
            while len(g_students) >= 2 and available_rooms:
                best_i, best_j = 0, 1
                best_score = compute_compatibility(g_students[0], g_students[1])
                for i in range(len(g_students)):
                    for j in range(i + 1, len(g_students)):
                        sc = compute_compatibility(g_students[i], g_students[j])
                        if sc > best_score:
                            best_score = sc
                            best_i, best_j = i, j

                s1 = g_students.pop(max(best_i, best_j))
                s2 = g_students.pop(min(best_i, best_j))
                score = best_score
                ac_pref = self._resolve_group_ac_preference([_ac_preference(s1), _ac_preference(s2)])

                # Find room: 1) exact AC match, 2) 2-sharing, 3) any room
                room = next((r for r in available_rooms if _room_compatible(r, 2, ac_pref)), None)
                if not room:
                    room = next((r for r in available_rooms if r.sharing_count == 2), None)
                if not room and available_rooms:
                    room = available_rooms[0]

                if room:
                    available_rooms.remove(room)
                    fallback_groups.append(RoommateGroup(
                        student_ids=[s1.id, s2.id],
                        student_names=[s1.full_name, s2.full_name],
                        room_type=room.roomType or "2-SHARING",
                        gender=gender,
                        compatibility_score=score,
                        assigned_room_id=room.id,
                        assigned_room_number=room.roomNumber,
                        assigned_hostel_id=room.hostelId,
                        notes="Fallback allocation: paired leftover roommates",
                    ))
                else:
                    g_students.extend([s1, s2])
                    break

            # Step B: If 1 student remains and rooms are available, assign as single occupant
            while len(g_students) >= 1 and available_rooms:
                s = g_students.pop(0)
                ac_pref = _ac_preference(s)
                room = next((r for r in available_rooms if _room_compatible(r, r.sharing_count, ac_pref)), None)
                if not room and available_rooms:
                    room = available_rooms[0]

                if room:
                    available_rooms.remove(room)
                    fallback_groups.append(RoommateGroup(
                        student_ids=[s.id],
                        student_names=[s.full_name],
                        room_type=room.roomType or "2-SHARING",
                        gender=gender,
                        compatibility_score=100.0,
                        assigned_room_id=room.id,
                        assigned_room_number=room.roomNumber,
                        assigned_hostel_id=room.hostelId,
                        notes="Fallback allocation: single occupant (partial room occupancy)",
                    ))
                else:
                    g_students.append(s)
                    break

            # Any students who still couldn't get a room
            still_unallocated.extend([s.id for s in g_students])

        return fallback_groups, still_unallocated

    def _cluster_bucket(
        self,
        students: List[StudentData],
        group_size: int,
        gender: str,
        room_type: str,
    ) -> Tuple[List[RoommateGroup], List[int]]:
        """
        Build a weighted graph for students in this bucket and run Louvain.
        Returns (groups, unallocated_ids).
        """
        if len(students) < group_size:
            logger.warning("    Not enough students (%d) to form a group of %d",
                           len(students), group_size)
            return [], [s.id for s in students]

        if group_size == 1:
            groups = [
                RoommateGroup(
                    student_ids=[s.id],
                    student_names=[s.full_name],
                    room_type=room_type,
                    gender=gender,
                    compatibility_score=100.0,
                    has_explicit_preference=False,
                    notes="Single occupancy room",
                )
                for s in students
            ]
            return groups, []

        id_to_student: Dict[int, StudentData] = {s.id: s for s in students}
        explicit_pairs: set = set()

        # Build explicit preference pairs (bidirectional)
        for s in students:
            for rid in _get_explicit_roommate_ids(s):
                if rid in id_to_student:
                    explicit_pairs.add((min(s.id, rid), max(s.id, rid)))

        # ── Build compatibility graph ─────────────────────────────────────────
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

        # ── Louvain community detection ───────────────────────────────────────
        # resolution parameter: lower = larger communities (good for small groups)
        partition: Dict[int, int] = community_louvain.best_partition(
            G,
            weight="weight",
            resolution=1.0,
            randomize=False,   # deterministic runs for reproducibility
        )

        # Group students by Louvain community label
        communities: Dict[int, List[int]] = {}
        for student_id, comm_id in partition.items():
            communities.setdefault(comm_id, []).append(student_id)

        # ── Post-process: split/merge to exact group_size ─────────────────────
        sized_groups = self._resize_communities(
            list(communities.values()), group_size, G
        )

        # ── Build RoommateGroup objects ───────────────────────────────────────
        groups: List[RoommateGroup] = []
        for member_ids in sized_groups:
            avg_score = self._avg_pairwise_score(member_ids, G, attr="base_score")
            has_exp = any(
                (min(a, b), max(a, b)) in explicit_pairs
                for i, a in enumerate(member_ids)
                for b in member_ids[i + 1:]
            )
            names = [id_to_student[sid].full_name for sid in member_ids if sid in id_to_student]
            note_parts = []
            if has_exp:
                note_parts.append("Explicit preference honored")
            groups.append(RoommateGroup(
                student_ids=member_ids,
                student_names=names,
                room_type=room_type,
                gender=gender,
                compatibility_score=avg_score,
                has_explicit_preference=has_exp,
                notes="; ".join(note_parts) if note_parts else None,
            ))

        # Any students not in a group → unallocated
        allocated_ids = {sid for g in groups for sid in g.student_ids}
        unallocated = [s.id for s in students if s.id not in allocated_ids]
        return groups, unallocated

    def _resize_communities(
        self,
        communities: List[List[int]],
        target_size: int,
        G: nx.Graph,
    ) -> List[List[int]]:
        """
        Adjust Louvain communities so each has exactly target_size members.
        - Large communities are split greedily (highest-weight sub-groups first).
        - Small communities are merged with the most-compatible remaining pool.
        - Leftover students (cannot form a full group) go to unallocated.
        """
        pool: List[int] = []
        exact_groups: List[List[int]] = []

        for community in communities:
            if len(community) == target_size:
                exact_groups.append(community)
            elif len(community) > target_size:
                # Split: greedily form sub-groups of target_size
                sub, remainder = self._greedy_split(community, target_size, G)
                exact_groups.extend(sub)
                pool.extend(remainder)
            else:
                pool.extend(community)

        # Try to form more groups from the pool
        while len(pool) >= target_size:
            # Take the target_size most-compatible students from the pool
            group = self._pick_best_group(pool, target_size, G)
            exact_groups.append(group)
            for sid in group:
                pool.remove(sid)

        # Remaining pool members cannot be grouped → unallocated
        # (handled by the caller)
        return exact_groups

    def _greedy_split(
        self,
        members: List[int],
        size: int,
        G: nx.Graph,
    ) -> Tuple[List[List[int]], List[int]]:
        """Split a community larger than size into chunks of exactly size."""
        groups = []
        remaining = list(members)
        while len(remaining) >= size:
            group = self._pick_best_group(remaining, size, G)
            groups.append(group)
            for sid in group:
                remaining.remove(sid)
        return groups, remaining

    def _pick_best_group(self, pool: List[int], size: int, G: nx.Graph) -> List[int]:
        """
        From pool, select size students that maximise total pairwise edge weight.
        Brute-force is fine for small groups (size=2 or 3).
        """
        from itertools import combinations
        best_combo = pool[:size]   # fallback
        best_score = -1.0
        for combo in combinations(pool, size):
            score = self._avg_pairwise_score(list(combo), G)
            if score > best_score:
                best_score = score
                best_combo = list(combo)
        return best_combo

    @staticmethod
    def _avg_pairwise_score(member_ids: List[int], G: nx.Graph, attr: str = "weight") -> float:
        """Average edge weight or base_score among all pairs in the group, capped at 100.0."""
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
        """
        Determine a single AC preference label that represents the whole group.
        Policy:
          - All BOTH → BOTH
          - Any AC (and no NON_AC) → AC
          - Any NON_AC (and no AC) → NON_AC
          - Conflict (AC + NON_AC) → BOTH (find a room that works for all)
        """
        unique = set(p for p in prefs if p)
        if not unique or unique == {"BOTH"}:
            return "BOTH"
        ac_only = {"AC", "BOTH"}
        nonac_only = {"NON_AC", "BOTH"}
        if unique.issubset(ac_only):
            return "AC"
        if unique.issubset(nonac_only):
            return "NON_AC"
        return "BOTH"   # conflict → accept any room
