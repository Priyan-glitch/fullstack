# Stable Roomies

A smart hostel roommate allocation system that collects student preferences,
analyses compatibility, and helps wardens assign students to suitable rooms.

## Architecture

```
React Frontend
      │
   Caddy (gateway/)                ← API gateway + reverse proxy
      │
      ├── student-service     :8081  (Spring Boot)
      ├── hostel-service      :8082  (Spring Boot)
      ├── allocation-service  :8083  (Spring Boot)
      ├── notification-service:8084  (Spring Boot)
      └── algorithm-engine    :8090  (Python / FastAPI)

Infrastructure (shared by all services)
      ├── PostgreSQL           :5432
      ├── Redis                :6379
      └── RabbitMQ             :5672  (Management UI → :15672)
```

## Services

| Service | Language | Port | Responsibility |
|---|---|---|---|
| student-service | Java / Spring Boot | 8081 | Student profiles, preference questionnaire |
| hostel-service | Java / Spring Boot | 8082 | Hostels, blocks, rooms, availability |
| allocation-service | Java / Spring Boot | 8083 | Allocation workflow, warden approval, room changes |
| notification-service | Java / Spring Boot | 8084 | Email and in-app notifications |
| algorithm-engine | Python / FastAPI | 8090 | Compatibility scoring, roommate group formation |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Tailwind CSS (Vite) |
| Backend | Spring Boot 3.3 / Java 21 |
| Algorithm Engine | Python 3.11 / FastAPI |
| Auth | JWT (self-hosted auth-service) |
| API Gateway | Caddy 2 |
| Database | PostgreSQL 17 |
| Cache / Rate Limiting | Redis 7 |
| Message Broker | RabbitMQ 4 |
| Containers | Docker |
| Orchestration | Kubernetes |

## Project Structure

```
stable-roomies/
├── frontend/                   React application
├── gateway/
│   └── Caddyfile               Reverse proxy configuration
├── backend/
│   ├── student-service/        Spring Boot – students & preferences
│   ├── hostel-service/         Spring Boot – hostels & rooms
│   ├── allocation-service/     Spring Boot – allocation workflow
│   └── notification-service/   Spring Boot – notifications
├── algorithm-engine/           Python FastAPI – compatibility & allocation engine
└── infrastructure/
    ├── docker/
    │   └── docker-compose.yml  Local development environment
    └── kubernetes/             K8s manifests for all services
```

## Running Locally

### Quick Start — no Docker

Runs the entire stack on the host: all five services, the algorithm engine, the
gateway, and RabbitMQ/Postgres if you already have a local Postgres.

```bash
scripts/dev-native.sh start          # start everything and wait for readiness
scripts/dev-native.sh status         # what's up
scripts/dev-native.sh logs auth-service
scripts/dev-native.sh stop
```

Then, in another terminal:

```bash
cd frontend && npm run dev
python3 scripts/seed-simulated-data.py   # optional: 12 students, 2 hostels, 16 rooms
python3 scripts/e2e-test.py              # 48 end-to-end checks
```

Two prerequisites the script enforces because both fail confusingly otherwise:

- **A JDK 21.** Maven must *run* on 21, not merely target it. On a newer JDK
  (Homebrew's Maven picks up JDK 26), Lombok's annotation processor silently stops
  running and notification-service fails to compile with `cannot find symbol` for
  every generated getter. Set `JAVA_HOME`, or let the script find a JDK 21.
- **A local `algorithm_db`** — `createdb algorithm_db`. The engine keeps its
  allocation runs there, separate from the Spring services.

The gateway listens on **8888** rather than 80 (binding below 1024 needs root),
and `frontend/.env.local` points `VITE_GATEWAY_BASE_URL` at it.

See [E2E_REPORT.md](E2E_REPORT.md) for the verification results and the defects
this path surfaced.

### Quick Start - All Backend Services

Use the convenience script to start all backend services at once:
```bash
start-backend-services.bat
```

This will open separate terminal windows for:
- Student Service (port 8081)
- Hostel Service (port 8082)  
- Allocation Service (port 8083)

### Manual Start

### 1. Infrastructure (Postgres, Redis, RabbitMQ)

Each service owns its own Postgres instance, so there is no single `postgres`
service to start — list them explicitly (or omit the names to start everything):

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d \
  postgres-student postgres-hostel postgres-allocation postgres-notification \
  postgres-algorithm redis rabbitmq
```

Host ports: `postgres-student` 5432, `postgres-hostel` 5433,
`postgres-allocation` 5434, `postgres-notification` 5435,
`postgres-algorithm` 5436, Redis 6379, RabbitMQ 5672 (UI 15672).

> **Port 5432 conflicts.** If you already run Postgres natively (for example via
> Homebrew), `postgres-student` will fail to bind 5432. Either stop the local
> instance, or map the container elsewhere and point student-service at it —
> Spring Boot reads `SPRING_DATASOURCE_URL` from the environment, which
> overrides `application.yml`:
>
> ```bash
> # docker-compose.override.yml (machine-local, do not commit)
> services:
>   postgres-student:
>     ports:
>       - "5437:5432"
> ```
>
> ```bash
> cd backend/student-service
> SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5437/student_db mvn spring-boot:run
> ```

### 2. Backend services (each in a separate terminal)

Start auth-service first — the gateway forwards every `/api/*` request to a
backend and has nothing to verify tokens against until it is up.

```bash
cd backend/auth-service
mvn spring-boot:run

cd backend/student-service
mvn spring-boot:run

cd backend/hostel-service
mvn spring-boot:run

cd backend/allocation-service
mvn spring-boot:run

cd backend/notification-service
mvn spring-boot:run
```

### 3. Algorithm engine

```bash
cd algorithm-engine
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8090
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Gateway

```bash
caddy run --config gateway/Caddyfile
```

### Run everything with Docker

```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
```


---

## Database configuration

Datasource credentials are read from environment variables, with the local
docker Postgres as the fallback, so no real credential lives in the repository:

| Variable | Fallback |
|---|---|
| `SPRING_DATASOURCE_URL` | per service — student `5432`, hostel `5433`, notification `5432` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` |

Each service automatically imports a repository-root `.env` through
`spring.config.import: optional:file:../../.env[.properties]`, so starting a
service from its own directory picks up the values with no extra setup:

```bash
cd backend/student-service && mvn spring-boot:run
```

`.env` is gitignored and holds real credentials — never commit it, and never
`git add -f` it. Put your provider's values there rather than hardcoding them in
`application.yml`, which is tracked in a public repository.

> The fetched file must be Java-properties format, not shell: a JDBC URL
> containing `&` cannot be loaded with `source .env` because bash treats `&` as
> a background operator. Let Spring read it, or export the variables yourself.

`allocation-service` talks to RabbitMQ only — it has no datasource.

To move between the local docker Postgres and a hosted database (Neon, RDS,
Supabase), change only `.env`; no code or YAML edits are needed.


---

## Authentication (auth-service)

Authentication is self-hosted: [`backend/auth-service`](backend/auth-service) issues
the JWTs and the gateway verifies them. The frontend never sends a password
anywhere except `POST /api/auth/login`, and stores nothing but the returned token.

### 1. How a session works

| Step | Where | What happens |
|---|---|---|
| 1 | `/login` | Form posts email + password to `/api/auth/login` |
| 2 | auth-service | Verifies the BCrypt hash, signs an HS256 JWT (24h) |
| 3 | Browser | Stores the token in `localStorage` ([`lib/authToken.js`](frontend/src/lib/authToken.js)) |
| 4 | Every call | `apiFetch` attaches `Authorization: Bearer <token>` |
| 5 | Gateway | Verifies signature, issuer and expiry before proxying |
| 6 | On load | `UserContext` re-checks the token against `/api/auth/me` |

Step 6 matters: the token is only trusted once `/me` confirms it, so a revoked or
stale session cannot survive a page load.

### 2. The signing key

`JWT_SECRET` must be **base64-encoded** and identical on both sides — caddy-jwt
decodes `sign_key` as base64 and `JwtService` decodes it the same way, so they
derive the same key. Put it in the gitignored `.env` at the repository root:

```bash
openssl rand -base64 32        # → JWT_SECRET=<paste here>
```

A mismatched or non-base64 key is the most likely cause of a blanket `401`. The
gateway refuses to start on a malformed key; auth-service fails at startup when
the value does not decode to at least 32 bytes.

> A **development-only** default ships in both configs so a fresh clone runs with
> no setup. It is in the repository and therefore public — override before deploying.

### 3. Routes

| Route | Access | Behaviour |
|---|---|---|
| `/` | public | Sends visitors to their role home, or to `/login` |
| `/login`, `/signup` | signed out | Real forms; redirects signed-in users away |
| `/student/*` | `student` | Redirects wardens to `/admin/dashboard` |
| `/admin/*` | `admin` | Redirects students to `/student/dashboard` |
| anything else | public | Branded 404 |

Guarding lives in [`RouteGuards.jsx`](frontend/src/components/auth/RouteGuards.jsx).
Hitting a protected route while signed out sends you to `/login?redirect_url=…`,
and signing in returns you there — but only for same-site paths.

### 4. Roles

The role is a claim in the JWT (`student` or `admin`), read from the `users.role`
column at sign-in. Two consequences:

- Registration **always** creates a `student`. The register request has no role
  field, so nobody can self-promote.
- Admin is granted out-of-band. The first warden is bootstrapped from
  `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD` in `.env`, at startup, and only when
  no `ADMIN` exists yet — an existing user is never modified.

```bash
# .env — created once on first start, then change the password
AUTH_ADMIN_EMAIL=warden@ssn.edu.in
AUTH_ADMIN_PASSWORD=ChangeMe-Warden-2026
```

To promote anyone else, set their `users.role` to `ADMIN` and have them sign in
again — the new role arrives with the next token.

### 5. Linking accounts to student records

Credentials live in auth-service's `users` table; student data stays in the
student-service `students` table. [`UserContext`](frontend/src/contexts/UserContext.jsx)
resolves the signed-in email against `GET /api/students/email/{email}` and exposes
that record as `user`, so `user.id` stays the numeric id every existing page
already expects. When student-service is unreachable the context falls back to the
account identity, so the UI still renders instead of hanging.

Both app shells show the signed-in name, the role, and a sign-out button
([`SignOutButton.jsx`](frontend/src/components/common/SignOutButton.jsx)). Signing
out just clears the stored token — there is no server-side session to revoke, so a
token stays valid until it expires. Shorten `JWT_EXPIRY_MINUTES` if that matters.


---

## API gateway & authentication

All frontend API calls go through the gateway (`gateway/Caddyfile`; port 80 under
Docker, 8888 for a native run). It verifies the JWT issued by auth-service on
every `/api/*` request before proxying to a service, so the services stop being
open endpoints. It also enforces the `role` claim on administrator-only paths.

### How a request is authenticated

1. The browser gets a JWT from `POST /api/auth/login` and stores it in
   `lib/authToken.js`.
2. Every API call goes through `apiFetch()`, which attaches
   `Authorization: Bearer <token>` — 40 call sites, so nothing bypasses it
   silently.
3. Caddy verifies the signature against the shared `JWT_SECRET` (no network round
   trip to the issuer) and forwards the request with `X-Auth-User-Id` set from the
   token's `sub` claim.

Requests without a valid token get `401` before reaching any backend, and CORS
preflight (`OPTIONS`) is answered before the auth check so browsers can actually
read that `401`.

### Building the gateway

The stock `caddy:2` image cannot validate JWTs, so `gateway/Dockerfile` compiles
the `ggicci/caddy-jwt` module in with `xcaddy`. Build it with the rest of the
stack:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d --build gateway
```

### Configuration

| Variable | Default |
|---|---|
| `JWT_SECRET` | the development-only key in `.env` / `gateway/Caddyfile` |
| `CORS_ALLOW_ORIGIN` | `http://localhost:5174` — the Vite dev server |

`JWT_SECRET` arrives from the repository-root `.env` through `env_file`, and must
match auth-service byte for byte. To switch to asymmetric signing, replace
`sign_key` with `jwk_url` and have auth-service publish a key pair — nothing else
changes.

### Frontend base URLs

Every base URL defaults to the gateway (`VITE_GATEWAY_BASE_URL`, default
`http://localhost`). To bypass the gateway while working on a single service,
override that service in `frontend/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8081
```

### Path conventions

| Prefix | Service |
|---|---|
| `/api/auth/*` | auth-service :8085 — `login` and `register` are the only unauthenticated endpoints |
| `/api/students/*`, `/api/preferences/*`, `/api/allocations/*` | student-service :8081 |
| `/api/allocation/*` | allocation-service :8083 |
| `/api/hostels/*`, `/api/rooms/*`, `/api/dashboard/*` | hostel-service :8082 |
| `/api/notifications/*` | notification-service :8084 |
| `/api/v1/allocation/*` | algorithm-engine :8090 |

`/api/allocations/*` (plural) belongs to student-service, `/api/allocation/*`
(singular) to allocation-service. Those are separate path segments, which is
what makes the routing unambiguous.

### Two caveats

**The services are still directly reachable.** Each publishes its own host port,
so they can be called without a token, and `X-Auth-User-Id` can be spoofed on a
direct call. Remove the `ports:` entries from the service definitions to make the
gateway the only way in; until then treat that header as advisory. The gateway
itself *overwrites* the header rather than appending, so it cannot be spoofed
through the gateway.

**The legacy password login is now dead.** `POST /api/students/login` sits under
an authenticated prefix, so it can no longer be reached without a token — correct
now that auth-service owns identity, but it means the endpoint is unreachable.
Delete it, along with the `password` column on `students`, when convenient.

---

## API Documentation

### New Endpoints

#### Preferences API (Student Service - Port 8081)
```bash
# Get student preferences
GET /api/preferences/student/{studentId}

# Save or update preferences
POST /api/preferences/student/{studentId}

# Check if preferences exist
GET /api/preferences/student/{studentId}/exists
```

#### Allocation API (Allocation Service - Port 8083)
```bash
# Get allocation status and room details
GET /api/allocations/student/{studentId}

# Get roommates for a student
GET /api/allocations/student/{studentId}/roommates

# Get sample allocated response (for testing)
GET /api/allocations/student/{studentId}/sample

# Health check
GET /api/allocations/health
```

📚 **Complete API Documentation:** See [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)

---

## Recent Updates

### ✅ Implemented (Latest)

1. **Student Preferences Service**
   - Full CRUD API for student preferences
   - Lifestyle preferences (sleep, cleanliness, noise, study time, social)
   - Room preferences and additional requirements
   - Integrated with frontend dashboard

2. **Allocation Service (Template)**
   - Status API ready for frontend integration
   - Response structure defined
   - Ready for algorithm-engine connection
   - Currently returns template responses

3. **Dashboard Integration**
   - Fetches real preferences data from API
   - Displays allocation status from API
   - Shows dynamic recent activity
   - Loading states and error handling

4. **Authentication (Frontend)**
   - Sign-in and sign-up screens at `/login` and `/signup`, themed to the brand
   - Role-aware route guards for every student and admin route
   - Signed-in identity and a sign-out control in both app shells
   - Student records resolved by email so existing API calls are unchanged
   - 404 page and empty states for the not-yet-built `Requests` routes

### ⏳ Pending

1. **PreferencesPage UI** - Form to collect and submit preferences
2. **Algorithm Engine** - Compatibility scoring and matching logic
3. **Database Persistence** - Store allocations in database
4. **Admin Allocation Trigger** - Interface to run allocation
5. **Server-side authorization inside the services** — the gateway verifies the JWT
   and enforces roles, but each service still trusts the `X-Auth-User-Id` header it
   is handed, so calling a service port directly bypasses the gateway entirely.

---
