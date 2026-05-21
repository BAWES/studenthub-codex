#!/usr/bin/env python3
import json, os, subprocess

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
base = "http://127.0.0.1:3100/api"
company_id = "f56ea475-d349-431c-9a40-3111f1a49819"

r = subprocess.run(
    ["curl", "-s", f"{base}/companies/{company_id}/issues?limit=10&sort=updatedAt:desc",
     "-H", "Authorization: Bearer " + api_key,
     "-H", "Content-Type: application/json"],
    capture_output=True, text=True, timeout=15
)
data = json.loads(r.stdout)
print(f"Got {len(data)} issues")
for i, issue in enumerate(data[:10]):
    print(f"\n[{i}] {issue.get('identifier','?'):12s} title={issue['title'][:60]}")
    print(f"    status={issue.get('status'):15s} nameKey={issue.get('executionAgentNameKey','none')}")
    aid = issue.get('assigneeAgentId','')
    print(f"    assigneeAgentId={aid}")

print("\n\n=== Looking for coder2 ===")
for issue in data:
    if issue.get('executionAgentNameKey') == 'coder2':
        print(f"FOUND: {issue.get('identifier')} - {issue['title']}")
        print(json.dumps(issue, indent=2, default=str)[:2000])
