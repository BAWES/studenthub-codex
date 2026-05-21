#!/bin/bash
# Complete STU-4867
set -e

BASE="http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819"

echo "=== Completing run c539ac43 ==="
curl -s -X POST "$BASE/runs/c539ac43-1371-4975-8ca3-f6855bd91207/complete" \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  -d '{"status":"completed","result":"Implementation verified: employer dashboard metrics widget with real data. All 32 tests passing. Code already on develop."}'

echo ""