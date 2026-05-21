#!/bin/bash
BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"
AUTH=*** Bearer ***
CTYPE="Content-Type: application/json"

echo "=== Try POST/PATCH on issues ==="
echo "--- POST to /issues ---"
curl -s -X POST "$BASE/issues" -H "$AUTH" -H "$CTYPE" -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" -d '{"status":"done","id":"e1e653a2-73b1-4bdb-8534-e60dd169b373"}' | python3 -c 'import json,sys;d=json.load(sys.stdin);print(json.dumps(d,indent=2)[:300])'
echo ""

echo "--- PATCH with query param ---"
curl -s -X PATCH "$BASE/issues/status" -H "$AUTH" -H "$CTYPE" -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" -d '{"id":"e1e653a2-73b1-4bdb-8534-e60dd169b373","status":"done"}' | python3 -c 'import json,sys;d=json.load(sys.stdin);print(json.dumps(d,indent=2)[:300])'
echo ""

echo "--- Check runs endpoint ---"
curl -s "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207" -H "$AUTH" -H "$CTYPE" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(f"Run found, status={d.get(chr(115)+chr(116)+chr(97)+chr(116)+chr(117)+chr(115))}")' 2>/dev/null || echo "Run not found by ID"

echo ""
echo "=== Get runs list ==="
curl -s "$BASE/runs?limit=3" -H "$AUTH" -H "$CTYPE" | python3 -c 'import json,sys;d=json.load(sys.stdin);[print(f"  run {r.get(chr(105)+chr(100),chr(63))[:30]}... status={r.get(chr(115)+chr(116)+chr(97)+chr(116)+chr(117)+chr(115))}") for r in (d if isinstance(d,list) else [])]' 2>/dev/null || echo "FAIL"
echo ""

echo "=== Check Paperclip API swagger/openapi ==="
curl -s "http://127.0.0.1:3100/api/docs" -H "$AUTH" -H "$CTYPE" | head -c 200 2>/dev/null || echo "No docs endpoint"
echo ""