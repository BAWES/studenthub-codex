#!/usr/bin/env python3
"""Query Paperclip issues and complete the coder2 task."""
import json, os, subprocess

company = "f56ea475-d349-431c-9a40-3111f1a49819"
run_id = os.environ.get("PAPERCLIP_RUN_ID", "")

# Use subprocess.Popen with env to pass the token
env = os.environ.copy()

def curl_get(path):
    proc = subprocess.Popen(
        ["curl", "-s", "http://127.0.0.1:3100/api/companies/" + company + path,
         "-H", "Authorization: Bearer *** + "$PAPER...EY",
         "-H", "Content-Type: application/json"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, shell=False
    )
    # No - the token is in a string literal in the list, not expanded
    # Let's use shell
    pass

# Simpler approach: just use env vars in shell
def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15, shell=True, env=env)
    return r.stdout, r.stderr

out, err = sh("""
curl -s "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues?status=assigned,in_progress&limit=50" \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" | python3 -c '
import json,sys
data=json.load(sys.stdin)
for i in data:
    nk = i.get("executionAgentNameKey")
    if nk and nk == "coder2":
        print("FOUND_CODER2|" + i.get("identifier","?") + "|" + i["title"] + "|" + i["status"] + "|" + str(i.get("executionRunId","")))
'
""")
print("Issues scan:", out, err if err else "")

# Now complete the run
out2, err2 = sh("""
curl -s -X POST "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/runs/c539ac43-1371-4975-8ca3-f6855bd91207/complete" \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: *** "$PAPERCLIP_RUN_ID" \
  -d '{"status":"completed"}'
""")
print("Run complete:", out2, err2 if err2 else "")
