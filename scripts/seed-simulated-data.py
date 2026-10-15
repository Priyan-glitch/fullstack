#!/usr/bin/env python3
"""
Seeds Stable Roomies with simulated students, hostels, rooms and preferences.

Everything goes through the API gateway, not the services directly. That is
deliberate: the gateway is what verifies JWTs, so a successful run proves the
whole request path — gateway -> auth-service -> service -> Postgres — actually
works rather than just that the tables exist.

Usage:
    python3 scripts/seed-simulated-data.py
    python3 scripts/seed-simulated-data.py --base-url http://localhost:8888
    python3 scripts/seed-simulated-data.py --reset   # delete seeded students first

Reads AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD from the repository .env to sign in
as the warden, which is the only account allowed to create hostels and rooms.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Shared password for every simulated student — they exist to be driven, not to
# be secure. Real accounts go through the UI.
STUDENT_PASSWORD = "Student@2026"

HOSTELS = [
    {
        "name": "Aravalli Block",
        "address": "North Campus, SSN College of Engineering",
        "totalCapacity": 60,
        "totalRooms": 24,
        "genderType": "MALE",
        "amenities": "WiFi, Laundry, Water Purifier, Common Room",
        "wardenName": "Mr. R. Sundaram",
        "wardenPhone": "9840012345",
    },
    {
        "name": "Nilgiri Block",
        "address": "South Campus, SSN College of Engineering",
        "totalCapacity": 36,
        "totalRooms": 14,
        "genderType": "FEMALE",
        "amenities": "WiFi, Laundry, Water Purifier, Study Hall",
        "wardenName": "Mrs. K. Lakshmi",
        "wardenPhone": "9840054321",
    },
]

# Room mix per hostel: alternating 2- and 3-sharing across three floors.
ROOM_PLAN = [
    ("2-SHARING", 2), ("2-SHARING", 2), ("3-SHARING", 3), ("2-SHARING", 2),
]

# id               first      last        dept                    yr sem gender  hostel  sleep      study          cleanliness  roommates
STUDENTS = [
    ("2310893", "Mohit",     "Reddy",     "Computer Science",       3, 5, "MALE",   0, "23:30", "NIGHT_OWL",    8, ["2310902", "2310895"]),
    ("2310902", "Kathir",    "Selvamani", "Computer Science",       3, 5, "MALE",   0, "23:00", "NIGHT_OWL",    7, ["2310893", "2310895"]),
    ("2310895", "Arjun",     "Menon",     "Information Technology", 3, 5, "MALE",   0, "23:45", "NIGHT_OWL",    8, ["2310893", "2310902"]),
    ("2310910", "Vikram",    "Rao",       "Electronics",            2, 3, "MALE",   0, "22:30", "MORNING_PERSON", 9, ["2310912"]),
    ("2310912", "Naveen",    "Kumar",     "Electronics",            2, 3, "MALE",   0, "22:15", "MORNING_PERSON", 9, ["2310910"]),
    ("2310918", "Sanjay",    "Iyer",      "Mechanical",             2, 3, "MALE",   0, "00:30", "FLEXIBLE",     5, ["2310921"]),
    ("2310921", "Rahul",     "Verma",     "Mechanical",             2, 3, "MALE",   0, "01:00", "FLEXIBLE",     4, ["2310918"]),
    ("2310925", "Aditya",    "Nair",      "Civil",                  1, 1, "MALE",   0, "23:00", "NIGHT_OWL",    6, []),
    ("2310930", "Priya",     "Ramesh",    "Computer Science",       3, 5, "FEMALE", 1, "22:45", "MORNING_PERSON", 9, ["2310933", "2310937"]),
    ("2310933", "Divya",     "Shankar",   "Computer Science",       3, 5, "FEMALE", 1, "22:30", "MORNING_PERSON", 9, ["2310930", "2310937"]),
    ("2310937", "Meera",     "Krishnan",  "Biomedical",             3, 5, "FEMALE", 1, "22:45", "MORNING_PERSON", 8, ["2310930", "2310933"]),
    ("2310941", "Ananya",    "Pillai",    "Electrical",             1, 1, "FEMALE", 1, "23:30", "NIGHT_OWL",    7, []),
]


class ApiError(RuntimeError):
    def __init__(self, status: int, body: str, method: str, path: str):
        super().__init__(f"{method} {path} -> HTTP {status}: {body[:200]}")
        self.status = status
        self.body = body


def call(base: str, method: str, path: str, *, token: str | None = None,
         payload: dict | None = None) -> tuple[int, dict | str | None]:
    """Returns (status, decoded body). Raises ApiError on 4xx/5xx unless the
    caller opts in via tolerate()."""
    url = f"{base}{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    if payload is not None:
        req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read().decode()
            status = resp.status
    except urllib.error.HTTPError as e:
        raw = e.read().decode(errors="replace")
        status = e.code
    except urllib.error.URLError as e:
        raise ApiError(0, f"connection failed: {e.reason}", method, path) from e

    try:
        body = json.loads(raw) if raw else None
    except json.JSONDecodeError:
        body = raw
    return status, body


def read_env() -> dict[str, str]:
    env: dict[str, str] = {}
    path = ROOT / ".env"
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def fail(msg: str) -> None:
    print(f"  \033[31m✘\033[0m {msg}")
    sys.exit(1)


def ok(msg: str) -> None:
    print(f"  \033[32m✔\033[0m {msg}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://localhost:8888")
    ap.add_argument("--reset", action="store_true",
                    help="delete existing seeded students before creating them")
    args = ap.parse_args()
    base = args.base_url.rstrip("/")

    env = read_env()
    admin_email = env.get("AUTH_ADMIN_EMAIL", "").strip()
    admin_password = env.get("AUTH_ADMIN_PASSWORD", "").strip()
    if not admin_email or not admin_password:
        fail("AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD missing from .env")

    print(f"Seeding {base}\n")

    # ── Gateway reachable? ────────────────────────────────────────────────────
    try:
        status, _ = call(base, "GET", "/api/hostels")
    except ApiError as e:
        fail(f"gateway unreachable — {e}")
    if status != 401:
        print(f"  ! expected 401 without a token, got {status} "
              f"(fine if you are running without the gateway)")
    else:
        ok("gateway is up and requires a token")

    # ── Warden signs in ───────────────────────────────────────────────────────
    status, body = call(base, "POST", "/api/auth/login",
                        payload={"email": admin_email, "password": admin_password})
    if status != 200:
        fail(f"admin login failed ({status}): {body}")
    admin_token = body["token"]
    ok(f"signed in as warden {admin_email}")

    # ── Hostels ───────────────────────────────────────────────────────────────
    print("\nHostels and rooms")
    # Look up what already exists up front. The API does not reject a duplicate
    # hostel name, so waiting for a conflict error never fired and every re-run
    # appended another copy of each hostel.
    _, listed = call(base, "GET", "/api/hostels", token=admin_token)
    by_name = {h["name"]: h["id"] for h in (listed if isinstance(listed, list) else [])}

    hostel_ids: list[int] = []
    for h in HOSTELS:
        if h["name"] in by_name:
            hostel_ids.append(by_name[h["name"]])
            ok(f"{h['name']} already exists (id {by_name[h['name']]})")
            continue

        payload = {**h, "availableCapacity": h["totalCapacity"], "active": True}
        status, body = call(base, "POST", "/api/hostels", token=admin_token, payload=payload)
        if status in (200, 201):
            hostel_ids.append(body["id"])
            ok(f"created {h['name']} (id {body['id']})")
        else:
            fail(f"creating {h['name']} failed ({status}): {body}")

    # ── Rooms ─────────────────────────────────────────────────────────────────
    # Same reasoning as hostels: room numbers are unique per hostel but the API
    # will happily create a second one, so skip what is already there.
    _, listed_rooms = call(base, "GET", "/api/rooms", token=admin_token)
    existing_rooms = {
        (r.get("hostelId"), r.get("roomNumber"))
        for r in (listed_rooms if isinstance(listed_rooms, list) else [])
    }

    rooms_created = 0
    for idx, hostel_id in enumerate(hostel_ids):
        for n in range(len(ROOM_PLAN) * 2):
            room_type, capacity = ROOM_PLAN[n % len(ROOM_PLAN)]
            floor = (n // 4) + 1
            payload = {
                "hostelId": hostel_id,
                "roomNumber": f"{chr(65 + idx)}{floor}0{(n % 4) + 1}",
                "floor": floor,
                "block": chr(65 + idx),
                "roomType": room_type,
                "capacity": capacity,
                "occupiedCount": 0,
                "status": "AVAILABLE",
                "amenities": "Fan, Desk, Wardrobe, WiFi",
            }
            if (hostel_id, payload["roomNumber"]) in existing_rooms:
                continue

            status, body = call(base, "POST", "/api/rooms", token=admin_token, payload=payload)
            if status in (200, 201):
                rooms_created += 1
            else:
                fail(f"creating room {payload['roomNumber']} failed ({status}): {body}")
    ok(f"{rooms_created} new rooms created (existing ones left alone)")

    # ── Students ──────────────────────────────────────────────────────────────
    print("\nSimulated students")
    created: list[dict] = []
    for (reg, first, last, dept, year, sem, gender, h_idx, sleep, study, clean, mates) in STUDENTS:
        email = f"{reg}@ssn.edu.in"

        # 1. Identity in auth-service.
        status, body = call(base, "POST", "/api/auth/register", payload={
            "email": email, "password": STUDENT_PASSWORD,
            "firstName": first, "lastName": last,
        })
        if status == 201:
            token = body["token"]
        elif status == 409:
            status, body = call(base, "POST", "/api/auth/login",
                                payload={"email": email, "password": STUDENT_PASSWORD})
            if status != 200:
                fail(f"{email} exists in auth-service but could not sign in ({status})")
            token = body["token"]
        else:
            fail(f"registering {email} failed ({status}): {body}")

        # 2. Profile in student-service.
        #
        # This uses the ADMIN token, not the student's. Creating a student record
        # is an administrative action — `POST /api/students` is the collection
        # root, which the gateway restricts to role=admin. A student's own token
        # is correctly refused with 403. Registering the account above is still
        # done with the public endpoint, since that is self-service.
        status, body = call(base, "POST", "/api/students", token=admin_token, payload={
            "registerNumber": reg, "firstName": first, "lastName": last,
            "email": email,
            "phone": f"98400{reg[2:]}", "department": dept,
            "year": year, "semester": sem, "gender": gender,
            "city": "Chennai", "state": "Tamil Nadu", "pincode": "603110",
            "guardianName": f"{last} Sr.", "guardianPhone": f"98410{reg[2:]}",
            "guardianRelation": "Father",
        })
        if status == 201:
            student_id = body["id"]
            action = "created"
        elif status in (400, 409) and "already exists" in str(body).lower():
            _, found = call(base, "GET", f"/api/students/register-number/{reg}",
                            token=admin_token)
            student_id = found["id"]
            action = "existing"
        else:
            fail(f"creating student profile for {email} failed ({status}): {body}")

        # 3. Preferences, used by the allocation algorithm.
        status, body = call(base, "POST", f"/api/preferences/student/{student_id}",
                            token=token, payload={
            "studentId": student_id,
            "roomType": "2_SHARING",
            "acPreference": "NON_AC",
            "roomTypePreference1": "2_SHARING",
            "roomTypePreference2": "3_SHARING",
            "roomTypePreference3": "2_SHARING",
            "preferredRoommateIds": ",".join(mates),
            "sleepTime": sleep, "wakeUpTime": "07:00",
            "studyTiming": study, "noisePreference": "QUIET",
            "cleanlinessLevel": clean, "studyPreference": "GROUP_STUDY",
            "studyFrequency": "DAILY", "studyEnvironment": "QUIET",
            "socialPreference": "MODERATE", "personalSpace": "MODERATE",
            "visitorPreference": "RARELY", "submitted": True,
        })
        if status in (200, 201):
            prefs = "set"
        elif "already been submitted" in str(body).lower():
            # Preferences lock after the first submission — correct behaviour, and
            # it means this student was seeded on an earlier run. Not an error.
            prefs = "locked"
        else:
            fail(f"submitting preferences for {email} failed ({status}): {body}")

        created.append({"id": student_id, "email": email, "name": f"{first} {last}",
                        "hostel": HOSTELS[h_idx]["name"], "action": action,
                        "prefs": prefs})
        print(f"  {'·' if action == 'existing' else '+'} {email:<22} id={student_id:<4} "
              f"{first} {last}  (prefs {prefs})")

    print(f"\n\033[1mSeeded {len(created)} students, {len(hostel_ids)} hostels, "
          f"{rooms_created} new rooms.\033[0m")
    print(f"\nEvery simulated student signs in with password: {STUDENT_PASSWORD}")
    print("Example:", created[0]["email"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
