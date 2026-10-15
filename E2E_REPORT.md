# End-to-end verification report

Date: 2026-10-15
Stack: gateway (Caddy + caddy-jwt) → auth-service, student-service, hostel-service,
allocation-service, notification-service, algorithm-engine → Neon PostgreSQL + RabbitMQ.
Result: **48 / 48 checks pass**, after fixing 10 defects found along the way.

Nothing here was asserted from reading code. Every claim below is the output of a
request made against the running stack.

---

## How to reproduce

```bash
scripts/dev-native.sh start                  # whole stack, no Docker
python3 scripts/seed-simulated-data.py       # 12 students, 2 hostels, 16 rooms
python3 scripts/e2e-test.py                  # 48 checks
```

`seed-simulated-data.py` deliberately writes through the **gateway**, not the
services, so a successful seed is itself an integration test of
gateway → auth-service → service → database.

Every simulated student signs in with `Student@2026`. Example:
`2310893@ssn.edu.in`.

---

## Test data created

| Entity | Count | Detail |
|---|---|---|
| Students | 12 | 8 male, 4 female; departments across CS, IT, ECE, Mech, Civil, BME, EEE; years 1–3 |
| Hostels | 2 | Aravalli (MALE), Nilgiri (FEMALE) |
| Rooms | 16 | Mixed 2-sharing / 3-sharing, 72 beds total |
| Preference sets | 12 | Sleep/wake times, study habits, cleanliness 4–9, and roommate preferences forming three clusters so the graph algorithm has real edges to work with |

---

## Results by area

| Area | Checks | Outcome |
|---|---|---|
| A. Gateway JWT enforcement | 5 | anonymous 401, forged token 401, preflight 204, `/api/auth/me` not public, login reachable |
| B. Authentication | 10 | both roles sign in, correct `role` claim, wrong password 401, unknown account 401, duplicate register 409, weak password 400, no hash leaked |
| C. Student data | 6 | 12 students listed, email lookup, admin stats, preferences submitted, cross-student edit refused (403) |
| D. Hostels and rooms | 5 | 5 hostels, 32 rooms, `room-type-config` routed, dashboard stats, 72 beds |
| E. Algorithm engine | 6 | both strategies listed, run completes, 12 students → 6 groups, avg compatibility **95.42**, groups retrievable |
| F. Allocation + messaging | 3 | health, trigger accepted (202), per-student lookup |
| G. Notifications | 2 | health, per-user list |
| H. Authorization | 11 | student refused all 5 admin-only paths, still allowed their own data, admin unaffected |

The full asynchronous chain was exercised too: trigger → RabbitMQ →
engine worker → result persisted, with `run_id` returned and the run's groups
read back over HTTP.

---

## Defects found and fixed

### 1. algorithm-engine could not start (7 missing dependencies)
`requirements.txt` was UTF-16 with CRLF endings and omitted seven packages the
code imports: `pydantic-settings`, `SQLAlchemy`, `psycopg2-binary`, `networkx`,
`python-louvain`, `httpx`, `pika`. `app/database.py` alone made the import fail,
so `uvicorn app.main:app` never came up. Note `graph_clustering.py` needed
`networkx` too, so this predates the recent allocation work.

Fixed: file rewritten as UTF-8, dependencies completed, venv installed.

### 2. notification-service did not compile
```
cannot find symbol: method isRead()
  location: variable n of type com.stableroomies.notificationservice.model.Notification
```
Every missing symbol was a Lombok-generated getter. The pom was correct — the
cause was the **JDK**: Maven was running on JDK 26 (Homebrew) while the project
targets Java 21, and on a JDK newer than Lombok supports the annotation processor
silently stops running. Only notification-service uses Lombok, which is why it
alone failed.

Fixed: `scripts/dev-native.sh` now pins `JAVA_HOME` to a JDK 21 and refuses to
start without one. (Adding the JDK requirement to the README is still worth doing.)

### 3. Gateway 404'd every collection-root API call
`handle /api/hostels/*` does **not** match `/api/hostels`. So `POST /api/hostels`
(create) returned 404 while `GET /api/hostels/1` worked — and the failing calls
were exactly the list/create calls the UI depends on. Every service prefix was
affected. A misleading symptom: unauthenticated calls returned 401 (from
`jwtauth`) so the routing looked fine from the outside.

Fixed: each matcher now lists the collection root *and* its descendants.

### 4. Gateway had no route for `/api/room-type-config`
The room-availability feature added in `b274c47` calls
`/api/room-type-config/*`, which the gateway never routed, so the new screen
404'd.

Fixed: added to the hostel-service matcher.

### 5. `POST /api/students` always failed
`convertToEntity()` carried the comment *"Password update handled separately"* but
never called `setPassword`, while `students.password` was `NOT NULL`. Every
student creation failed with a constraint violation.

Fixed: column made nullable (entity + `ALTER TABLE`) and documented as
deprecated, since auth-service now owns credentials.

### 6. "All years" allocation silently targeted year 4 only
The admin UI sends `year: null` for its "All years" option, but the null was
coerced to `4` in two places — `AllocationService` and the Python worker — so the
option never did what it said, and the worker failed with
`No students with submitted preferences found for Year 4`.

Fixed: null now propagates end-to-end and means every year. Verified:
`year=None → completed successfully: run_id=…, total_groups=6`.

### 7. Gateway couldn't run outside Docker
Upstreams were hardcoded Docker DNS names (`auth-service:8085`), unresolvable on
the host, and the site address `:80` needs root on macOS/Linux.

Fixed: every upstream host is an env var defaulting to the Docker name (so
compose is unchanged), plus a `GATEWAY_PORT` override.

### 8. `algorithm_db` connection used a role that doesn't exist
The engine defaults to `postgres:postgres@localhost`, but a Homebrew Postgres has
no `postgres` role — its superuser is the OS user. Startup died with
`FATAL: role "postgres" does not exist`.

Fixed: the launcher sets `DATABASE_URL` to the local OS user; overridable.

### 9. Any student could reach admin-only endpoints
A valid token proved identity but nothing checked the `role` claim, so a student
token returned **200** on `/api/students` (every student's record) and
`/api/preferences/submitted`, and **202** on `/api/allocation/trigger` — a
student could trigger a campus-wide allocation run.

Fixed: the gateway now enforces the role on admin-only paths. This took three
attempts to get right, because two non-obvious things were true:

- `user_claims` only selects the user *id*; exposing the role needs
  `meta_claims "role -> role"`.
- A `route` placed as a **sibling** of nested `handle` directives is skipped by
  Caddy entirely. With the check written that way, an unauthenticated request was
  proxied straight through with a 200. The `/api/*` block is now a single flat
  matcher-scoped `route` so authenticate → authorize → proxy run in source order.

Only paths the student UI never calls are restricted, and the suite asserts both
directions: students are refused admin paths **and** still reach their own
profile, preferences, room types and allocation.

### 10. CORS was pinned to one hardcoded origin
The gateway answered every preflight with a fixed origin, so a request from a
different port was blocked by the browser even though the server replied 204.

Fixed: defaults to Vite's port 5173 and is set by the launcher, which documents
that Vite silently picks the next free port if 5173 is busy.

---

## Observations not fixed

- **`POST /api/hostels` returns 200, not 201**, while `POST /api/students` returns
  201 and `POST /api/allocations` returns 202. Harmless, but inconsistent; the UI
  and the seeder tolerate both.
- **Dead authentication code.** `POST /api/students/login` is unreachable behind
  the gateway, and `students.password` is now unused. Both are safe to delete.
- **Backend services still publish their own host ports**, so they remain
  callable directly without a token. The gateway is a chokepoint, not a wall;
  removing the `ports:` mappings would make it the only way in.
- **The `X-Auth-User-Id` header is advisory.** The gateway overwrites it, so it
  can't be spoofed through the gateway — but a direct call to a service port can
  still set it freely.

## Limitations

- Verified by API and configuration only. **No browser walkthrough** was done, so
  UI rendering, routing and interaction were not observed directly.
- Docker was not exercised: no images are built or pulled. The native path and
  the compose definitions have not been compared at runtime.
- RabbitMQ is running from a downloaded generic-unix build against an Erlang/OTP
  27 build fetched from GitHub, because Homebrew's `ghcr.io` downloads kept
  failing with connection resets. This is a local testing arrangement, not a
  supported deployment.
- The OTP 30 build in `~/otp-dl/x` cannot run RabbitMQ 4.3.6
  (`incompatible_feature_flags`); OTP 27 works.
