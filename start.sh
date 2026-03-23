#!/usr/bin/env bash
set -euo pipefail

cd stronaQr

# Railway exposes the runtime port as PORT.
export SERVER_PORT="${PORT:-8080}"

# Build jar if it does not exist yet, then run it.
if ! ls build/libs/*.jar >/dev/null 2>&1; then
  ./gradlew clean bootJar -x test --no-daemon
fi

exec java -jar build/libs/*.jar
