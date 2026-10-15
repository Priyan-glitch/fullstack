#!/usr/bin/env python3
"""Generate SQL that seeds StableRoomie with simulated room types and students.

Emits SQL on stdout and a human-readable plan on stderr, so it can be piped
straight into psql:

    python3 simulate_data.py | psql "$DB_URL"

The generated SQL WIPES and REPLACES the student, rooms, room_groups and
allotment tables before inserting the simulation, and re-opens the preference
window. Only run it against a development database.

Lifestyle values use the exact option codes from the student preference form in
src/main/resources/templates/index.html, because the matching algorithm compares
them with exact string equality.

The simulation is deliberately tuned so that the room counts are tight:

  room type   capacity  total_rooms  beds
  1-Sharing      1          3          3
  2-Sharing      2          8         16
  3-Sharing      3          8         24
  4-Sharing      4          5         20
                                       63 beds for 66 students

Students are inserted with increasing updated_at timestamps, and the allotment
fills room types in updated_at order. The intended outcome is:

  3-Sharing  24 students ->  8 rooms (exactly full)
  2-Sharing  16 students ->  8 rooms (exactly full)
  4-Sharing  17 students ->  5 rooms (4+4+4+4+1: one partial room)
  1-Sharing   3 students ->  3 rooms
  unallotted  6 students -> no room (all three choices already full)
"""

import random
import sys
from datetime import datetime, timedelta

SEED = 20261015
FIRST_NAMES = [
    "Aarav", "Diya", "Vihaan", "Ananya", "Arjun", "Ishita", "Rohan", "Meera",
    "Karthik", "Sneha", "Aditya", "Priya", "Nikhil", "Tanvi", "Rahul", "Kavya",
    "Siddharth", "Nithya", "Varun", "Divya", "Hari", "Lakshmi", "Vikram", "Swetha",
    "Ashwin", "Pooja", "Kiran", "Deepika", "Manoj", "Anjali", "Surya", "Bhavana",
    "Naveen", "Charu", "Praveen", "Gayathri", "Aravind", "Nandini", "Sandeep", "Ramya",
    "Vishal", "Keerthi", "Ajay", "Sowmya", "Balaji", "Harini", "Gokul", "Varsha",
    "Mohan", "Ishwarya", "Ravi", "Aishwarya", "Kishore", "Pavithra", "Dinesh", "Sridevi",
    "Arun", "Janani", "Sathish", "Vaishnavi", "Ramesh", "Neha", "Vijay", "Sushma",
    "Kumaran", "Preethi",
]
LAST_NAMES = [
    "Kumar", "Sharma", "Reddy", "Nair", "Iyer", "Menon", "Rao", "Pillai",
    "Verma", "Das", "Krishnan", "Subramanian", "Bhat", "Chandran", "Gupta",
    "Naidu", "Murthy", "Sundaram", "Rajan", "Bose",
]
STREETS = [
    "Gandhi Street", "Anna Nagar 2nd Avenue", "MG Road", "Nehru Street",
    "Velachery Main Road", "T Nagar 4th Cross", "Besant Nagar Beach Road",
    "Adyar Depot Road", "Chromepet Station Road", "Porur Link Road",
]
CITIES = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Vellore", "Erode", "Tirunelveli"]

# (room_type, capacity, total_rooms)
ROOM_TYPES = [
    ("1-Sharing", 1, 3),
    ("2-Sharing", 2, 8),
    ("3-Sharing", 3, 8),
    ("4-Sharing", 4, 5),
]

# Lifestyle archetypes. Every value is a valid <option value="..."> from the
# preference form.
ARCHETYPES = {
    "early": {
        "sleep_time": "10:00 PM", "wake_time": "5:00 AM", "noise_level": "silent",
        "light_sensitivity": "no-light", "cleanliness": "very-clean",
        "study_habits": "silent", "study_time": "early-morning",
    },
    "balanced": {
        "sleep_time": "11:00 PM", "wake_time": "7:00 AM", "noise_level": "low",
        "light_sensitivity": "any-light", "cleanliness": "moderately-clean",
        "study_habits": "silent", "study_time": "evening",
    },
    "owl": {
        "sleep_time": "1:00 AM", "wake_time": "9:00 AM", "noise_level": "moderate",
        "light_sensitivity": "any-light", "cleanliness": "casual",
        "study_habits": "group", "study_time": "late-night",
    },
    "music": {
        "sleep_time": "12:00 AM", "wake_time": "8:00 AM", "noise_level": "moderate",
        "light_sensitivity": "any-light", "cleanliness": "moderately-clean",
        "study_habits": "music", "study_time": "night",
    },
}

# Same department -> similar schedule, which is how real hostel cohorts behave.
DEPT_ARCHETYPE = {
    "CSE": "owl", "IT": "owl",
    "ECE": "balanced", "EEE": "balanced",
    "MECH": "early", "CIVIL": "early",
    "BME": "music", "AI&DS": "music",
}

# cohort -> (count, pref1, pref2, pref3)
# Ordered by processing priority: the waves are inserted in this order and the
# last wave is meant to be squeezed out entirely.
COHORTS = [
    (30, "3-Sharing", "4-Sharing", "2-Sharing"),
    (16, "2-Sharing", "4-Sharing", "1-Sharing"),
    (10, "4-Sharing", "2-Sharing", "1-Sharing"),
    (4, "1-Sharing", "2-Sharing", "4-Sharing"),
    (6, "2-Sharing", "3-Sharing", "1-Sharing"),
]

# Explicit mutual preferences that exercise pass 1 of the matcher.
# Mutually-requested trios (3-Sharing has capacity 3) and a mutually-requested
# pair (2-Sharing has capacity 2).
MUTUAL_TRIOS = [(1001, 1002, 1003), (1004, 1005, 1006)]
MUTUAL_PAIRS = [(1031, 1032)]

START_ID = 1001
BASE_TIME = datetime(2026, 10, 10, 9, 0, 0)
STEP_MINUTES = 4


def sql_str(value):
    """Render a Python value as a SQL literal."""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, int):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def build_students():
    rng = random.Random(SEED)
    students = []
    dept_cycle = list(DEPT_ARCHETYPE.keys())
    next_id = START_ID

    for wave_index, (count, pref1, pref2, pref3) in enumerate(COHORTS):
        for offset in range(count):
            sid = next_id
            next_id += 1

            department = dept_cycle[(offset + wave_index * 3) % len(dept_cycle)]
            archetype = ARCHETYPES[DEPT_ARCHETYPE[department]]

            first = FIRST_NAMES[sid % len(FIRST_NAMES)]
            last = LAST_NAMES[(sid * 7) % len(LAST_NAMES)]
            name = f"{first} {last}"

            submitted_at = BASE_TIME + timedelta(
                minutes=(sid - START_ID) * STEP_MINUTES
            )

            students.append({
                "student_id": sid,
                "name": name,
                "email": f"sim{sid}@ssn.edu.in",
                "clg": "snu" if rng.random() < 0.12 else "ssn",
                "student_year": ["2nd", "3rd", "2nd", "4th", "1st"][sid % 5],
                "department": department,
                "phone": f"98{rng.randint(40000000, 49999999)}",
                "room_type_pref_1": pref1,
                "room_type_pref_2": pref2,
                "room_type_pref_3": pref3,
                "preferred_roommates": "",
                "location": "non-chennai" if rng.random() < 0.38 else "chennai",
                "address": f"{rng.randint(1, 120)} {STREETS[sid % len(STREETS)]}, "
                           f"{CITIES[(sid * 3) % len(CITIES)]}",
                "emergency_contact": f"{name.split()[1]} {rng.randint(9000000000, 9999999999)}",
                "created_at": submitted_at,
                "updated_at": submitted_at,
                **archetype,
            })

    by_id = {s["student_id"]: s for s in students}
    for group in MUTUAL_TRIOS + MUTUAL_PAIRS:
        for sid in group:
            if sid in by_id:
                by_id[sid]["preferred_roommates"] = ", ".join(
                    str(other) for other in group if other != sid
                )

    return students


def emit_sql(students):
    out = sys.stdout
    out.write("-- Generated by simulate_data.py - development simulation data.\n")
    out.write("BEGIN;\n\n")

    out.write("TRUNCATE TABLE allotment, room_groups, rooms, student RESTART IDENTITY;\n\n")

    out.write("-- Preference window must be open for students to submit.\n")
    out.write(
        "INSERT INTO settings (setting_id, preferences_open) VALUES (1, TRUE)\n"
        "ON CONFLICT (setting_id) DO UPDATE SET preferences_open = TRUE;\n\n"
    )

    out.write("-- Room types.\n")
    for room_type, capacity, total_rooms in ROOM_TYPES:
        out.write(
            f"INSERT INTO rooms (room_type, capacity, total_rooms) VALUES "
            f"({sql_str(room_type)}, {capacity}, {total_rooms});\n"
        )
    out.write("\n")

    out.write(f"-- Students ({len(students)}).\n")
    for s in students:
        out.write(
            "INSERT INTO student (student_id, address, cleanliness, clg, created_at, "
            "department, email, emergency_contact, light_sensitivity, location, name, "
            "noise_level, phone, preferred_roommates, room_type_pref_1, room_type_pref_2, "
            "room_type_pref_3, sleep_time, study_habits, study_time, updated_at, "
            "wake_time, student_year) VALUES ("
            + ", ".join([
                sql_str(s["student_id"]), sql_str(s["address"]), sql_str(s["cleanliness"]),
                sql_str(s["clg"]), sql_str(s["created_at"].strftime("%Y-%m-%d %H:%M:%S")),
                sql_str(s["department"]), sql_str(s["email"]), sql_str(s["emergency_contact"]),
                sql_str(s["light_sensitivity"]), sql_str(s["location"]), sql_str(s["name"]),
                sql_str(s["noise_level"]), sql_str(s["phone"]), sql_str(s["preferred_roommates"]),
                sql_str(s["room_type_pref_1"]), sql_str(s["room_type_pref_2"]),
                sql_str(s["room_type_pref_3"]), sql_str(s["sleep_time"]),
                sql_str(s["study_habits"]), sql_str(s["study_time"]),
                sql_str(s["updated_at"].strftime("%Y-%m-%d %H:%M:%S")),
                sql_str(s["wake_time"]), sql_str(s["student_year"]),
            ])
            + ");\n"
        )

    out.write("\nCOMMIT;\n")


def emit_plan(students):
    err = sys.stderr
    err.write("Room types\n")
    total_beds = 0
    for room_type, capacity, total_rooms in ROOM_TYPES:
        beds = capacity * total_rooms
        total_beds += beds
        err.write(f"  {room_type:<10} {capacity}/room x {total_rooms} rooms = {beds} beds\n")
    err.write(f"  {'':<10} total capacity = {total_beds} beds for {len(students)} students\n\n")

    err.write("Cohorts, in allotment priority order (earliest updated_at first)\n")
    for count, pref1, pref2, pref3 in COHORTS:
        err.write(f"  {count:>2} students  1st={pref1:<9} 2nd={pref2:<9} 3rd={pref3}\n")

    err.write("\nMutual preferences for pass 1 of the matcher\n")
    for trio in MUTUAL_TRIOS:
        err.write(f"  trio {trio}\n")
    for pair in MUTUAL_PAIRS:
        err.write(f"  pair {pair}\n")

    err.write("\nExpected outcome\n")
    err.write("  3-Sharing  24 students ->  8 rooms (full)\n")
    err.write("  2-Sharing  16 students ->  8 rooms (full)\n")
    err.write("  4-Sharing  17 students ->  5 rooms (4+4+4+4+1)\n")
    err.write("  1-Sharing   3 students ->  3 rooms\n")
    err.write("  unallotted  6 students\n")


if __name__ == "__main__":
    simulated_students = build_students()
    emit_plan(simulated_students)
    emit_sql(simulated_students)
