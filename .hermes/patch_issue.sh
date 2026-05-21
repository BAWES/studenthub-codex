#!/bin/bash
# Try different PATCH payload formats
WRITE_HEADERS=(
  -H "Authorization: Bearer ***  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID"
  -H "Content-Type: application/json"
)

ID="e1e653a2-73b1-4bdb-8534-e60dd169b373"
BASE="http://127.0.0.1:3100/api"

echo "=== PATCH with status fields only ==="
curl -s -X PATCH "$BASE/issues/$ID" "${WRITE_HEADERS[@]}" \
  -d '{"status":"completed"}'
echo ""

echo "=== PATCH with full update shape ==="
curl -s -X PATCH "$BASE/issues/$ID" "${WRITE_HEADERS[@]}" \
  -d '{"status":"completed","completedAt":"2026-06-16T20:15:00Z","executionState":"success"}'
echo ""

echo "=== PATCH with nested data ==="
curl -s -X PATCH "$BASE/issues/$ID" "${WRITE_HEADERS[@]}" \
  -d '{"data":{"status":"completed"}}'
echo ""

echo "=== PATCH with fields ==="
curl -s -X PATCH "$BASE/issues/$ID" "${WRITE_HEADERS[@]}" \
  -d '{"fields":{"status":"completed"}}'
echo ""

# Also try to finish the run
echo "=== Try run PATCH ==="
curl -s -X PATCH "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207" "${WRITE_HEADERS[@]}" \
  -d '{"status":"completed"}'
echo ""

echo "=== Try run /done POST ==="
curl -s -X POST "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207/done" "${WRITE_HEADERS[@]}" \
  -d '{"status":"completed"}'
echo ""