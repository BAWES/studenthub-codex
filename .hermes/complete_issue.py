#!/usr/bin/env python3
"""Mark STU-4867 as done on Paperclip."""
import json, os, subprocess

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
run_id = os.environ.get("PAPERCLIP_RUN_ID", "")
company = "f56ea475-d349-431c-9a40-3111f1a49819"
issue_id = "e1e653a2-73b1-4bdb-8534-e60dd169b373"

def paperclip(path, method="GET", data=None):
    cmd = ["curl", "-s", "-X", method,
           f"http://127.0.0.1:3100/api/companies/{company}/{path}",
           "-H", "Authorization: Bearer " + api_key,
           "-H", "Content-Type: application/json"]
    if run_id and method in ("POST", "PATCH", "PUT"):
        cmd.extend(["-H", "X-Paperclip-Run-Id: " + run_id])
    if data:
        cmd.extend(["-d", json.dumps(data)])
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    try:
        return json.loads(r.stdout)
    except:
        return {"raw": r.stdout, "stderr": r.stderr}

# First, get current issue state
print("=== Current issue state ===")
issue = paperclip(f"issues/{issue_id}")
print(f"Status: {issue.get('status')}")
print(f"Title: {issue.get('title')}")
print(f"Active run: {issue.get('activeRun')}")

# Mark issue as done
print("\n=== Marking issue as done ===")
result = paperclip(f"issues/{issue_id}/done", method="POST")
print(json.dumps(result, indent=2, default=str))
