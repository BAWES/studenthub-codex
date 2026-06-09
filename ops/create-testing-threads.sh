#!/usr/bin/env bash
# =============================================================================
# create-testing-threads.sh
# 
# Polls Paperclip API for recently-completed issues and creates Discord forum
# threads in #testing for QA review.
#
# Usage:
#   ./create-testing-threads.sh              # Default: check last 30 min
#   ./create-testing-threads.sh 60           # Check last 60 min
#   ./create-testing-threads.sh --once       # One-shot: check all recent
#
# Requirements:
#   - curl, jq
#   - PAPERCLIP_API_KEY (or local_trusted mode)
#   - DISCORD_BOT_TOKEN in ~/.hermes/.env or env
# =============================================================================
set -euo pipefail

# --- Config ----------------------------------------------------------------
COMPANY_ID="f56ea475-d349-431c-9a40-3111f1a49819"
PAPERCLIP_API="http://127.0.0.1:3100/api"
FORUM_CHANNEL_ID="1513600918678016221"

# Tracking file — stores IDs of already-processed issues
TRACKING_FILE="${HOME}/.hermes/data/testing-threads-tracked.txt"

# How far back to look (in minutes)
LOOKBACK_MINUTES="${1:-30}"

# --- Load secrets ----------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Discord token from env or .env
if [ -z "${DISCORD_BOT_TOKEN:-}" ]; then
  if [ -f "${HOME}/.hermes/.env" ]; then
    DISCORD_BOT_TOKEN="$(grep '^DISCORD_BOT_TOKEN=' "${HOME}/.hermes/.env" | head -1 | cut -d= -f2 | tr -d ' ')"
  fi
fi

if [ -z "${DISCORD_BOT_TOKEN:-}" ]; then
  echo "ERROR: DISCORD_BOT_TOKEN not found" >&2
  exit 1
fi

# Determine the cutoff timestamp (ISO 8601)
if command -v gdate &>/dev/null; then
  CUTOFF=$(gdate -u -d "-${LOOKBACK_MINUTES} minutes" +%Y-%m-%dT%H:%M:%SZ)
elif command -v date &>/dev/null; then
  CUTOFF=$(date -u -v"-${LOOKBACK_MINUTES}M" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || \
           date -u -d "-${LOOKBACK_MINUTES} minutes" +%Y-%m-%dT%H:%M:%SZ)
else
  echo "ERROR: date command not available" >&2
  exit 1
fi

echo "[$(date +%H:%M:%S)] Checking for issues completed since ${CUTOFF}..."

# --- Fetch recently-completed issues ---------------------------------------
ISSUES=$(curl -sf "${PAPERCLIP_API}/companies/${COMPANY_ID}/issues?status=done&limit=50&sort=newest" 2>/dev/null || echo "[]")

echo "${ISSUES}" | jq -c '.[] | select(.completedAt >= $cutoff)' --arg cutoff "${CUTOFF}" | while read -r issue; do
  ISSUE_ID=$(echo "${issue}" | jq -r '.id // empty')
  TITLE=$(echo "${issue}" | jq -r '.title // "Untitled"')
  IDENTIFIER=$(echo "${issue}" | jq -r '.identifier // "STU-???"')
  COMPLETED=$(echo "${issue}" | jq -r '.completedAt // "unknown"')

  # Skip if already tracked
  if [ -f "${TRACKING_FILE}" ] && grep -qF "${ISSUE_ID}" "${TRACKING_FILE}" 2>/dev/null; then
    echo "  ⏭  ${IDENTIFIER} — already tracked, skipping"
    continue
  fi

  # Only create threads for code-related issues (not self-healing/quality meta)
  TITLE_LOWER=$(echo "${TITLE}" | tr '[:upper:]' '[:lower:]')
  case "${TITLE_LOWER}" in
    *"self-healing"*|*"quality"*|*"escalation"*|*"hire"*|*"fire"*)
      echo "  ⏭  ${IDENTIFIER} — meta issue, skipping"
      # Still track it so we don't re-check
      mkdir -p "$(dirname "${TRACKING_FILE}")"
      echo "${ISSUE_ID}" >> "${TRACKING_FILE}"
      continue
      ;;
  esac

  echo "  🆕 ${IDENTIFIER}: ${TITLE:0:60}..."

  # --- Create Discord forum thread -----------------------------------------
  THREAD_NAME="[${IDENTIFIER}] ${TITLE:0:90}"

  THREAD_PAYLOAD=$(jq -n \
    --arg name "${THREAD_NAME}" \
    --arg content "**QA Testing Required:** ${IDENTIFIER} — ${TITLE}

Please verify the implementation and report any issues.

**Issue:** ${IDENTIFIER}
**Completed:** ${COMPLETED}
**Assigned to:** QA" \
    '{
      name: $name,
      auto_archive_duration: 1440,
      message: {
        content: $content
      }
    }')

  THREAD_RESPONSE=$(curl -sf -X POST \
    "https://discord.com/api/v10/channels/${FORUM_CHANNEL_ID}/threads" \
    -H "Authorization: Bot ${DISCORD_BOT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "${THREAD_PAYLOAD}" 2>/dev/null || echo "ERROR")

  # Check result
  THREAD_ID=$(echo "${THREAD_RESPONSE}" | jq -r '.id // empty' 2>/dev/null)

  if [ -n "${THREAD_ID}" ]; then
    echo "  ✅ Thread created: #${THREAD_NAME} (${THREAD_ID})"
  else
    ERROR_MSG=$(echo "${THREAD_RESPONSE}" | jq -r '.message // empty' 2>/dev/null || echo "${THREAD_RESPONSE}")
    echo "  ❌ Failed to create thread: ${ERROR_MSG}"
  fi

  # Track regardless of success (avoid infinite retry loops)
  mkdir -p "$(dirname "${TRACKING_FILE}")"
  echo "${ISSUE_ID}" >> "${TRACKING_FILE}"
done

echo "[$(date +%H:%M:%S)] Done."
