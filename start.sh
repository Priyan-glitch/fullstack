#!/usr/bin/env bash
# Start StableRoomie locally: Flask matching service + Spring Boot application.
# Flask runs on 5001 because macOS AirPlay Receiver owns port 5000.
#
# Both services append to logs/ (see ./logs.sh to follow them):
#   logs/flask.log        Flask + Werkzeug request lines ("POST /allot ... 200")
#   logs/java.log         Spring Boot console output (startup, Hibernate SQL)
#   logs/java-access.log  Tomcat access log: one line per HTTP request + status
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLASK_PORT="${FLASK_PORT:-5001}"
JAVA_PORT="${JAVA_PORT:-8080}"
LOG_DIR="${LOG_DIR:-$ROOT/logs}"
JAR="$ROOT/StableRoomie/target/StableRoomie-1.0.0.jar"

mkdir -p "$LOG_DIR"

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }

if [ ! -f "$JAR" ]; then
  log "Jar not found - building with Maven"
  (cd "$ROOT/StableRoomie" && mvn clean package -DskipTests)
fi

if lsof -ti :"$FLASK_PORT" >/dev/null 2>&1; then
  log "Flask already listening on :$FLASK_PORT"
else
  log "Starting Flask on :$FLASK_PORT -> $LOG_DIR/flask.log"
  (cd "$ROOT/flask-api" && \
    PORT="$FLASK_PORT" PYTHONUNBUFFERED=1 \
    nohup ./venv/bin/python app.py >> "$LOG_DIR/flask.log" 2>&1 &)
fi

if lsof -ti :"$JAVA_PORT" >/dev/null 2>&1; then
  log "Spring Boot already listening on :$JAVA_PORT"
else
  log "Starting Spring Boot on :$JAVA_PORT -> $LOG_DIR/java.log"
  (cd "$ROOT/StableRoomie" && \
    FLASK_API_URL="http://127.0.0.1:$FLASK_PORT" \
    nohup java -jar "$JAR" \
      --server.tomcat.accesslog.enabled=true \
      --server.tomcat.accesslog.directory="$LOG_DIR" \
      --server.tomcat.accesslog.prefix=java-access \
      --server.tomcat.accesslog.suffix=.log \
      --server.tomcat.accesslog.rotate=false \
      --server.tomcat.accesslog.buffered=false \
      >> "$LOG_DIR/java.log" 2>&1 &)
fi

for _ in $(seq 1 30); do
  curl -sf -m 3 "http://127.0.0.1:$FLASK_PORT/health" >/dev/null 2>&1 && break
  sleep 1
done
log "Flask  http://127.0.0.1:$FLASK_PORT/health -> $(curl -s -m 5 "http://127.0.0.1:$FLASK_PORT/health" || echo 'not responding')"

for _ in $(seq 1 60); do
  curl -sf -m 3 "http://localhost:$JAVA_PORT/api/user-info" >/dev/null 2>&1 && break
  sleep 1
done
log "Java   http://localhost:$JAVA_PORT/api/user-info -> $(curl -s -m 5 "http://localhost:$JAVA_PORT/api/user-info" || echo 'not responding')"

log "Logs   $LOG_DIR (flask.log, java.log, java-access.log)"
log "Open   http://localhost:$JAVA_PORT"
