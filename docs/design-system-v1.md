# StudentHub Unified Design System — Version 1.0

> Design token spec and shared component blueprints for the consolidated /app/* experience.
> Author: UXDesigner (Jun 9, 2026)
> Tracking: STU-866

---

## 1. Design Tokens

### 1.1 Color Palette

The existing CSS variable system in styles.css is solid. Formalize as:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --ink | #182230 | #e7ecf5 | Body text, headings |
| --muted | #667085 | #9da8ba | Secondary text |
| --faint | #8a95a6 | #78859b | Placeholder, disabled |
| --line | #d6dce7 | #2a3547 | Borders, dividers |
| --paper | #f5f7fa | #090d14 | Page background |
| --surface | #ffffff | #111824 | Cards, panels |
| --blue | #0b63ce | #8abfff | Primary actions, links |
| --green | #24835b | #6ed5a0 | Success, approved |
| --amber | #a66212 | #e8ae63 | Warning, pending |
| --rose | #b42357 | #ff8aac | Error, urgent |

### 1.2 Typography Scale

| Token | Size | Weight | Line Ht | Usage |
|-------|------|--------|---------|-------|
| --text-xs | 0.75rem | 500 | 1.25 | Badges, captions |
| --text-sm | 0.8125rem | 500 | 1.4 | Labels, metadata |
| --text-base | 0.9375rem | 500 | 1.5 | Body, table cells |
| --text-lg | 1.0625rem | 600 | 1.4 | Card titles |
| --text-xl | 1.25rem | 700 | 1.3 | Page titles |
| --text-2xl | 1.5rem | 700 | 1.25 | Hero headings |

Font: Inter/system-ui stack (already correct)

### 1.3 Spacing & Radii

4px base. --radius: 8px (default). Add --radius-sm: 4px, --radius-lg: 12px, --radius-full: 9999px.

### 1.4 Shadows

Add levels: --shadow-sm (cards hover), --shadow-md (dropdowns), --shadow-lg (modals).

---

## 2. Component Blueprints

### 2.1 StatusBadge (NEW)

Current: inline spans on company page. Replace with shared component:
- Variants: pill, dot, default
- Semantic color mapping: pending > amber, started > blue, delivered > green, cancelled > rose, finished_by_recruitment > purple

### 2.2 ActionButton (NEW)

Current: inline styled anchor on company requests page. Replace with:
- Variants: primary, secondary, ghost, danger
- Props: icon, size, loading, disabled
- Unifies +New Request, Search, Sign out buttons

### 2.3 DataTable (UPGRADE)

Currently shared across all 5 roles. Add states:
- Loading: skeleton rows
- Empty: configurable illustration + message + CTA
- Error: error message + retry button
- Pagination: optional page controls

### 2.4 CandidateCard (CONSOLIDATE)

Currently inline in CandidateSearchOS. Make shared:
- Role-scoped via `role` prop: admin sees sensitive data, company sees public only
- States: loading skeleton, empty, selected

### 2.5 SearchInterface (POLISH)

Already good. Add: loading state, empty results, keyboard nav polish.

### 2.6 DetailPage (STANDARDIZE)

Already has FactPanel + skeleton + error state. Standardize action bar across roles.

### 2.7 Breadcrumbs (ADOPT WIDER)

Currently only in RoleLayoutShell. Add to every sub-page.

---

## 3. UX Flow Maps

### Admin
Sign in > Dashboard (46K approvals, 2.5K requests) > Approve candidates > Manage requests > Process transfers > Manage companies

### Staff
Sign in > Dashboard > Get request > Match candidates > Send shortlist > Schedule interviews

### Candidate
Sign in > Profile overview > Complete profile > Receive invitations > Track work logs > View payments

### Company
Sign in > Linked companies > Submit request > Review candidates > Approve work logs > View invoices

### Inspector
Sign in > ID request queue > Review batch > Resolve documents

---

## 4. Consolidation Plan

### Phase 1 (this sprint)
- [x] Component audit complete
- [x] Design tokens defined
- [ ] Create shared StatusBadge
- [ ] Create shared ActionButton
- [ ] Upgrade DataTable with states

### Phase 2
- [ ] Consolidate CandidateCard
- [ ] Standardize DetailPage
- [ ] Adopt Breadcrumbs everywhere
