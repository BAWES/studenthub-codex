#!/bin/bash
BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"
AUTH="Authorization: Bearer $PAPER...EY"
CTYPE="Content-Type: application/json"

echo "=== Check run endpoint ==="
curl -s "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207" -H "$AUTH" -H "$CTYPE"
echo ""

echo "=== Check specific issue ==="
curl -s "$BASE/issues?executionAgentNameKey=coder2&limit=10" -H "$AUTH" -H "$CTYPE"
echo ""

echo "=== Try PATCH on issue ==="
curl -s -X PATCH "$BASE/issues/e1e653a2-73b1-4bdb-8534-e60dd169b373" -H "$AUTH" -H "$CTYPE" -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" -d '{"status":"done"}'
echo ""