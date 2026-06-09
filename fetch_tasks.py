#!/usr/bin/env python3
import subprocess, json, urllib.request, urllib.error

# Get API key
rk = subprocess.run(['bash', '-l', '-c', 'echo "$PAPERCLIP_API_KEY"'],
                    capture_output=True, text=True)
API_KEY = rk.stdout.strip()

# Get run ID
rr = subprocess.run(['bash', '-l', '-c', 'echo "$PAPERCLIP_RUN_ID"'],
                    capture_output=True, text=True)
RUN_ID = rr.stdout.strip()

CID = "f56ea475-d349-431c-9a40-3111f1a49819"

def api_get(path):
    url = f"http://127.0.0.1:3100{path}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {API_KEY}"})
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": str(e), "body": e.read().decode()}

issues = api_get(f"/api/companies/{CID}/issues?limit=100")
print(f"Got {len(issues) if isinstance(issues, list) else 'ERROR'} issues")

if isinstance(issues, list):
    for issue in issues:
        ident = issue.get('identifier', '')
        if ident in ['STU-1337', 'STU-1231']:
            print(f"\n{'='*60}")
            print(f"{ident}: {issue['title']}")
            print(f"  ID: {issue['id']}")
            print(f"  Status: {issue['status']}")
            print(f"  Priority: {issue.get('priority', 'normal')}")
            print(f"  Assignee: {issue.get('assigneeAgentId', 'unassigned')}")
            desc = issue.get('description', 'N/A')[:800]
            print(f"  Description: {desc}")

            comments = api_get(f"/api/companies/{CID}/issues/{issue['id']}/comments?limit=10")
            if isinstance(comments, list) and comments:
                print(f"\n  --- Comments ({len(comments)}) ---")
                for c in comments[-5:]:
                    body = c.get('body', '')[:400]
                    ts = c.get('createdAt', '')[:19]
                    author = c.get('authorName', c.get('authorType', 'unknown'))
                    print(f"  [{ts}] {author}: {body}")
