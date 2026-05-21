#!/usr/bin/env python3
"""Query Paperclip by status."""
import json, os, subprocess

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
bearer = "Authorization: Bearer " + api_key
ctype = "Content-Type: application/json"

r = subprocess.run(
    ["curl", "-s",
     "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues?status=assigned,in_progress&limit=50",
     "-H", bearer,
     "-H", ctype],
    capture_output=True, text=True, timeout=15
)
data = json.loads(r.stdout)
print(f"Assigned/in_progress count: {len(data)}")
for issue in data:
    ident = issue.get('identifier') or '(no id)'
    print(f"{ident:12s} {issue['title'][:60]}")
    print(f"  status={issue['status']} nameKey={issue.get('executionAgentNameKey','none')} agentId={issue.get('assigneeAgentId','')[:20]}")
    print(f"  full id: {issue.get('id')}")
