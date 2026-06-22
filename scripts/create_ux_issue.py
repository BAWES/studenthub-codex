#!/usr/bin/env python3
"""Create a design spec issue for Dashboard shadcn polish."""
import os, json, urllib.request

BASE = os.environ.get("PAPERCLIP_API_BASE", "http://localhost:3100")
KEY = os.environ.get("PAPERCLIP_API_KEY", "")
RUN_ID = os.environ.get("PAPERCLIP_RUN_ID", "hermes-ux-heartbeat")
COMPANY_ID = "f56ea475-d349-431c-9a40-3111f1a49819"
UX_AGENT_ID = "91f9baa3-5a58-4543-bd50-f5b64275d520"

if not KEY:
    print("ERROR: PAPERCLIP_API_KEY not set")
    exit(1)

def api_post(path, data, write=True):
    headers = {
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
    }
    if write:
        headers["X-Paperclip-Run-Id"] = RUN_ID
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def api_patch(path, data):
    headers = {
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
        "X-Paperclip-Run-Id": RUN_ID,
    }
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers=headers, method="PATCH")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

description = r"""## shadcn polish: Admin Dashboard (Dashboard.tsx)

### 1. Design Rationale

The current `Dashboard.tsx` component (used on `/admin`) uses entirely custom CSS classes (`.metrics`, `.metric`, `.workspace`, `.focus`, `.rail`, `.statusMix`, `.statusRow`, `.dataList`, `.row`, `.listHeader`) that bypass the established shadcn design system. These classes carry hardcoded layout and color values in `styles.css` rather than leveraging shadcn primitives (Card, CardContent, CardHeader, Badge, Button) and Tailwind utility classes. This creates visual inconsistency with the rest of the app — the Quick Action cards, DataTable, and WorkspaceShell all use proper shadcn patterns.

### 2. Layout Architecture

```
CURRENT                          TARGET
┌──────────────────────┐         ┌──────────────────────┐
│  .metrics (grid)     │         │  Card metrics grid   │
│  ┌────┐ ┌────┐ ┌───┐│         │  ┌──────┐ ┌──────┐  │
│  │val │ │val │ │val││         │  │Card  │ │Card  │  │
│  └────┘ └────┘ └───┘│         │  │metric│ │metric│  │
│                      │         │  └──────┘ └──────┘  │
│  .workspace (2-col)  │         │                      │
│  ┌────────┐ ┌─────┐  │         │  Card (section)      │
│  │.focus  │ │.rail│  │         │  ┌─────────┐ ┌────┐ │
│  │        │ │     │  │         │  │hero     │ │side│ │
│  └────────┘ └─────┘  │         │  └─────────┘ └────┘ │
│                      │         │                      │
│  .lists (4-col grid) │         │  Card grid           │
│  ┌────┐ ┌────┐      │         │  ┌──────┐ ┌──────┐  │
│  │list │ │list│      │         │  │Card  │ │Card  │  │
│  └────┘ └────┘      │         │  │data  │ │data  │  │
└──────────────────────┘         └──────────────────────┘
```

### 3. Component Breakdown

#### A. Metrics Section -> shadcn Card grid
- Replace `<section className="metrics">` with `<section className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">`
- Replace `<article className="metric">` with `<Card><CardContent className="p-4">`
- Label: `<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">`
- Value: `<strong className="block text-[38px] leading-[1] my-3 font-bold">`
- Note: `<p className="text-muted-foreground/70 text-sm mb-0">`
- Empty: grid with single "No metrics available" Card

#### B. Workspace Section -> shadcn Card (2-col grid)
- Replace `<section className="workspace">` with `<section className="grid grid-cols-[1fr_340px] gap-3">`
- Focus card: `<Card>` with eyebrow, h2, description, and statusMix grid inside CardContent
- StatusMix rows: `<div className="flex items-center justify-between border-b border-border py-2">`
- Rail card: `<Card>` with `<CardContent>` containing h2 + ordered list
- Empty statusMix: "No status data" fallback

#### C. Data Lists -> shadcn Card
- Replace `<section className="dataList">` with `<Card>`
- Header: `<div className="flex items-center justify-between border-b border-border px-4 py-3">` with h2 + count badge
- Rows: `<div className="grid">` + `<article className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-b border-border">`
- Row title in: `<div className="grid gap-1"><strong>{title}</strong><span className="text-sm text-muted-foreground">{subtitle}</span></div>`
- Row meta: `<div className="flex items-center"><span className="text-sm text-muted-foreground">{meta}</span></div>`
- Empty: "No records found" message grid (matching DataTable empty state style)

#### D. Empty & Loading States
- **Metrics empty**: Single Card with centered "No metrics available" message (matching WorkspaceShell empty pattern)
- **Workspace empty**: Card with "No workspace data" message
- **DataList empty**: Card with "No records found" message (matching DataTable empty state at src/modules/workspace/DataTable.tsx line 67-76)
- **Loading**: Skeleton shimmer cards matching the card layout (4 metric skeletons, 2 workspace skeletons, 4 data list skeletons)

### 4. Zendesk Coral + Slack Aesthetic
- Primary accent: #1f73b7 (Zendesk blue) for badges, counts, links
- Secondary accent: #eb6651 (Zendesk coral) for CTAs and highlights
- Cards: white bg (#ffffff), border (#e8e6e3), shadow (0 1px 3px rgba(0,0,0,0.06))
- Typography: --sh-text-primary (#1d1c1a), --sh-text-secondary (#6e6b66), --sh-text-muted (#a09d98)
- NO glass morphism, NO backdrop-blur, NO frosted glass
- Clean white cards with subtle borders (matching existing WorkspaceShell card pattern)

### 5. File Structure
```
MODIFY:
  src/modules/dashboard/Dashboard.tsx     -- rewrite all className references using shadcn components + Tailwind
  src/app/styles.css                       -- DELETE .metric, .metrics, .workspace, .focus, .rail, .statusMix, .statusRow CSS classes

UNCHANGED:
  src/modules/dashboard/data.ts           -- data shape unchanged
  src/app/admin/page.tsx                  -- embedding unchanged
```

### 6. Data Contracts
```typescript
// Dashboard metric (unchanged)
type DashboardMetric = {
  label: string;
  value: string | number;
  note: string;
};

// Status mix (unchanged)
type StatusMixItem = {
  label: string;
  value: string | number;
};

// Data list item (unchanged from DataListItem)
type DataListItem = {
  id: number | string;
  title: string;
  subtitle: string;
  meta: string;
  amount?: string;
  date?: string;
  count?: number;
};
```

### 7. Acceptance Criteria
- [ ] All custom CSS classes replaced with shadcn Card + Tailwind utility classes
- [ ] Metrics grid uses shadcn Card matching WorkspaceShell metric cards
- [ ] Workspace section uses Card-based 2-col grid with consistent styling
- [ ] Data lists use Card with consistent header + row pattern matching DataTable
- [ ] Empty states display helpful messages (no broken layout)
- [ ] Removed CSS classes deleted from styles.css
- [ ] tsc --noEmit passes with zero errors
- [ ] Visual consistency at desktop (1200px+) and tablet (768px)
- [ ] Dark mode follows existing theme variables
- [ ] All colors use tailwind semantic classes -- no inline CSS vars
"""

issue_data = {
    "title": "shadcn polish: Admin Dashboard (Dashboard.tsx)",
    "description": description,
    "priority": "medium",
    "issueType": "design",
}

print("=== Creating issue ===")
try:
    issue = api_post(f"/api/companies/{COMPANY_ID}/issues", issue_data)
    issue_id = issue.get("id", issue.get("uuid", ""))
    print(f"Created issue: {issue.get('title', '?')} (id={issue_id})")

    if issue_id:
        print("\n=== Assigning issue to UXDesigner ===")
        result = api_patch(f"/api/issues/{issue_id}", {
            "assigneeAgentId": UX_AGENT_ID,
            "status": "todo"
        })
        print(f"Assigned: {json.dumps(result, indent=2)[:200]}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Body: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
