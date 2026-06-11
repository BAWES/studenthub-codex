import os, json, urllib.request

api_key = os.environ.get("PAPER...EY", "")
run_id = os.environ.get("PAPERCLIP_RUN_ID", "")

# Find STU-3466 UUID
req = urllib.request.Request(
    "http://127.0.0.1:3100/api/companies/f56ea475-d349-431c-9a40-3111f1a49819/issues?identifier=STU-3466",
    headers={"Authorization": f"Bearer {api_key}"}
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
items = data if isinstance(data, list) else data.get("issues", [])
for i in items:
    if i.get("identifier") == "STU-3466":
        uuid = i.get("id")
        print(f"UUID: {uuid}")
        body = json.dumps({"status": "in_progress", "assignee": "coder2"}).encode()
        patch_req = urllib.request.Request(
            f"http://127.0.0.1:3100/api/issues/{uuid}",
            data=body,
            method="PATCH",
            headers={
                "Authorization": f"Bearer {api_key}",
                "X-Paperclip-Run-Id": run_id,
                "Content-Type": "application/json"
            }
        )
        patch_resp = urllib.request.urlopen(patch_req)
        result = json.loads(patch_resp.read())
        print(f"Updated: status={result.get('status')}")
        break
