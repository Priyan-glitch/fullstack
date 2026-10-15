# Stable Roomies — Testing Guide

> This file previously described a different, obsolete authentication system: a
> hardcoded `admin@college.edu` / `admin123` login, `POST /api/students/login`,
> plaintext passwords in the `students` table, and a plan to "integrate Clerk".
> **None of that exists any more.** It was rewritten because it documented a
> removed backdoor credential and would have sent you down the wrong path.

## How authentication actually works

Self-hosted JWT. No third-party identity provider.

```
POST /api/auth/register   {email, password, firstName, lastName}  -> JWT   (always role=student)
POST /api/auth/login      {email, password}                       -> JWT
GET  /api/auth/me         Authorization: Bearer <jwt>             -> user
```

- Passwords are BCrypt-hashed in auth-service's own `users` table.
- The token is HS256, signed with `JWT_SECRET`, and carries `sub`, `email`,
  `role` and `name`.
- The gateway verifies every `/api/*` request except `login` and `register`, and
  enforces `role` on administrator-only paths.
- Registration has no `role` field, so nobody can make themselves an admin.

## Credentials

There is exactly **one administrator**, bootstrapped from the gitignored root
`.env` on first start. Everything else is a student.

| Role | Account | Password |
|---|---|---|
| ADMIN | `AUTH_ADMIN_EMAIL` in `.env` | `AUTH_ADMIN_PASSWORD` in `.env` |
| STUDENT | the 12 seeded `NNNNNNN@ssn.edu.in` accounts | `Student@2026` |

Check the real values:

```bash
grep -E '^AUTH_ADMIN_EMAIL=|^AUTH_ADMIN_PASSWORD=' .env
```

To change the admin password, edit `.env` and delete the existing admin row —
the bootstrap only creates an account when none exists, and never modifies one.
Students change nothing: they are recreated by the seeder.

## Running the stack

```bash
scripts/dev-native.sh start                  # services, engine, gateway
cd frontend && npm run dev                   # UI on 5174 (5173 may be taken)
python3 scripts/seed-simulated-data.py       # 12 students, 2 hostels, 16 rooms
```

Requires a **JDK 21** (`JAVA_HOME`) — building on a newer JDK silently breaks
Lombok in notification-service — and a local `algorithm_db` (`createdb algorithm_db`).

## Verifying it works

```bash
python3 scripts/e2e-test.py
```

48 checks over the gateway: JWT enforcement, both logins, roles, student data,
hostels and rooms, the allocation engine, RabbitMQ messaging, notifications, and
authorization (students refused on admin paths, still allowed their own data).

## Logging in by hand

```bash
# warden
curl -X POST http://localhost:8888/api/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$AUTH_ADMIN_EMAIL\",\"password\":\"$AUTH_ADMIN_PASSWORD\"}"

# student
curl -X POST http://localhost:8888/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"2310893@ssn.edu.in","password":"Student@2026"}'
```

Then use the returned token:

```bash
curl http://localhost:8888/api/students -H "Authorization: Bearer <token>"
```

Sending no token, a forged token, or a student token to an admin-only path
returns 401 or 403 respectively — that is the gateway doing its job, not a bug.

## Common issues

| Symptom | Cause |
|---|---|
| 401 on everything | `JWT_SECRET` differs between auth-service and the gateway. Both read the root `.env`. |
| Gateway won't start | `sign_key` is not valid base64. Generate one with `openssl rand -base64 32`. |
| 502 from the gateway | The target service is not running, or `*_SERVICE_HOST` still points at the Docker service name during a native run. |
| notification-service won't compile | Maven is on a JDK newer than 21, so Lombok's processor silently stops. Set `JAVA_HOME` to a JDK 21. |
| "Port 8081 was already in use" | A forked JVM survived a stop. `scripts/dev-native.sh stop` now frees ports too. |
| Allocation worker logs "No students found" | No students with submitted preferences for the requested year. Omit `year` to allocate all years. |
| Frontend calls fail with a CORS error | The gateway answers one fixed origin; set `CORS_ALLOW_ORIGIN` to the port Vite actually used. |

## Architecture

```
browser --(Bearer JWT)--> gateway :8888
                            |-- jwtauth (HS256, shared secret)
                            |-- role check on admin-only paths
                            |-- X-Auth-User-Id -> service
                            |
      +---------------------+---------------------+
      |            |              |                 |
 auth :8085   student :8081  hostel :8082   allocation :8083  notification :8084
      |            |              |                 |
   users        students     hostels/rooms     RabbitMQ -> algorithm-engine :8090
      \____________\_____________/_____________________/
                          Neon PostgreSQL
```

## Security notes

- `students.password` is deprecated and unmapped: auth-service owns credentials.
  The column remains only because dropping it is destructive.
- The services publish their own host ports, so they are reachable directly and
  therefore bypass the gateway. Treat gateway checks as the application's
  enforcement point, not the network's.
- Never commit `.env`; it holds the JWT secret and the warden's password.
