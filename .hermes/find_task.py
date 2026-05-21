#!/usr/bin/env python3
"""Find coder2 issue in Paperclip."""
import json, os, subprocess

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
r = subprocess.run(
    ["curl", "-s",
     "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues?limit=100",
     "-H", f"Authorization: Bearer {api_key}",
     "-H", "Content-Type: application/json"],
    capture_output=True, text=True, timeout=15
)
data = json.loads(r.stdout)
for issue in data:
    nk = issue.get("executionAgentNameKey")
    if nk and nk == "coder2":
        print(f"CODER2: {issue['identifier']} - {issue['title']}")
        print(f"  status={issue['status']} runId={issue.get('executionRunId')} state={issue.get('executionState')}")
        print(f"  startedAt={issue.get('startedAt')}")
        print(f"  description={issue.get('description','')[:500]}")
        handoff = issue.get("successfulRunHandoff")
        if handoff:
            print(f"  handoff: src={handoff.get('sourceRunId')} corrective={handoff.get('correctiveRunId')}")
            print(f"  progress={handoff.get('detectedProgressSummary')[:200]}")
        ar = issue.get("activeRun")
        if ar:
            print(f"  activeRun status={ar.get('status')} startedAt={ar.get('startedAt')}")
