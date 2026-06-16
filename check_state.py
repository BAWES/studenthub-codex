#!/usr/bin/env python3
"""Check Coder2's current state: branch, tasks, etc."""
import os, json, subprocess, urllib.request

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
company_id = "f56ea475-d349-431c-9a40-3111f1a49819"
base = "http://127.0.0.1:3100/api"

# 1. Current branch
result = subprocess.run(
    ["git", "branch", "--show-current"],
    capture_output=True, text=True, cwd="/Users/BAWES/Sites/studenthub/studenthub-next-coder2"
)
print(f"=== CURRENT BRANCH ===")
print(f"  Branch: {result.stdout.strip()}")
print(f"  Status: " + subprocess.run(
    ["git", "status", "--short"],
    capture_output=True, text=True, cwd="/Users/BAWES/Sites/studenthub/studenthub-next-coder2"
).stdout.strip() or "clean")

# 2. Get agents to find Coder2's ID
req = urllib.request.Request(f"{base}/companies/{company_id}/agents")
req.add_header("Authorization", f"Bearer {api_key}")
resp = urllib.request.urlopen(req)
agents = json.loads(resp.read())

coder2_agent = None
for a in agents:
    if a.get("name") == "Coder2":
        coder2_agent = a
        break

if coder2_agent:
    print(f"\n=== CODER2 AGENT ===")
    print(f"  ID: {coder2_agent['id']}")
    print(f"  Status: {coder2_agent.get('status')}")
    print(f"  HB enabled: {coder2_agent.get('runtimeConfig',{}).get('heartbeat',{}).get('enabled','?')}")
    print(f"  Model: {coder2_agent.get('adapterConfig',{}).get('model','?')}")
    coder2_id = coder2_agent['id']
else:
    coder2_id = None
    print("\n=== CODER2 AGENT ===")
    print("  Not found in agents list")
    for a in agents:
        print(f"  - {a.get('name','?')} (id={a.get('id','?')[:8]}...)")

# 3. Get issues assigned to Coder2
if coder2_id:
    req2 = urllib.request.Request(f"{base}/companies/{company_id}/issues?limit=50")
    req2.add_header("Authorization", f"Bearer {api_key}")
    resp2 = urllib.request.urlopen(req2)
    issues = json.loads(resp2.read())
    
    assigned = [i for i in issues if i.get("assigneeAgentId") == coder2_id]
    active = [i for i in assigned if i.get("status") in ("todo", "in_progress", "queued")]
    
    print(f"\n=== ISSUES ASSIGNED TO CODER2 ===")
    print(f"  Total assigned: {len(assigned)}")
    print(f"  Active (todo/in_progress): {len(active)}")
    
    for i in active:
        print(f"\n  --- #{i.get('issueNumber','?')} ({i.get('identifier','?')}) ---")
        print(f"  Title: {i.get('title','?')}")
        print(f"  Status: {i.get('status')}")
        print(f"  Priority: {i.get('priority')}")
        print(f"  Desc (first 300): {i.get('description','')[:300]}")
    
    # Recently done
    done = [i for i in assigned if i.get("status") == "done"]
    for i in done[:3]:
        print(f"\n  [DONE] #{i.get('issueNumber','?')}: {i.get('title','?')[:70]}")
else:
    print("\n=== NO AGENT ID ===")
