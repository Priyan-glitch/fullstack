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
