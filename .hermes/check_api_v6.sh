#!/bin/bash
BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"
AUTH=*** Bearer ***
CTYPE="Content-Type: application/json"

echo "=== Run details ==="
curl -s "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207" -H "$AUTH" -H "$CTYPE"
echo ""

echo "=== Runs list ==="
curl -s "$BASE/runs?limit=5" -H "$AUTH" -H "$CTYPE"
echo ""

echo "=== PATCH run ==="
curl -s -X PATCH "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207" -H "$AUTH" -H "$CTYPE" -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" -d '{"status":"completed"}'
echo ""

echo "=== POST complete run ==="
curl -s -X POST "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207/done" -H "$AUTH" -H "$CTYPE" -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" -d '{"status":"completed"}'
echo ""