#!/usr/bin/env bash
# Follow the StableRoomie service logs.
#
#   ./logs.sh          both service logs
#   ./logs.sh flask    Flask matching service
#   ./logs.sh java     Spring Boot application log
#   ./logs.sh access   Tomcat access log (one line per request, with status)
#   ./logs.sh errors   only ERROR / WARN / 4xx / 5xx lines across all logs
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${LOG_DIR:-$ROOT/logs}"

case "${1:-all}" in
  flask)  exec tail -f "$LOG_DIR/flask.log" ;;
  java)   exec tail -f "$LOG_DIR/java.log" ;;
  access) exec tail -f "$LOG_DIR/java-access.log" ;;
  errors) exec tail -f "$LOG_DIR"/*.log | grep --line-buffered -E "ERROR|WARN|Exception| [45][0-9][0-9] " ;;
  all)
    touch "$LOG_DIR/flask.log" "$LOG_DIR/java.log" "$LOG_DIR/java-access.log"
    exec tail -f "$LOG_DIR/flask.log" "$LOG_DIR/java.log" "$LOG_DIR/java-access.log"
    ;;
  *) echo "usage: $0 [all|flask|java|access|errors]" >&2; exit 1 ;;
esac
