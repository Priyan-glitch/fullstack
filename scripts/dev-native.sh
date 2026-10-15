#!/usr/bin/env bash
#
# Starts the whole Stable Roomies stack on the host, with no Docker.
#
# Docker is the supported deployment (infrastructure/docker), but it needs the
# service images to be built and pulled. This script exists so the app can be run
# and tested end to end on a machine where Docker is unavailable or unwanted.
#
# Usage:
#   scripts/dev-native.sh start     # start everything, wait for readiness
#   scripts/dev-native.sh stop      # stop everything this script started
#   scripts/dev-native.sh status    # show what is up
#   scripts/dev-native.sh logs auth-service
#
# Notes:
#   - Each Spring service is run from its own directory, because its
#     application.yml resolves ../../.env relative to the working directory.
#   - Every process writes to logs/<name>.log. Nothing is piped, so a service
#     that daemonizes or holds its stdout open cannot block this script.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT/logs"
RUN_DIR="$ROOT/logs/.pids"
mkdir -p "$LOG_DIR" "$RUN_DIR"

# The engine stores allocation runs in its own database and defaults to
# postgres:postgres@localhost:5432/algorithm_db. A Homebrew Postgres has no
# `postgres` role — its superuser is the OS user — so point it at that instead.
# Create the database once with: createdb algorithm_db
# Override DATABASE_URL to use a hosted database.
export DATABASE_URL="${DATABASE_URL:-postgresql+psycopg2://${USER}@127.0.0.1:5432/algorithm_db}"

# Maven must RUN on JDK 21, not merely target it. Homebrew's Maven picks up the
# newest JDK on the machine (26 at time of writing), and on a JDK newer than
# Lombok supports, Lombok's annotation processor silently stops running:
# notification-service then fails with "cannot find symbol" for every generated
# getter, while the other services still build because none of them use Lombok.
jdk_version() {
  "$1/bin/javac" -version 2>&1 | sed -nE 's/.* ([0-9]+)(\.[0-9]+)*.*/\1/p' | head -1
}

if [[ -z "${JAVA_HOME:-}" ]] || [[ "$(jdk_version "${JAVA_HOME:-/nonexistent}")" != "21" ]]; then
  for candidate in \
    /Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home \
    /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home \
    /usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
  do
    if [[ -x "$candidate/bin/javac" ]] && [[ "$(jdk_version "$candidate")" == "21" ]]; then
      export JAVA_HOME="$candidate"
      break
    fi
  done
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "! No JDK 21 found. Set JAVA_HOME to a JDK 21 before running this script —" >&2
  echo "  building on a newer JDK breaks Lombok in notification-service." >&2
  exit 1
fi

# Gateway upstreams. The Caddyfile defaults to Docker service names, which do not
# resolve here, so every host is pointed at localhost.
export AUTH_SERVICE_HOST=localhost
export STUDENT_SERVICE_HOST=localhost
export HOSTEL_SERVICE_HOST=localhost
export ALLOCATION_SERVICE_HOST=localhost
export NOTIFICATION_SERVICE_HOST=localhost
export ALGORITHM_ENGINE_HOST=localhost
export FRONTEND_HOST=localhost
# 80 needs root, and 8080 is a common default already taken by other projects on
# this machine (it is what the frontend's VITE_GATEWAY_BASE_URL points at).
export GATEWAY_PORT="${GATEWAY_PORT:-8888}"

# The gateway answers every preflight with one fixed CORS origin, so it must name
# the port Vite actually lands on — a response echoed for the wrong origin is
# blocked by the browser. Vite's default is 5173, but it silently takes the next
# free port if that is busy, so set FRONTEND_DEV_PORT to match if it does.
export CORS_ALLOW_ORIGIN="${CORS_ALLOW_ORIGIN:-http://localhost:${FRONTEND_DEV_PORT:-5173}}"

# JWT secret is read from .env by both auth-service and the gateway. Export it
# here so the gateway sees the same value the service signs with.
if [[ -f "$ROOT/.env" ]]; then
  JWT_LINE="$(grep -E '^JWT_SECRET=' "$ROOT/.env" | head -1)"
  if [[ -n "$JWT_LINE" ]]; then
    export JWT_SECRET="${JWT_LINE#JWT_SECRET=}"
  fi
fi

# Ports each component listens on, used for the readiness wait.
declare -a COMPONENTS=(
  "auth-service:8085"
  "student-service:8081"
  "hostel-service:8082"
  "allocation-service:8083"
  "notification-service:8084"
  "algorithm-engine:8090"
)

spring_start() {
  local name="$1"
  ( cd "$ROOT/backend/$name" && exec mvn -q -B spring-boot:run ) \
    > "$LOG_DIR/$name.log" 2>&1 &
  echo $! > "$RUN_DIR/$name.pid"
}

engine_start() {
  local dir="$ROOT/algorithm-engine"
  if [[ ! -x "$dir/venv/bin/python" ]]; then
    echo "  ! algorithm-engine venv missing — run: python3 -m venv venv && venv/bin/pip install -r requirements.txt"
    return 1
  fi
  ( cd "$dir" && exec ./venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8090 ) \
    > "$LOG_DIR/algorithm-engine.log" 2>&1 &
  echo $! > "$RUN_DIR/algorithm-engine.pid"
}

gateway_start() {
  local bin="${CADDY_BIN:-}"
  if [[ -z "$bin" ]]; then
    if command -v caddy >/dev/null 2>&1; then
      bin="$(command -v caddy)"
    elif [[ -x /tmp/caddy-jwt-build/caddy ]]; then
      bin=/tmp/caddy-jwt-build/caddy
    else
      echo "  ! no caddy binary found. The stock caddy image cannot verify JWTs —"
      echo "    it must be built with the ggicci/caddy-jwt module:"
      echo "      xcaddy build --with github.com/ggicci/caddy-jwt"
      echo "    then either put it on PATH or set CADDY_BIN."
      return 1
    fi
  fi
  ( cd "$ROOT" && exec "$bin" run --config gateway/Caddyfile ) \
    > "$LOG_DIR/gateway.log" 2>&1 &
  echo $! > "$RUN_DIR/gateway.pid"
}

port_open() {
  nc -z 127.0.0.1 "$1" >/dev/null 2>&1
}

# A bare TCP check is not enough for the gateway: another project's process may
# already hold the port. Caddy identifies itself in the Server header, so require
# that too rather than reporting a foreign listener as "gateway up".
gateway_ready() {
  curl -sS -m 3 -o /dev/null -D - "http://127.0.0.1:$GATEWAY_PORT/" 2>/dev/null | grep -qi '^server: caddy'
}

wait_ready() {
  local name="$1" port="$2" waited=0
  while (( waited < 150 )); do
    if port_open "$port"; then
      printf '  \033[32m✔\033[0m %-22s :%s\n' "$name" "$port"
      return 0
    fi
    sleep 3; waited=$((waited + 3))
  done
  printf '  \033[31m✘\033[0m %-22s :%s  (not listening after %ss — see logs/%s.log)\n' "$name" "$port" "$waited" "$name"
  return 1
}

start_all() {
  echo "Starting backend services (logs → logs/)…"
  for spec in "${COMPONENTS[@]}"; do
    name="${spec%%:*}"; port="${spec##*:}"
    case "$name" in
      algorithm-engine) engine_start ;;
      *) spring_start "$name" ;;
    esac
  done

  echo "Waiting for readiness…"
  for spec in "${COMPONENTS[@]}"; do
    wait_ready "${spec%%:*}" "${spec##*:}"
  done

  if gateway_start; then
    waited=0
    while (( waited < 60 )); do
      if gateway_ready; then
        printf '  \033[32m✔\033[0m %-22s :%s\n' gateway "$GATEWAY_PORT"
        break
      fi
      sleep 3; waited=$((waited + 3))
    done
    if (( waited >= 60 )); then
      printf '  \033[31m✘\033[0m %-22s :%s  (see logs/gateway.log — is another process holding the port?)\n' gateway "$GATEWAY_PORT"
    fi
  fi

  echo
  echo "Frontend is not started by this script — run 'npm run dev' in frontend/."
  echo "Tear down with: scripts/dev-native.sh stop"
}

stop_all() {
  echo "Stopping…"
  for pidfile in "$RUN_DIR"/*.pid; do
    [[ -e "$pidfile" ]] || continue
    name="$(basename "$pidfile" .pid)"
    pid="$(cat "$pidfile")"
    # A Spring service runs under a maven wrapper process, so kill the group.
    if kill -0 "$pid" 2>/dev/null; then
      pkill -P "$pid" 2>/dev/null
      kill "$pid" 2>/dev/null
      printf '  stopped %s (pid %s)\n' "$name" "$pid"
    fi
    rm -f "$pidfile"
  done

  # `mvn spring-boot:run` forks a child JVM, and that JVM does not always die
  # with the Maven process — it keeps the port, and the next start then fails
  # with "Port 8081 was already in use". So free the ports explicitly too.
  for spec in "${COMPONENTS[@]}" "gateway:$GATEWAY_PORT"; do
    name="${spec%%:*}"; port="${spec##*:}"
    pid="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | head -1)"
    [[ -z "$pid" ]] && continue
    # Only ours: never kill an unrelated process that happens to hold the port.
    if ps -p "$pid" -o command= 2>/dev/null | grep -qE "stable-roomies|${name}"; then
      kill "$pid" 2>/dev/null && printf '  freed %s on port %s (pid %s)\n' "$name" "$port" "$pid"
    else
      printf '  ! port %s is held by an unrelated process (pid %s) — left alone\n' "$port" "$pid"
    fi
  done
  echo "Done."
}

status_all() {
  for spec in "${COMPONENTS[@]}"; do
    name="${spec%%:*}"; port="${spec##*:}"
    if port_open "$port"; then
      printf '  \033[32mup\033[0m    %-22s :%s\n' "$name" "$port"
    else
      printf '  \033[31mdown\033[0m  %-22s :%s\n' "$name" "$port"
    fi
  done
  if gateway_ready; then
    printf '  \033[32mup\033[0m    %-22s :%s\n' gateway "$GATEWAY_PORT"
  else
    printf '  \033[31mdown\033[0m  %-22s :%s\n' gateway "$GATEWAY_PORT"
  fi
}

case "${1:-}" in
  start)  start_all ;;
  stop)   stop_all ;;
  status) status_all ;;
  logs)   tail -n 80 "$LOG_DIR/${2:?usage: logs <name>}.log" ;;
  *)      sed -n '3,14p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ;;
esac
