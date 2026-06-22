# Role Pages Audit — STU-674

## Summary

Audited all 5 role directories under `src/app/` — **admin, staff, candidate, company, inspector** — plus the shared component library (`src/modules/` and `src/components/ui/`). Total pages: **44** across 5 roles. All roles share the same `WorkspaceOS` / `WorkspaceShell` layout system from `src/modules/workspace/`.

---

## 1. Per-Role Page Inventory

### Admin — 11 files, 5 routes
| Route | Type | Auth |
|---|---|---|
| `/admin` | Dashboard | `admin.system` |
| `/admin/candidates` | List/Search | `candidate.search` |
| `/admin/candidates/[id]` | Detail (redirect→tab) | `candidate.search` |
| `/admin/companies` | List | `company.read.any` |
| `/admin/companies/[id]` | Detail | `company.read.any` |
| `/admin/requests` | List | `request.read.any` |
| `/admin/requests/[id]` | Detail | `request.read.any` |
| `/admin/transfers` | List | `finance.read` |
| `/admin/transfers/[id]` | Detail | `finance.read` |

**Patterns:** 1 dashboard, 4 lists, 4 details (1 is a redirect to tab). **No form pages.** All read-only; status changes handled via action bars embedded in detail pages.

---

### Staff — 9 files, 5 routes
| Route | Type | Auth |
|---|---|---|
| `/staff` | Dashboard | `request.read.assigned` |
| `/staff/requests` | List | `request.read.assigned` |
| `/staff/requests/[id]` | Detail | `request.read.assigned` |
| `/staff/candidates` | List/Search | `candidate.search` |
| `/staff/candidates/[id]` | Detail (redirect→tab) | `candidate.search` |
| `/staff/interviews` | List | `request.interview` |
| `/staff/interviews/[id]` | Detail | `request.interview` |

**Patterns:** 1 dashboard, 3 lists, 3 details (1 is a redirect to tab). **No form pages.** 3 distinct capabilities guard routes.

---

### Candidate — 10 files, 7 routes
| Route | Type | Auth |
|---|---|---|
| `/candidate` | Dashboard | `candidate.read.own` |
| `/candidate/edit` | Form | `candidate.read.own` |
| `/candidate/invitations` | List | `candidate.read.own` |
| `/candidate/invitations/[id]` | Detail | `candidate.read.own` |
| `/candidate/payments` | List | `candidate.read.own` |
| `/candidate/payments/[id]` | Detail | `candidate.read.own` |
| `/candidate/work-logs` | List | `time.read.own` |
| `/candidate/work-logs/[id]` | Detail | `time.read.own` |

**Patterns:** 1 dashboard, 1 form, 3 lists, 3 details. Only role with a dedicated form page (`/candidate/edit`).

---

### Company — 10 files, 8 routes
| Route | Type | Auth |
|---|---|---|
| `/company` | Dashboard | `company.read.linked` |
| `/company/companies` | List | `company.read.linked` |
| `/company/companies/[id]` | Detail | `company.read.linked` |
| `/company/contacts` | List (inline add/remove) | `company.read.linked` |
| `/company/requests` | List | `request.read.linked` |
| `/company/requests/create` | Form | `request.create` |
| `/company/requests/[id]` | Detail | `request.read.linked` |
| `/company/stores` | List (inline add/remove) | `company.read.linked` |

**Patterns:** 1 dashboard, 4 lists, 2 details, 1 form. Most complex role with full CRUD on requests and inline forms on contacts/stores.

---

### Inspector — 6 files, 3 routes
| Route | Type | Auth |
|---|---|---|
| `/inspector` | Dashboard | `id_review.read` |
| `/inspector/id-requests` | List | `id_review.read` |
| `/inspector/id-requests/[id]` | Detail + Form | `id_review.read` |

**Patterns:** 1 dashboard, 1 list, 1 detail with embedded approve/reject forms. Smallest role — only one sub-resource.

---

## 2. Page Pattern Distribution Across Roles

| Pattern | Admin | Staff | Candidate | Company | Inspector | Total |
|---|---|---|---|---|---|---|
| Dashboard | 1 | 1 | 1 | 1 | 1 | **5** |
| List | 4 | 3 | 3 | 4 | 1 | **15** |
| Detail | 4 | 3 | 3 | 2 | 1 | **13** |
| Form | 0 | 0 | 1 | 1 | 0 | **2** |

Every role has exactly **1 dashboard** page. Lists + details dominate. Forms are rare — only candidate edit and company request create.

---

## 3. Duplicated Markup Patterns

### 3.1 Layout System (already shared)
All 5 roles share the same layout infrastructure from `src/modules/workspace/`:
- **`WorkspaceOS`** — top-level layout compositor used in every `layout.tsx`
- **`WorkspaceShell`** — page-level wrapper (eyebrow, title, metrics bar, content area) used in every page
- **`WorkspaceShellSkeleton`** — loading skeleton used in every `loading.tsx`
- **`WorkspaceNavigation`** — desktop rail + mobile tab bar

This is **already well-shared**. Each role's `layout.tsx` is essentially identical:
```tsx
export default async function RoleLayout({ children }) {
  const session = await requireRoleCapability("role", "capability.read");
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
```

### 3.2 Detail Page Pattern — High duplication opportunity
Every detail page follows the same structure:
1. Auth check (`requireRoleCapability`)
2. Fetch detail data with `getXxxDetail(id)`
3. Render `WorkspaceShell` with `FactPanel` + optional side panels
4. Action bar / actions below the panel

This pattern is repeated ~13 times across roles. **Opportunity:** Create a `DetailPageShell` component that standardizes: auth guard → data fetch → FactPanel → actions slot → side panels.

### 3.3 List Page Pattern — High duplication opportunity
Every list page:
1. Auth check
2. Fetch rows via `getXxxRows()`
3. Render `WorkspaceShell` + `DataTable`

Repeated ~15 times. Well-standardized already via `DataTable`. Low duplication concern.

### 3.4 Redirect Details — Pattern to standardize
Both admin and staff have `/candidates/[id]` pages that immediately redirect to the search page with a tab open. This is a deliberate pattern (detail rendered in-context inside the search OS). Candidate and company use real detail pages. **Opportunity:** Standardize as either all redirect or all detail.

### 3.5 Auth Check Repetition
Every `layout.tsx` checks auth, AND every child `page.tsx` repeats the same check. Not harmful but redundant due to Next.js layout nesting. **Opportunity:** Remove per-page auth checks where the parent layout already checks the same capability.

---

## 4. Shared Component Usage Opportunities

### Already used well (no action needed)
| Component | Used by | Count |
|---|---|---|
| `WorkspaceOS` | All 5 layouts | 5 |
| `WorkspaceShell` | All 44 pages | ~44 |
| `DataTable` | All 15 list pages | 15 |
| `FactPanel` | All 13 detail pages | 13 |
| `WorkspaceShellSkeleton` | All 5 loading files | 5 |

### Underutilized — could be used more
| Component | Current Usage | Opportunity |
|---|---|---|
| `SlidePanel` | Used in some detail pages | Could standardize side-panel layout across all details |
| `FeatureGrid` | Used in admin dashboard | Could be used in staff/candidate dashboards |
| `NoticeToast` | Used in request/invitation pages | Could handle all URL-driven notices uniformly |
| `CompactList` | Used in some side panels | Could standardize all auxiliary lists |

### Missing — should be created
| Need | Rationale |
|---|---|
| **`DetailPageShell`** | Standardize the 13 detail pages: auth + fetch + FactPanel + actions + side panels |
| **`ListPageShell`** | Standardize the 15 list pages: auth + fetch + DataTable + quick actions |
| **`ActionBar`** | Generic action bar component for approve/reject/transition workflows (used in requests, transfers, ID requests, interviews) |
| **`LoadingBoundary`** | Standard Suspense boundary with skeleton for all pages (replaces 5 separate loading.tsx) |

---

## 5. Recommendations

### Immediate (this sprint)
1. **Create `src/modules/workspace/ListPageShell.tsx`** — wrapper for list pages combining WorkspaceShell + DataTable + action buttons
2. **Create `src/modules/workspace/DetailPageShell.tsx`** — wrapper for detail pages combining WorkspaceShell + FactPanel + side panel layout + action bar
3. **Create `src/modules/workspace/ActionBar.tsx`** — generic action bar for status transitions (approve/reject/complete/cancel)

### Follow-up (next sprint)
4. **Standardize redirect details** — decide if candidates/[id] should be real detail pages or keep the redirect-to-tab pattern
5. **Remove redundant per-page auth checks** where the parent layout already guards the same capability
6. **Add barrel exports** — create `src/modules/index.ts` for clean imports

### Deferred
7. **Dashboard standardization** — each role's dashboard is unique by nature; low ROI to abstract further
8. **Loading boundaries** — if loading.tsx duplication becomes an issue, create a shared Suspense boundary

---

## 6. Dependencies Check

| Dependency | Status | Notes |
|---|---|---|
| Phase 1 shared components (`src/modules/*`, `src/components/ui/*`) | ✅ Done | All present and used |
| Design tokens (STU-665) | ✅ Done | Integrated into shadcn components |
| Tailwind v4 theme | ✅ Done | Configured globally |
| STU-676 (Breadcrumbs + RoleLayoutShell) | ⏳ In progress | Needed before role layout creation |
| STU-678 (Candidate + Inspector layouts) | ✅ Done | Completed by another agent |

---

## 7. Architecture Recommendation

The current architecture is already good — all roles share the same composable layout system. The duplication is in the **page-level composition boilerplate**, not in the underlying components. The recommended approach:

```
Before:
  page.tsx → requireRoleCapability() → getData() → <WorkspaceShell><DataTable .../></WorkspaceShell>

After:
  page.tsx → <ListPageShell capability="x" query={getData} columns={columns} />
```

This eliminates ~15 lines of boilerplate per page while keeping the composability. The role-specific layouts (`WorkspaceOS` + role nav) are already shared via the parent `layout.tsx` — no new role layout wrappers needed beyond what STU-677 and STU-678 create.
