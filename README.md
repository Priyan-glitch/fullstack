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
| Auth | Clerk |
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

```bash
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

## Authentication (Clerk)

Authentication is handled entirely by Clerk on the frontend. The React app never
sees a password; it only ever reads the signed-in identity and the application
role derived from it.

### 1. Configure the publishable key

```bash
cd frontend
cp .env.example .env.local     # then paste your key
```

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Get it from the Clerk dashboard → **Configure → API keys**. Publishable keys are
safe to expose (they ship inside the client bundle); the **secret key must never**
be placed in `frontend/`.

### 2. Routes

| Route | Access | Behaviour |
|---|---|---|
| `/` | public | Sends visitors to their role home, or to `/login` |
| `/login`, `/signup` | signed out | Clerk components; redirects signed-in users away |
| `/student/*` | `student` | Redirects wardens to `/admin/dashboard` |
| `/admin/*` | `admin` | Redirects students to `/student/dashboard` |
| anything else | public | Branded 404 |

Guarding lives in [`frontend/src/components/auth/RouteGuards.jsx`](frontend/src/components/auth/RouteGuards.jsx).
Hitting a protected route while signed out sends you to
`/login?redirect_url=…`, so Clerk returns you to the page you wanted after sign-in.

### 3. Roles

The role is resolved in [`frontend/src/config/clerk.js`](frontend/src/config/clerk.js)
in this order:

1. `publicMetadata.role` — recommended, set from the Clerk dashboard
2. `unsafeMetadata.role` — self-assigned at sign-up
3. `VITE_ADMIN_EMAILS` — comma-separated dev escape hatch
4. `student` — default

Accepted admin values are `admin`, `warden`, `staff` and `administrator`.

**To make a user a warden**, open the Clerk dashboard → **Users → select the user
→ Metadata → Public** and set:

```json
{ "role": "admin" }
```

For local development you can skip the dashboard entirely:

```bash
# frontend/.env.local
VITE_ADMIN_EMAILS=you@campus.edu
```

### 4. Linking Clerk users to student records

The backend owns student data and keys it by its own numeric id, so
[`UserContext`](frontend/src/contexts/UserContext.jsx) resolves the signed-in
email against `GET /api/students/email/{email}` and exposes that record as
`user`. Every existing page keeps working unchanged because `user.id` stays the
numeric id the student-service expects.

If student-service is unreachable or has no matching record, the context falls
back to the Clerk identity so the UI still renders instead of hanging.

### 5. Sign out and account management

Both app shells use Clerk's `<UserButton />`. It opens an in-app account menu
(manage account → Clerk `<UserProfile />` modal, sign out → `/login`) and is
themed by the shared `clerkAppearance` object.

> Clerk's prebuilt UI is bundled via `@clerk/ui` rather than loaded from Clerk's
> CDN at runtime, so the auth screens render without a second network round-trip.


---

## API gateway & authentication

All frontend API calls go through the gateway (`gateway/Caddyfile`, port 80).
It verifies a Clerk session token on every `/api/*` request before proxying to a
service, so the services stop being open endpoints.

### How a request is authenticated

1. The browser gets a session token from Clerk (`useAuth().getToken()`), which
   `ApiAuthBridge` publishes to `src/lib/http.js`.
2. Every API call goes through `apiFetch()`, which attaches
   `Authorization: Bearer <token>` — 40 call sites, so nothing bypasses it
   silently.
3. Caddy validates the token against Clerk's public JWKS (no per-request round
   trip to Clerk) and forwards the request with `X-Clerk-User-Id` set.

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
| `CLERK_ISSUER` | `https://exciting-zebra-1231.clerk.accounts.dev` |
| `CLERK_JWKS_URL` | `<CLERK_ISSUER>/.well-known/jwks.json` |
| `CORS_ALLOW_ORIGIN` | `http://localhost:5174` — the Vite dev server |

Repoint these at a production Clerk instance when deploying; no code change is
needed.

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
so they can be called without a token and `X-Clerk-User-Id` can be spoofed on a
direct call. Remove the `ports:` entries from the service definitions to make
the gateway the only way in; until then treat that header as advisory.

**The legacy password login is now dead.** `POST /api/students/login` sits under
an authenticated prefix, so it can no longer be reached without a token — correct
now that Clerk owns identity, but it means the endpoint is unreachable. Delete it
when convenient.

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

4. **Clerk Authentication (Frontend)**
   - Sign-in and sign-up screens at `/login` and `/signup`, themed to the brand
   - Role-aware route guards for every student and admin route
   - Clerk `<UserButton />` account menu replaces the placeholder header identity
   - Student records resolved by email so existing API calls are unchanged
   - 404 page and empty states for the not-yet-built `Requests` routes

### ⏳ Pending

1. **PreferencesPage UI** - Form to collect and submit preferences
2. **Algorithm Engine** - Compatibility scoring and matching logic
3. **Database Persistence** - Store allocations in database
4. **Admin Allocation Trigger** - Interface to run allocation
5. **Backend JWT verification** - Validate Clerk session tokens in the Spring services
   (the frontend is authenticated today, but the APIs are still open)
6. **Remove `password` from `StudentDTO`** — the student-service still serialises
   the password field on `/api/students*`; with Clerk in place it is no longer needed

---
