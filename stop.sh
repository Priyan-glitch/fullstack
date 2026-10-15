#!/usr/bin/env bash
# Stop the local StableRoomie services.
set -euo pipefail

FLASK_PORT="${FLASK_PORT:-5001}"
JAVA_PORT="${JAVA_PORT:-8080}"

for port in "$JAVA_PORT" "$FLASK_PORT"; do
  pids="$(lsof -ti :"$port" 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null || true
    echo "Stopped listener on :$port (pids: $pids)"
  else
    echo "Nothing listening on :$port"
  fi
done
