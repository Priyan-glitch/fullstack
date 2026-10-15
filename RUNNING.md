# StableRoomie - Running the Application Locally

Canonical setup reference: [`readme.md`](readme.md) §13. This file records the
verified local run configuration.

## Current Status

Both services are running on this machine:

| Component | URL | Log |
|---|---|---|
| Spring Boot backend | http://localhost:8080 | `logs/java.log` |
| Flask matching service | http://127.0.0.1:5001 | `logs/flask.log` |
| Database | Neon serverless PostgreSQL (pooler endpoint, credentials in `StableRoomie/.env`) | - |

## Logs

`./start.sh` sends everything to a single `logs/` directory at the repo root
(`logs/` is gitignored). Files are appended to, so history survives restarts.

| File | Contents |
|---|---|
| `logs/java.log` | Spring Boot console output: startup, Hibernate SQL, warnings |
| `logs/java-access.log` | Tomcat access log: one line per HTTP request with status, e.g. `"GET /api/student/profile HTTP/1.1" 200 585` |
| `logs/flask.log` | Flask + Werkzeug: matching-service startup and one line per request with status |

Follow them with `./logs.sh`:

```bash
./logs.sh          # both service logs
./logs.sh flask    # Flask matching service
./logs.sh java     # Spring Boot application log
./logs.sh access   # request + status lines only
./logs.sh errors   # ERROR / WARN / Exception / 4xx / 5xx only
```

The access log is the fastest way to find which request returned a non-200
status, since `java.log` does not record response codes.

Clear the logs at any time: `rm logs/*.log`.

Port notes:

- **8080** for Spring Boot (the Google OAuth redirect URI
  `http://localhost:8080/login/oauth2/code/google` is registered for this port).
- **5001** for Flask, because macOS AirPlay Receiver occupies port 5000.
  `flask-api/app.py` reads the `PORT` environment variable (default 5000), and
  Spring Boot points at it via `FLASK_API_URL`.

## Start

```bash
./start.sh
```

The script builds `StableRoomie/target/StableRoomie-1.0.0.jar` if missing,
starts Flask with `PORT=5001`, starts Spring Boot with
`FLASK_API_URL=http://127.0.0.1:5001`, and waits for both health checks.

Override ports when needed:

```bash
FLASK_PORT=5002 JAVA_PORT=8081 ./start.sh
```

## Stop

```bash
./stop.sh
```

## Manual Start

Terminal 1 - Flask:

```bash
cd flask-api
source venv/bin/activate          # venv already has the requirements installed
PORT=5001 python app.py
```

Terminal 2 - Spring Boot:

```bash
cd StableRoomie
export FLASK_API_URL=http://127.0.0.1:5001
java -jar target/StableRoomie-1.0.0.jar
```

Rebuild the jar after Java changes:

```bash
cd StableRoomie
mvn clean package -DskipTests
```

`StableRoomie/.env` is loaded automatically by spring-dotenv from the working
directory, so run the jar from inside `StableRoomie/`. It supplies `DB_*`,
`GOOGLE_CLIENT_*`, `DB_DRIVER` and `DB_DIALECT`.

## Health Checks

```bash
curl http://127.0.0.1:5001/health        # {"status":"ok"}
curl http://localhost:8080/api/user-info # {"authenticated":false}
curl -o /dev/null -w '%{http_code}\n' http://localhost:8080/   # 200
```

Flask matching endpoint (one room-type list, two-phase grouping):

```bash
curl -X POST http://127.0.0.1:5001/allot \
  -H 'Content-Type: application/json' \
  -d '{"capacity":3,"students":[
        {"studentId":1001,"department":"IT","sleepTime":"11:00 PM","wakeTime":"7:00 AM",
         "noiseLevel":"Low","lightSensitivity":"No","cleanliness":"clean",
         "studyHabits":"silent","preferredRoommates":"1002,1003"},
        {"studentId":1002,"department":"IT","sleepTime":"11:00 PM","wakeTime":"7:00 AM",
         "noiseLevel":"Low","lightSensitivity":"No","cleanliness":"clean",
         "studyHabits":"silent","preferredRoommates":"1001,1003"},
        {"studentId":1003,"department":"IT","sleepTime":"11:00 PM","wakeTime":"7:00 AM",
         "noiseLevel":"Low","lightSensitivity":"No","cleanliness":"clean",
         "studyHabits":"silent","preferredRoommates":"1001,1002"}]}'
# -> {"groups":[[1001,1002,1003]]}
```

## First Use

The database is currently empty except for the single `settings` row, with the
preference window **open**. To run a full cycle:

1. Sign in with Google at http://localhost:8080 (the admin email configured by
   `ADMIN_EMAIL`, default `mohit2310893@ssn.edu.in`, gets the warden dashboard).
2. Add room types under **Room Types** with students-per-room (`capacity`) and
   total rooms (`totalRooms`).
3. Verify the preference window is open (**Lock & Allot** screen), then have
   students submit preferences.
4. Click **Lock and Allot**.

## Environment Notes

- Java 17+ is required; the jar builds and runs on Temurin 21. Homebrew's
  `mvn` resolves to a newer JDK on this machine, so prefer `java -jar` over
  `mvn spring-boot:run` for the run step.
- The Python venv in `flask-api/venv` runs Python 3.14 with newer package
  versions than `requirements.txt` pins (networkx 3.6.1, numpy 2.4.6). The
  matching algorithm runs correctly on those versions; do not downgrade to the
  pinned `numpy==1.26.4`, which has no wheels for Python 3.14.
- Both `.env` files are gitignored. The root `.env` is a reference copy only -
  spring-dotenv loads `StableRoomie/.env`.

## Troubleshooting

Port already in use:

```bash
lsof -i :8080   # or :5001
kill <PID>
```

Database connection failed:

```bash
export PGPASSWORD='<NEON_PASSWORD>'
psql "postgresql://neondb_owner@<NEON_POOLER_HOST>/neondb?sslmode=require" -c "\dt"
```

Expected tables: `allotment`, `room_groups`, `rooms`, `settings`, `student`.
