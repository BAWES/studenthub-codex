#!/usr/bin/env python3
import os, json, urllib.request

api_key = os.environ.get("PAPERCLIP_API_KEY", "")
company_id = "f56ea475-d349-431c-9a40-3111f1a49819"
base = "http://127.0.0.1:3100/api"

req = urllib.request.Request(f"{base}/issues?limit=50")
req.add_header("Authorization", f"Bearer {api_key}")
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

if isinstance(data, dict):
    items = data.get("data", data.get("issues", data.get("results", [])))
    print(f"Response keys: {list(data.keys())}")
    print(f"Response: {json.dumps(data, indent=2)[:2000]}")
elif isinstance(data, list):
    items = data
    print(f"Total issues: {len(items)}")
    for i in items:
        assignee = i.get("assigneeId", "none")
        status = i.get("status", "none")
        print(f"  #{i['number']}: {i['title'][:70]} | assignee={assignee} | status={status}")
else:
    print(f"Unexpected type: {type(data)}")
    print(json.dumps(data, indent=2)[:2000])
