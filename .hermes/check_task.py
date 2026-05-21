#!/usr/bin/env python3
"""Check Paperclip for Coder2 tasks."""
import json, os, sys

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
base = "http://127.0.0.1:3100/api"
company_id = "f56ea475-d349-431c-9a40-3111f1a49819"

# Get all issues, find coder2
import subprocess

def curl_get(path):
    r = subprocess.run(
        ["curl", "-s", f"{base}{path}",
         "-H", f"Authorization: Bearer {api_key}",
         "-H", "Content-Type: application/json"],
        capture_output=True, text=True, timeout=15
    )
    return json.loads(r.stdout)

issues = curl_get(f"/companies/{company_id}/issues?limit=100&sort=updatedAt:desc")

coder2_issue = None
for issue in issues:
    if issue.get("executionAgentNameKey") == "coder2":
        coder2_issue = issue
        break

if coder2_issue:
    print("=== CODER2 ASSIGNED TASK ===")
    print(f"  ID: {coder2_issue['id']}")
    print(f"  Title: {coder2_issue['title']}")
    print(f"  Identifier: {coder2_issue.get('identifier','N/A')}")
    print(f"  Status: {coder2_issue['status']}")
    print(f"  Execution State: {coder2_issue.get('executionState')}")
    print(f"  Started At: {coder2_issue.get('startedAt')}")
    print(f"  Priority: {coder2_issue.get('priority')}")
    print(f"  Description: {coder2_issue.get('description','')[:1000]}")
    handoff = coder2_issue.get("successfulRunHandoff")
    if handoff:
        print(f"  Handoff: {json.dumps(handoff, indent=2)}")
    ar = coder2_issue.get("activeRun")
    if ar:
        print(f"  Active Run: {json.dumps(ar, indent=2)}")
else:
    print("No coder2 task found.")
    print("\nAll in_progress/assigned:")
    for i in issues:
        if i.get("status") in ("assigned","in_progress"):
            rid = i.get("executionRunId","?")
            print(f"  {i.get('identifier','?'):12s} {i['title'][:70]:70s} agent={i.get('executionAgentNameKey','?'):10s} run={rid[:8] if rid else 'none'}...")
