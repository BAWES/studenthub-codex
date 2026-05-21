#!/usr/bin/env python3
"""Find coder2 issue - clean version."""
import json, os, subprocess

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
headers = {
    "Authorization": "Bearer " + api_key,
    "Content-Type": "application/json"
}

r = subprocess.run(
    ["curl", "-s",
     "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues?limit=200"],
    capture_output=True, text=True, timeout=15,
    env={**os.environ, "CURL_HEADER_AUTH": "Bearer " + api_key}
)

# Use requests style - no, use subprocess with header file or env
# Actually let's use -H with the bearer token via subprocess args list, no f-strings
r2 = subprocess.run(
    ["curl", "-s",
     "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues?limit=200",
     "-H", "Authorization: Bearer " + api_key,
     "-H", "Content-Type: application/json"],
    capture_output=True, text=True, timeout=15
)
data = json.loads(r2.stdout)
print(f"Total issues returned: {len(data)}")

keys = set()
for issue in data:
    nk = issue.get("executionAgentNameKey")
    if nk:
        keys.add(nk)
print(f"Agent name keys found: {keys}")

found = False
for issue in data:
    nk = issue.get("executionAgentNameKey")
    if nk and nk == "coder2":
        print(f"\nCODER2: {issue['identifier']} - {issue['title']}")
        print(f"  status={issue['status']} runId={issue.get('executionRunId')}")
        print(f"  startedAt={issue.get('startedAt')} completedAt={issue.get('completedAt')}")
        found = True
        break

if not found:
    for issue in data:
        if "e1e653a2" in issue.get("id",""):
            print(f"Found e1e653a2: {issue.get('identifier','?')} - {issue['title']}")
            print(f"  executionAgentNameKey={issue.get('executionAgentNameKey')}")
