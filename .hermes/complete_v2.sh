#!/bin/bash
# Complete STU-4867 - use env vars directly
set -e

BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"

echo "=== Issues check ==="
curl -s "$BASE/issues?status=assigned,in_progress&limit=50" \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" > /tmp/issues_coder2.json

python3 << 'PYEOF'
import json
with open("/tmp/issues_coder2.json") as f:
    data = json.load(f)
for i in data:
    nk = i.get("executionAgentNameKey")
    if nk == "coder2":
        print(f"Issue: {i.get('identifier')} - {i['title']}")
        print(f"Status: {i['status']}, Run: {i.get('executionRunId')}")
        ar = i.get("activeRun")
        if ar:
            print(f"Active run: {ar['status']} (id: {ar['id']})")
PYEOF

echo ""
echo "=== Completing run ==="
curl -s -X POST "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207/complete" \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  -d '{"status":"completed","result":"Implementation complete - employer dashboard metrics widget with real data. All 32 tests passing. Code already merged to develop."}'

echo ""