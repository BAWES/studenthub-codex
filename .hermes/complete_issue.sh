#!/bin/bash
# Complete STU-4867 - update issue and run status
# WRITE helper — attach to every PATCH/POST (mutate) request
WRITE_HEADERS=(
  -H "Authorization: Bearer ***
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID"
  -H "Content-Type: application/json"
)

echo "=== Try PATCH to /api/issues (root) ==="
curl -s -X PATCH "http://127.0.0.1:3100/api/issues/e1e653a2-73b1-4bdb-8534-e60dd169b373" \
  "${WRITE_HEADERS[@]}" \
  -d '{"status":"completed"}'
echo ""

echo "=== Try PUT to /api/issues (root) ==="
curl -s -X PUT "http://127.0.0.1:3100/api/issues/e1e653a2-73b1-4bdb-8534-e60dd169b373" \
  "${WRITE_HEADERS[@]}" \
  -d '{"status":"completed"}'
echo ""

echo "=== Try PATCH to /api/companies/.../issues ==="
curl -s -X PATCH "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues/e1e653a2-73b1-4bdb-8534-e60dd169b373" \
  "${WRITE_HEADERS[@]}" \
  -d '{"status":"completed"}'
echo ""

echo "=== Try POST to /api/companies/.../issues/.../complete ==="
curl -s -X POST "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues/e1e653a2-73b1-4bdb-8534-e60dd169b373/complete" \
  "${WRITE_HEADERS[@]}" \
  -d '{}'
echo ""