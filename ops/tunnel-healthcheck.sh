#!/bin/bash
# =============================================================================
# Tunnel Health Check — bot-sh-testing.studenthub.co
# Monitors cloudflared tunnel, restarts if down, alerts on auth failure.
# Designed to run as a cron job (every 2 minutes) or LaunchAgent.
# =============================================================================

set -euo pipefail

LOG=/tmp/tunnel-healthcheck.log
TUNNEL_LOG=/Library/Logs/com.cloudflare.cloudflared.err.log
CLOUDFLARED_BIN=/Users/BAWES/.local/bin/cloudflared
LAUNCHDAEMON=/Library/LaunchDaemons/com.cloudflare.cloudflared.plist

log() {
  echo "[$(date '+%H:%M:%S')] $*" >> "$LOG"
}

# ---------------------------------------------------------------------------
# 1. Health check via local Caddy (which proxies Paperclip API)
#    If Paperclip responds, the Caddy + local stack is healthy.
# ---------------------------------------------------------------------------
if curl -sf --max-time 5 http://127.0.0.1:3100/api/health; then
  # Local stack healthy — no action needed on services
  :
else
  log "CRITICAL: Paperclip API not responding on localhost:3100"
  log "Check FleetGuard — this is not a tunnel issue"
fi

# ---------------------------------------------------------------------------
# 2. Check if cloudflared is running
# ---------------------------------------------------------------------------
CLOUDFLARED_PID=$(pgrep -f "cloudflared.*tunnel" || true)

if [ -n "$CLOUDFLARED_PID" ]; then
  # Tunnel process exists — verify it can actually serve
  # Last error log timestamp check (errors within 5 min = trouble)
  if [ -f "$TUNNEL_LOG" ]; then
    LAST_ERROR=$(tail -5 "$TUNNEL_LOG" | grep -c "error" || true)
    if [ "$LAST_ERROR" -gt 0 ]; then
      RECENT=$(find "$TUNNEL_LOG" -mmin -5 2>/dev/null || echo "")
      if [ -n "$RECENT" ]; then
        log "Tunnel running (PID $CLOUDFLARED_PID) but recent errors in log"
      fi
    fi
  fi
  exit 0
fi

# ---------------------------------------------------------------------------
# 3. Tunnel is down — try to restart
# ---------------------------------------------------------------------------
log "Tunnel DOWN — attempting restart"

# Try loading via LaunchDaemon (requires sudo, may fail)
if sudo launchctl load "$LAUNCHDAEMON" 2>/dev/null; then
  log "LaunchDaemon loaded, waiting for connection..."

  # Wait up to 15s for tunnel to register
  for i in $(seq 1 15); do
    sleep 1
    CLOUDFLARED_PID=$(pgrep -f "cloudflared.*tunnel" || true)
    if [ -n "$CLOUDFLARED_PID" ]; then
      log "Tunnel started (PID $CLOUDFLARED_PID) after ${i}s via LaunchDaemon"
      exit 0
    fi
  done

  log "LaunchDaemon loaded but tunnel process not found after 15s"
fi

# ---------------------------------------------------------------------------
# 4. LaunchDaemon didn't work — try direct start (no sudo)
#    This only works if the tunnel token is valid.
# ---------------------------------------------------------------------------
log "LaunchDaemon failed — trying direct start"
nohup "$CLOUDFLARED_BIN" tunnel run --token 'eyJhIj...aiJ9' \
  > /tmp/cloudflared-direct.log 2>&1 &
DIRECT_PID=$!

for i in $(seq 1 10); do
  sleep 1
  if curl -sf --max-time 3 https://bot-sh-testing.studenthub.co/api/health 2>/dev/null; then
    log "Tunnel started directly (PID $DIRECT_PID) after ${i}s — REMOTE HEALTHY"
    exit 0
  fi
done

# Failed — kill and report
kill "$DIRECT_PID" 2>/dev/null || true
log "FAILED: tunnel token invalid or network unreachable"
log "Run 'cloudflared tunnel login' to refresh the certificate"
log "See ops/tunnel-reauth.md for instructions"

exit 1
