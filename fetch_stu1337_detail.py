#!/usr/bin/env python3
import subprocess, json, urllib.request, urllib.error

r = subprocess.run(['bash', '-l', '-c', 'echo "$PAPERCLIP_API_KEY"'], capture_output=True, text=True)
apikey = r.stdout.strip()
r2 = subprocess.run(['bash', '-l', '-c', 'echo "$PAPERCLIP_RUN_ID"'], capture_output=True, text=True)
runid = r2.stdout.strip()
cid = "f56ea475-d349-431c-9a40-3111f1a49819"

def get(path, headers=None):
    hdrs = {"Authorization": f"Bearer {apikey}"}
    if headers:
        hdrs.update(headers)
    url = f"http://127.0.0.1:3100{path}"
    req = urllib.request.Request(url, headers=hdrs)
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as ex:
        return {"error": str(ex), "body": ex.read().decode()}

myid = "6304a6b2-28a5-41c7-a6c0-d6038e676d7c"
result = get(f"/api/companies/{cid}/issues?assigneeAgentId={myid}&limit=20")
if isinstance(result, list):
    for i in result:
        if i.get('identifier') in ['STU-1337', 'STU-1231']:
            print(f"\n{'='*60}")
            print(f"{i.get('identifier')}: {i['title']}")
            print(f"  ID: {i['id']}")
            print(f"  Status: {i['status']} | Priority: {i.get('priority','')}")
            print(f"  Description:\n{i.get('description','N/A')[:1000]}")
            print(f"  Labels: {i.get('labels', [])}")
            print(f"  Created: {i.get('createdAt','')[:19]}")
            if i.get('startedAt'):
                print(f"  Started: {i['startedAt'][:19]}")
            if i.get('completedAt'):
                print(f"  Completed: {i['completedAt'][:19]}")

            # Comments
            comments = get(f"/api/companies/{cid}/issues/{i['id']}/comments?limit=20")
            if isinstance(comments, list) and comments:
                print(f"\n  --- Comments ({len(comments)}) ---")
                for c in comments:
                    body = c.get('body', '')[:500]
                    ts = c.get('createdAt', '')[:19]
                    print(f"  [{ts}] {c.get('authorName','?')}: {body}")
