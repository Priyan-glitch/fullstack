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

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis rabbitmq
```

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

### ⏳ Pending

1. **PreferencesPage UI** - Form to collect and submit preferences
2. **Algorithm Engine** - Compatibility scoring and matching logic
3. **Database Persistence** - Store allocations in database
4. **Admin Allocation Trigger** - Interface to run allocation

---
