#!/bin/bash
# Complete STU-4867 - mark issue and run as done
set -e

BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"

echo "=== Current issue state ==="
curl -s "$BASE/issues?status=assigned,in_progress&limit=50" \
  -H "Authorization: Bearer $PAPER...EY" \
  -H "Content-Type: application/json" | python3 -c '
import json,sys
data=json.load(sys.stdin)
for i in data:
    if i.get("executionAgentNameKey") == "coder2":
        print(f"Issue: {i.get(\"identifier\")} - {i.get(\"title\")}")
        print(f"Status: {i.get(\"status\")}")
        print(f"Run: {i.get(\"executionRunId\")}")
        ar = i.get("activeRun")
        if ar:
            print(f"Active run: {ar.get(\"status\")} (id: {ar.get(\"id\")})")
'

echo ""
echo "=== Completing run c539ac43 ==="
curl -s -X POST "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207/complete" \
  -H "Authorization: Bearer $PAPER...EY" \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  -d '{"status":"completed"}'

echo ""
echo "=== Completed ==="