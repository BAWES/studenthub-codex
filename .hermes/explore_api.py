#!/usr/bin/env python3
"""Explore Paperclip API for issues."""
import json, os, subprocess

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
run_id = os.environ.get("PAPERCLIP_RUN_ID", "")
company = "f56ea475-d349-431c-9a40-3111f1a49819"

auth_header = "Authorization: Bearer *** + api_key

def curl(path, method="GET"):
    cmd = ["curl", "-s", "-X", method,
           "http://127.0.0.1:3100/api/companies/" + company + path,
           "-H", auth_header,
           "-H", "Content-Type: application/json"]
    if run_id and method in ("POST", "PATCH", "PUT", "DELETE"):
        cmd.extend(["-H", "X-Paperclip-Run-Id: " + run_id])
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    try:
        return json.loads(r.stdout)
    except:
        return {"raw": r.stdout}

# Try different API patterns
print("=== Issues list (last 5) ===")
issues = curl("/issues?limit=5")
for i, iss in enumerate(issues if isinstance(issues, list) else []):
    print(f"[{i}] {iss.get('identifier','?')} - {iss['title'][:50]} | status={iss.get('status')}")

# Try the run endpoint
print("\n=== Run info ===")
run_result = curl("/runs/c539ac43-1371-4975-8ca3-f6855bd91207")
print(json.dumps(run_result, indent=2, default=str)[:500])

# Try completing the run
print("\n=== Complete run ===")
complete_result = curl("/runs/c539ac43-1371-4975-8ca3-f6855bd91207/complete", "POST")
print(json.dumps(complete_result, indent=2, default=str)[:500])
