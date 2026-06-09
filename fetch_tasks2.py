#!/usr/bin/env python3
import subprocess, json, urllib.request, urllib.error

r = subprocess.run(['bash', '-l', '-c', 'echo "$PAPERCLIP_API_KEY"'], capture_output=True, text=True)
apikey = r.stdout.strip()
r2 = subprocess.run(['bash', '-l', '-c', 'echo "$PAPERCLIP_RUN_ID"'], capture_output=True, text=True)
runid = r2.stdout.strip()
cid = "f56ea475-d349-431c-9a40-3111f1a49819"

def get(path):
    url = f"http://127.0.0.1:3100{path}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {apikey}"})
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as ex:
        return {"error": str(ex), "body": ex.read().decode()}

for ident in ['STU-1337', 'STU-1231']:
    result = get(f"/api/companies/{cid}/issues?identifier={ident}")
    if isinstance(result, list) and result:
        i = result[0]
        print(f"{ident}: {i['title']}")
        print(f"  ID: {i['id']} | Status: {i['status']} | Priority: {i.get('priority','')}")
        desc = i.get('description','')[:500]
        if desc:
            print(f"  Description: {desc}")
    else:
        print(f"{ident}: Not found")

# Also check by the assigneeAgentId
print("\n--- Checking by assigneeAgentId ---")
myid = "6304a6b2-28a5-41c7-a6c0-d6038e676d7c"
result = get(f"/api/companies/{cid}/issues?assigneeAgentId={myid}&limit=20")
if isinstance(result, list):
    print(f"Found {len(result)} issues assigned to me:")
    for i in result:
        print(f"  [{i.get('identifier','?')}] {i['title'][:60]} — {i['status']} — {i.get('priority','')}")
