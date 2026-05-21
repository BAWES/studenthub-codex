#!/usr/bin/env python3
"""Debug Paperclip API call."""
import json, os, subprocess

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
base = "http://127.0.0.1:3100/api"
company_id = "f56ea475-d349-431c-9a40-3111f1a49819"

r = subprocess.run(
    ["curl", "-s", f"{base}/companies/{company_id}/issues?limit=5&sort=updatedAt:desc",
     "-H", f"Authorization: Bearer ***     "-H", "Content-Type: application/json"],
    capture_output=True, text=True, timeout=15
)
data = json.loads(r.stdout)
print(f"Got {len(data)} issues")
for i, issue in enumerate(data[:5]):
    print(f"\n[{i}] {issue.get('identifier','?'):12s} title={issue['title'][:60]}")
    print(f"    status={issue.get('status')} agentNameKey={issue.get('executionAgentNameKey')}")
    print(f"    assigneeAgentId={issue.get('assigneeAgentId')}")
