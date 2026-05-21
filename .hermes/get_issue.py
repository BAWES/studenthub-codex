#!/usr/bin/env python3
"""Get full coder2 issue details."""
import json, os, subprocess

# Get API key from env explicitly
api_key = os.environ.get("PAPERCLIP_API_KEY")
if not api_key:
    print("NO API KEY FOUND")
    exit(1)

auth_header_val = "Bearer " + api_key

r = subprocess.run(
    ["curl", "-s",
     "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues?status=assigned,in_progress&limit=50",
     "-H", auth_header_val,
     "-H", "Content-Type: application/json"],
    capture_output=True, text=True, timeout=15
)
data = json.loads(r.stdout)
for issue in data:
    if issue.get("executionAgentNameKey") == "coder2":
        print("TITLE:", issue.get("title"))
        print("IDENTIFIER:", issue.get("identifier"))
        print("STATUS:", issue.get("status"))
        print("DESCRIPTION:")
        print(issue.get("description", ""))
        print("==RUN INFO==")
        print("executionRunId:", issue.get("executionRunId"))
        print("executionState:", issue.get("executionState"))
        print("activeRun:", json.dumps(issue.get("activeRun"), default=str))
        print("handoff:", json.dumps(issue.get("successfulRunHandoff"), default=str, indent=2))
