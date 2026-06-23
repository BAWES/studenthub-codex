#!/bin/bash
# Fleet Pulse — reports agent status, PR queue, build health to Discord
REPO_DIR="/Users/BAWES/Sites/studenthub/studenthub-next"
DISCORD_WEBHOOK="${DISCORD_FLEET_WEBHOOK:-}"  # Set this env var

# Collect data
cd "$REPO_DIR" 2>/dev/null || exit 1

TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")

PR_QUEUE=$(gh pr list --repo BAWES/studenthub-codex --state open --json number,title,headRefName,baseRefName,mergeable 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    dev_prs = [p for p in data if p.get('baseRefName') == 'develop']
    main_prs = [p for p in data if p.get('baseRefName') == 'main']
    conflicts = [p for p in data if p.get('mergeable') == 'CONFLICTING']
    print(f\"develop: {len(dev_prs)} open, main: {len(main_prs)} open, {len(conflicts)} conflicting\")
except: print('unknown')
" 2>/dev/null)

AGENTS=$(curl -s "http://localhost:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/agents" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for a in data:
        status_icon = '🟢' if a['status'] == 'running' else '🟡' if a['status'] == 'idle' else '🔴' if a['status'] == 'error' else '⚪'
        print(f\"{status_icon} {a['name']:12} {a['status']:8}\")
except: print('  API unreachable')
" 2>/dev/null)

DEV_SERVER=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 3 2>/dev/null || echo "down")

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Build message
MSG="📡 **FLEET PULSE** — $TIMESTAMP

**Build:** TS errors: $TS_ERRORS | Dev server: $DEV_SERVER
**PR Queue:** $PR_QUEUE

**Agents:**
$AGENTS"

echo "$MSG"

# Send to Discord if webhook configured
if [ -n "$DISCORD_WEBHOOK" ]; then
  curl -s -X POST "$DISCORD_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"$MSG\"}" 2>/dev/null
fi