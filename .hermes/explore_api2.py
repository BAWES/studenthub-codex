#!/usr/bin/env python3
"""Explore Paperclip API for issues."""
import json, os, subprocess

company = "f56ea475-d349-431c-9a40-3111f1a49819"
run_id = os.environ.get("PAPERCLIP_RUN_ID", "")

# Construct curl command using environment variable for auth
def curl(path, method="GET"):
    cmd = "curl -s -X " + method + " http://127.0.0.1:3100/api/companies/" + company + path
    cmd += " -H \"Authorization: Bearer $PAPER...EY\""
    cmd += " -H \"Content-Type: application/json\""
    if run_id and method in ("POST", "PATCH", "PUT", "DELETE"):
        cmd += " -H \"X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID\""
    r = subprocess.run("bash -c " + cmd, capture_output=True, text=True, timeout=15, shell=True)
    try:
        return json.loads(r.stdout)
    except:
        return {"raw": r.stdout, "stderr": r.stderr}

# Try different API patterns
print("=== Issues list (last 5) ===")
issues = curl("/issues?limit=5")
for i, iss in enumerate(issues if isinstance(issues, list) else []):
    print(f"[{i}] {iss.get('identifier','?')} - {iss['title'][:50]} | status={iss.get('status')}")

# Try completing the run
print("\n=== Complete run ===")
complete_result = curl("/runs/c539ac43-1371-4975-8ca3-f6855bd91207/complete", "POST")
print(json.dumps(complete_result, indent=2, default=str)[:500])

# Try completing the issue
print("\n=== Complete issue ===")
issue_result = curl("/issues/e1e653a2-73b1-4bdb-8534-e60dd169b373/done", "POST")
print(json.dumps(issue_result, indent=2, default=str)[:500])
