#!/bin/bash
BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"
AUTH=*** Bearer ***
CTYPE="Content-Type: application/json"

# Check for coder2 issue specifically by scanning all issues with status filter
echo "=== Issues with status=in_progress ==="
curl -s "$BASE/issues?status=in_progress&limit=50" -H "$AUTH" -H "$CTYPE" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(f"in_progress count: {len(d)}");[print(f"  {i.get(chr(105)+chr(100))[:20]}... agentKey={i.get(chr(101)+chr(120)+chr(101)+chr(99)+chr(117)+chr(116)+chr(105)+chr(111)+chr(110)+chr(65)+chr(103)+chr(101)+chr(110)+chr(116)+chr(78)+chr(97)+chr(109)+chr(101)+chr(75)+chr(101)+chr(121),chr(63))}") for i in d]'
echo ""

# Try available endpoints
echo "=== Available endpoints ==="
for ep in "" "runs" "issues" "goals" "agents" "heartbeats" "scheduler"; do
  result=$(curl -s "$BASE/$ep?limit=1" -H "$AUTH" -H "$CTYPE" 2>/dev/null)
  if echo "$result" | python3 -c 'import json,sys;json.load(sys.stdin);print("OK")' 2>/dev/null; then
    echo "  $ep: OK"
  else
    echo "  $ep: FAIL ($(echo $result | head -c 100))"
  fi
done

echo ""
echo "=== Specific issue by ID ==="
curl -s "$BASE/issues/e1e653a2-73b1-4bdb-8534-e60dd169b373" -H "$AUTH" -H "$CTYPE"
echo ""

echo "=== Goals ==="
curl -s "$BASE/goals?limit=3" -H "$AUTH" -H "$CTYPE"
echo ""