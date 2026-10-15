#!/usr/bin/env python3
"""
End-to-end verification for Stable Roomies.

Drives the running stack through the API gateway exactly as the browser does, so
a pass means the whole path works: gateway -> JWT check -> service -> database.

Prerequisites:
    scripts/dev-native.sh start
    python3 scripts/seed-simulated-data.py

Usage:
    python3 scripts/e2e-test.py
    python3 scripts/e2e-test.py --base-url http://localhost:8888
"""

from __future__ import annotations

import argparse
import http.client
import json
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent

# One of the accounts created by seed-simulated-data.py.
SEEDED_STUDENT = "2310893@ssn.edu.in"
SEEDED_PASSWORD = "Student@2026"

results: list[tuple[str, bool, str]] = []
_section = ""


def section(name: str) -> None:
    global _section
    _section = name
    print(f"\n\033[1m{name}\033[0m")


def check(name: str, passed: bool, detail: str = "") -> bool:
    results.append((f"{_section} · {name}", passed, detail))
    mark = "\033[32m✔\033[0m" if passed else "\033[31m✘\033[0m"
    print(f"  {mark} {name}" + (f"  \033[90m{detail}\033[0m" if detail else ""))
    return passed


def request(base: str, method: str, path: str, token: str | None = None,
            payload: dict | None = None, timeout: int = 60):
    """Returns (status, body). Never raises for HTTP errors — the status is the
    thing under test."""
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(f"{base}{path}", data=data, method=method)
    if payload is not None:
        req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw, status = resp.read().decode(), resp.status
            headers = dict(resp.headers)
    except urllib.error.HTTPError as e:
        raw, status = e.read().decode(errors="replace"), e.code
        headers = dict(e.headers or {})
    except Exception as e:  # noqa: BLE001 - connection failures are a test result
        return 0, str(e), {}
    try:
        return status, (json.loads(raw) if raw else None), headers
    except json.JSONDecodeError:
        return status, raw, headers


def cors_origins(base: str, path: str, token: str | None = None) -> list[str]:
    """Every Access-Control-Allow-Origin value on a real (proxied) response.

    This cannot use request() above, because that collapses the headers into a
    dict and a *duplicate* origin is exactly the failure being checked for.
    Browsers reject a response carrying two values even when one is correct, so
    the count matters, not just presence.
    """
    parsed = urllib.parse.urlparse(base)
    conn = http.client.HTTPConnection(parsed.hostname, parsed.port or 80, timeout=30)
    headers = {"Origin": "http://localhost:5174"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        conn.request("GET", path, headers=headers)
        resp = conn.getresponse()
        resp.read()
        return list(resp.headers.get_all("Access-Control-Allow-Origin") or [])
    finally:
        conn.close()


def read_env() -> dict[str, str]:
    env: dict[str, str] = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://localhost:8888")
    args = ap.parse_args()
    base = args.base_url.rstrip("/")
    env = read_env()
    admin_email = env.get("AUTH_ADMIN_EMAIL", "")
    admin_password = env.get("AUTH_ADMIN_PASSWORD", "")

    print(f"End-to-end verification against {base}")

    # ── A. Gateway enforcement ────────────────────────────────────────────────
    section("A. Gateway JWT enforcement")
    status, _, _ = request(base, "GET", "/api/students")
    check("anonymous request is rejected", status == 401, f"got {status}")

    status, _, _ = request(base, "GET", "/api/students", token="not.a.jwt")
    check("forged token is rejected", status == 401, f"got {status}")

    status, _, headers = request(base, "OPTIONS", "/api/students")
    check("CORS preflight is answered before auth", status in (204, 200), f"got {status}")

    status, _, _ = request(base, "GET", "/api/auth/me")
    check("/api/auth/me is not public", status == 401, f"got {status}")

    status, _, _ = request(base, "POST", "/api/auth/login", payload={})
    check("login is reachable without a token", status in (400, 401), f"got {status} (not 401-from-gateway)")

    # ── B. Authentication ─────────────────────────────────────────────────────
    section("B. Authentication (auth-service)")
    status, body, _ = request(base, "POST", "/api/auth/login",
                              payload={"email": admin_email, "password": admin_password})
    admin_ok = status == 200 and isinstance(body, dict) and body.get("token")
    check("warden can sign in", admin_ok, f"got {status}")
    admin_token = body["token"] if admin_ok else None
    if admin_ok:
        check("warden token carries role=admin", body["user"]["role"] == "admin",
              f"role={body['user']['role']}")

    status, body, _ = request(base, "POST", "/api/auth/login",
                              payload={"email": SEEDED_STUDENT, "password": SEEDED_PASSWORD})
    student_ok = status == 200 and isinstance(body, dict) and body.get("token")
    check("simulated student can sign in", student_ok, f"got {status}")
    student_token = body["token"] if student_ok else None
    if student_ok:
        check("student token carries role=student", body["user"]["role"] == "student",
              f"role={body['user']['role']}")
        check("token response never exposes a hash",
              "password" not in json.dumps(body).lower(), "no password field")

    status, _, _ = request(base, "POST", "/api/auth/login",
                           payload={"email": SEEDED_STUDENT, "password": "wrong-password"})
    check("wrong password is rejected", status == 401, f"got {status}")

    status, _, _ = request(base, "POST", "/api/auth/login",
                           payload={"email": "nobody@ssn.edu.in", "password": "whatever123"})
    check("unknown account is rejected the same way", status == 401, f"got {status}")

    if student_token:
        status, body, _ = request(base, "GET", "/api/auth/me", token=student_token)
        check("token resolves to the right account",
              status == 200 and body.get("email") == SEEDED_STUDENT, f"got {status}")

    status, _, _ = request(base, "POST", "/api/auth/register", payload={
        "email": SEEDED_STUDENT, "password": "Another@2026",
        "firstName": "Dup", "lastName": "Licate"})
    check("duplicate registration is refused", status == 409, f"got {status}")

    status, _, _ = request(base, "POST", "/api/auth/register", payload={
        "email": "shortpw@ssn.edu.in", "password": "abc",
        "firstName": "Short", "lastName": "Password"})
    check("weak password is refused", status == 400, f"got {status}")

    # ── C. Student data ───────────────────────────────────────────────────────
    section("C. Student data (student-service)")
    students = []
    if admin_token:
        status, body, _ = request(base, "GET", "/api/students", token=admin_token)
        students = body if isinstance(body, list) else []
        check("admin can list students", status == 200 and len(students) >= 12,
              f"{len(students)} students")

        status, body, _ = request(base, "GET",
                                  f"/api/students/email/{SEEDED_STUDENT}", token=admin_token)
        check("lookup by email works",
              status == 200 and isinstance(body, dict) and body.get("email") == SEEDED_STUDENT,
              f"got {status}")

        status, body, _ = request(base, "GET", "/api/students/admin/stats", token=admin_token)
        check("admin dashboard stats respond", status == 200, f"got {status}")

        if students:
            sid = students[0]["id"]
            status, body, _ = request(base, "GET", f"/api/preferences/student/{sid}",
                                      token=admin_token)
            check("preferences are readable",
                  status == 200 and isinstance(body, dict), f"got {status}")
            check("seeded preferences are marked submitted",
                  isinstance(body, dict) and body.get("submitted") is True,
                  f"submitted={body.get('submitted') if isinstance(body, dict) else 'n/a'}")

    # A student must not be able to read another student's preferences.
    if student_token and len(students) >= 2:
        other = next((s for s in students if s["email"] != SEEDED_STUDENT), None)
        if other:
            status, _, _ = request(base, "PUT", f"/api/preferences/student/{other['id']}",
                                   token=student_token, payload={"studentId": other["id"]})
            check("a student cannot edit another student's preferences",
                  status in (401, 403), f"got {status}")

    # ── D. Hostels and rooms ──────────────────────────────────────────────────
    section("D. Hostels and rooms (hostel-service)")
    hostel_token = admin_token or student_token
    status, hostels, _ = request(base, "GET", "/api/hostels", token=hostel_token)
    hostels = hostels if isinstance(hostels, list) else []
    check("hostels are listed", status == 200 and len(hostels) >= 2, f"{len(hostels)} hostels")

    status, rooms, _ = request(base, "GET", "/api/rooms", token=hostel_token)
    rooms = rooms if isinstance(rooms, list) else []
    check("rooms are listed", status == 200 and len(rooms) >= 16, f"{len(rooms)} rooms")

    status, _, _ = request(base, "GET", "/api/room-type-config", token=hostel_token)
    check("room-type-config is routed by the gateway", status == 200, f"got {status}")

    status, _, _ = request(base, "GET", "/api/dashboard/stats", token=hostel_token)
    check("hostel dashboard stats respond", status == 200, f"got {status}")

    if hostels and rooms:
        capacity = sum(r.get("capacity", 0) for r in rooms)
        check("seeded rooms have real capacity", capacity >= 30, f"total beds={capacity}")

    # ── E. Algorithm engine ───────────────────────────────────────────────────
    section("E. Algorithm engine")
    status, body, _ = request(base, "GET", "/api/v1/allocation/strategies", token=admin_token)
    names = [s.get("name") for s in body.get("strategies", [])] if isinstance(body, dict) else []
    check("strategies are listed", status == 200 and len(names) >= 2, f"{names}")
    check("the louvain strategy is registered", "preference_queue_louvain" in names)

    # This is the real allocation run: the engine fetches students and rooms from
    # the other services and persists a draft result.
    status, body, _ = request(base, "POST", "/api/v1/allocation/run", token=admin_token,
                              payload={"strategy": "preference_queue_louvain",
                                       "run_by": "e2e-test"}, timeout=180)
    run_ok = status == 201 and isinstance(body, dict)
    check("allocation run completes", run_ok,
          f"got {status}" + (f" — {str(body)[:120]}" if not run_ok else ""))
    if run_ok:
        detail = (f"students={body.get('total_students')} "
                  f"allocated={body.get('allocated_count')} groups={body.get('total_groups')} "
                  f"avg={body.get('avg_compatibility_score')}")
        check("run consumed the seeded students", (body.get("total_students") or 0) >= 12, detail)
        check("students were actually grouped", (body.get("total_groups") or 0) >= 1, detail)
        run_id = body.get("id")
        status, body2, _ = request(base, "GET", f"/api/v1/allocation/runs/{run_id}",
                                   token=admin_token)
        check("the run is retrievable with its groups",
              status == 200 and isinstance(body2, dict) and len(body2.get("groups", [])) >= 1,
              f"got {status}")

    # ── F. Allocation service (RabbitMQ producer) ─────────────────────────────
    section("F. Allocation service and messaging")
    status, body, _ = request(base, "GET", "/api/allocation/health", token=admin_token)
    check("allocation-service health responds", status == 200, f"got {status}")

    status, body, _ = request(base, "POST", "/api/allocation/trigger", token=admin_token,
                              payload={"triggeredBy": "e2e-test"})
    check("allocation trigger is accepted (published to RabbitMQ)",
          status == 202, f"got {status}" + (f" — {str(body)[:100]}" if status != 202 else ""))

    if students:
        status, _, _ = request(base, "GET", f"/api/allocation/student/{students[0]['id']}",
                               token=admin_token)
        check("per-student allocation lookup responds", status in (200, 404), f"got {status}")

    # ── G. Notifications ──────────────────────────────────────────────────────
    section("G. Notifications (notification-service)")
    status, _, _ = request(base, "GET", "/api/notifications/health", token=admin_token)
    check("notification-service health responds", status == 200, f"got {status}")

    status, body, _ = request(base, "GET", f"/api/notifications/{SEEDED_STUDENT}",
                              token=admin_token)
    check("notifications are listed for a user", status == 200, f"got {status}")

    # ── H. Authorization ──────────────────────────────────────────────────────
    # A valid token only proves identity. These assert the gateway also enforces
    # the `role` claim, and — just as important — that it does not over-reach and
    # lock students out of their own data.
    section("H. Authorization (role enforcement)")
    if student_token:
        for path, label in [
            ("/api/students", "the full student list"),
            ("/api/students/admin/stats", "admin dashboard stats"),
            ("/api/preferences/submitted", "every submitted preference"),
            ("/api/v1/allocation/strategies", "the algorithm engine"),
            ("/api/dashboard/stats", "hostel dashboard stats"),
        ]:
            status, _, _ = request(base, "GET", path, token=student_token)
            check(f"student is refused {label}", status == 403, f"got {status}")

        status, _, _ = request(base, "POST", "/api/allocation/trigger",
                               token=student_token, payload={})
        check("student cannot trigger a campus-wide allocation", status == 403, f"got {status}")

        # Resolve the student's own id so the "still works" checks are real.
        status, me, _ = request(base, "GET", f"/api/students/email/{SEEDED_STUDENT}",
                                token=student_token)
        own_id = me.get("id") if isinstance(me, dict) else None
        for path, label in [
            (f"/api/students/email/{SEEDED_STUDENT}", "own student record"),
            ("/api/room-type-config/available", "available room types"),
            (f"/api/preferences/student/{own_id}", "own preferences"),
            (f"/api/allocations/student/{own_id}", "own allocation"),
        ]:
            status, _, _ = request(base, "GET", path, token=student_token)
            check(f"student can still read their {label}", status == 200, f"got {status}")

        # The admin must not be collateral damage.
        if admin_token:
            status, _, _ = request(base, "GET", "/api/students", token=admin_token)
            check("admin is still allowed on admin paths", status == 200, f"got {status}")

    # ── I. CORS ───────────────────────────────────────────────────────────────
    # Regression guard. The gateway writes one origin and the proxy then merges
    # the service's response headers in, so a service that sets its own CORS
    # (e.g. @CrossOrigin(origins = "*")) yields TWO values in one response. The
    # browser rejects it, every request fails, and the UI reports the backend as
    # unreachable — while preflights still look fine, because Caddy answers
    # OPTIONS itself without ever contacting a service. That is precisely how
    # this shipped unnoticed, so the count is asserted on real GETs.
    section("I. CORS (single origin on real requests)")
    for path in [
        "/api/students/admin/stats",
        "/api/notifications/admin",
        "/api/students",
        "/api/hostels",
        "/api/v1/allocation/strategies",
    ]:
        values = cors_origins(base, path, admin_token)
        check(f"{path} carries exactly one CORS origin",
              len(values) == 1,
              f"got {len(values)}: {values}")

    # ── Summary ───────────────────────────────────────────────────────────────
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    failed = [(n, d) for n, ok, d in results if not ok]

    print("\n" + "─" * 68)
    if failed:
        print(f"\033[31m{total - passed} of {total} checks FAILED\033[0m")
        for n, d in failed:
            print(f"  ✘ {n}" + (f"  ({d})" if d else ""))
    else:
        print(f"\033[32mAll {total} checks passed\033[0m")
    print("─" * 68)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
