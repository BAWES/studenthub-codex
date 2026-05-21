#!/bin/bash
BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"
AUTH=*** Bearer ***
CTYPE="Content-Type: application/json"

echo "=== Check run endpoint ==="
curl -s "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207" -H "$AUTH" -H "$CTYPE"
echo ""

echo "=== Check issues with status ==="
curl -s "$BASE/issues?status=assigned,in_progress&limit=10" -H "$AUTH" -H "$CTYPE" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(f"Issues found: {len(d)}");[print(f"  {i.get(chr(105)+chr(100))[:20] if i.get(chr(105)+chr(100)) else chr(63)}  status={i[chr(115)+chr(116)+chr(97)+chr(116)+chr(117)+chr(115)]}  nameKey={i.get(chr(101)+chr(120)+chr(101)+chr(99)+chr(117)+chr(116)+chr(105)+chr(111)+chr(110)+chr(65)+chr(103)+chr(101)+chr(110)+chr(116)+chr(78)+chr(97)+chr(109)+chr(101)+chr(75)+chr(101)+chr(121),chr(63))}") for i in d]'