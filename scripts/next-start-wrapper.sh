#!/bin/bash
# ---------------------------------------------------------------------------
# next-start-wrapper.sh — runs `next start` in a restart loop.
#
# Next.js production server can crash under heavy E2E load (memory pressure).
# This wrapper restarts it automatically so Playwright tests don't all fail
# with ECONNREFUSED after the first crash.
#
# Behaviour:
#   - Starts `next start` and waits for it to finish.
#   - If the process exits with a non-signal exit code (crash), restart it.
#   - If the process exits due to SIGTERM/SIGINT (Playwright shutting us down),
#     exit cleanly without restarting.
#   - Captures and shows the crash log for debugging.
#
# Usage in playwright.config.ts:
#   webServer: {
#     command: "bash scripts/next-start-wrapper.sh",
#     port: 3000,
#     reuseExistingServer: true,
#     timeout: 120_000,
#   }
# ---------------------------------------------------------------------------
set -euo pipefail

MAX_RESTARTS=5
RESTART_COUNT=0

cleanup() {
    local exit_signal="$1"
    if [ -n "${CHILD_PID:-}" ]; then
        kill "$exit_signal" "$CHILD_PID" 2>/dev/null || true
        wait "$CHILD_PID" 2>/dev/null || true
    fi
    exit 0
}

# Forward termination signals to child, then exit without restarting.
trap 'cleanup TERM' TERM
trap 'cleanup INT' INT
trap 'cleanup HUP' HUP

while [ "$RESTART_COUNT" -lt "$MAX_RESTARTS" ]; do
    echo "[next-start-wrapper] Starting next start (attempt $((RESTART_COUNT + 1))/$MAX_RESTARTS)..."
    npx next start &
    CHILD_PID=$!
    wait "$CHILD_PID"
    EXIT_CODE=$?
    CHILD_PID=""

    if [ "$EXIT_CODE" -eq 0 ]; then
        echo "[next-start-wrapper] next start exited cleanly (exit=0). Done."
        exit 0
    fi

    # If we received a signal ourselves, exit without restart.
    # The trap handler above already called cleanup, but just in case:
    if [ "$EXIT_CODE" -ge 128 ] && [ "$EXIT_CODE" -le 160 ]; then
        echo "[next-start-wrapper] next start exited due to signal ($EXIT_CODE). Exiting."
        exit 0
    fi

    RESTART_COUNT=$((RESTART_COUNT + 1))
    echo "[next-start-wrapper] next start crashed (exit=$EXIT_CODE). Restarting ($RESTART_COUNT/$MAX_RESTARTS)..."
    sleep 1
done

echo "[next-start-wrapper] Max restarts ($MAX_RESTARTS) reached. Exiting."
exit 1
