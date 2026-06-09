# StudentHub Unified Component Blueprints

## Principle: ONE component per UI pattern, role-scoped via props

Every component exists once. Role-specific behavior is controlled through props, not through separate implementations.

---

## 1. DataTable — Unified List Component

### Current State
Duplicated with inconsistent column counts across 5 roles. Company requests uses inline styles for status badges.

### Blueprint

```tsx
interface DataTableProps<T> {
  title: string
  description?: string
  columns: TableColumn<T>[]
  rows: T[]
  rowHref?: (row: T) => string
  loading?: boolean
  error?: Error | string | null
  emptyMessage?: string
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  actions?: React.ReactNode
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}
```

### States
| State | Visual |
|-------|--------|
| Loading | `DataTableSkeleton` with matching column count |
| Empty (no search) | Centered illustration + "No records yet" + suggested action |
| Empty (with search) | "No results for \"query\" — try different keywords" |
| Error | Error banner + "Try again" button |
| Success | Table with rows + optional row actions |

### Status Badge Rule
```tsx
// ONE status badge component, used everywhere
<StatusBadge status={row.status} />
// status prop accepts: pending | approved | rejected | started | completed | cancelled
// Renders CSS class, NOT inline styles
```

---

## 2. CandidateCard / CandidateSearchOS — Unified Candidate Component

### Current State
Duplicated in admin/candidates and staff/candidates with different params.

### Blueprint

```tsx
interface CandidateSearchProps {
  role: 'admin' | 'staff'
  // Staff sees: visibility, staffId params
  // Admin sees: all 11 params (q, filter, tabs, selected, country, university, etc.)
}

// Single CandidateCard component with role-scoped visibility:
interface CandidateCardProps {
  candidate: Candidate
  role: 'admin' | 'staff' | 'candidate'
  showSensitiveData?: boolean   // admin only — shows phone, email, ID
  showActions?: boolean         // staff + admin
  showStatus?: boolean          // everyone
  compact?: boolean             // candidate view (mobile)
}
```

### States
Loading → Skeleton card variant
Empty → "No matching candidates found"
Error → Retry card
Default → Full candidate info per role scope

---

## 3. ActionBar — Unified Action Button Row

### Current State
Admin uses `RequestActionBar` + `TransferActionBar` (shared). Staff request detail is missing `currentStaffId`. Staff interview uses manual form buttons.

### Blueprint

```tsx
interface ActionBarProps {
  actions: Action[]
  role: string
  context: 'request' | 'transfer' | 'invitation' | 'id-request'
  status: string
}
```

**Composable action items:**
```tsx
interface Action {
  label: string
  variant: 'default' | 'secondary' | 'destructive'
  handler: () => Promise<void>
  requireConfirmation?: boolean
  disabled?: boolean
  roles?: string[]  // which roles can see this action
}
```

This replaces:
- `RequestActionBar` → generic `ActionBar` with request action config
- `TransferActionBar` → generic `ActionBar` with transfer action config
- Manual interview forms → `ActionBar` with interview action config

---

## 4. DetailSection — Unified Detail Panel

### Current State (STU-1032 DONE)
Consolidated from two separate components (FactPanel + CompactList) into one unified `<DetailSection>` with loading/error/empty states and sensitive data support.

### Blueprint

```tsx
import { DetailSection } from "@/modules/workspace/DetailPanels";

// Fact type (default) — label/value grid
<DetailSection
  title="Account"
  facts={[
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone, sensitive: true },  // hidden behind toggle
  ]}
  sensitive                          // enables "Show sensitive" toggle
/>

// List type — compact row list
<DetailSection
  type="list"
  title="Stores"
  rows={stores}
  emptyMessage="No stores added yet."
/>

// Loading skeleton
<DetailSection title="Section" loading />

// Error with retry
<DetailSection
  title="Section"
  error={fetchError}
  onRetry={refetch}
/>

// Conditionally hidden
<DetailSection title="Secret" hidden={!isAdmin} />
```

### States
| State | Visual |
|-------|--------|
| Loading | `Skeleton` shimmer per type (fact grid or list rows), `aria-busy="true"` |
| Empty (fact) | "No data for this section." or custom `emptyMessage` |
| Empty (list) | "No imported records found here yet." or custom `emptyMessage` |
| Error | Error message (string or Error object) + optional "Try again" button |
| Sensitive | Values show `•••••` until toggle clicked |
| Hidden | Returns `null` — completely removed from DOM |

### TypeScript Interface

```tsx
interface DetailSectionProps {
  type?: 'fact' | 'list'
  title: string
  facts?: DetailSectionFact[]
  rows?: DetailSectionRow[]
  loading?: boolean
  error?: Error | string | null
  emptyMessage?: string
  onRetry?: () => void
  roles?: string[]
  sensitive?: boolean
  hidden?: boolean
}
```

---

## ~~4. FactPanel — Unified Detail Panel~~
*Replaced by DetailSection above (STU-1032). FactPanel/CompactList remain as deprecated wrappers for backward compatibility.*

---

## 5. Empty States — Standardize Messages

### Current State
3 different messages for essentially the same thing.

### Standard Messages
```tsx
// No data at all (fresh account)
"No records yet — this section will populate as data is imported."

// No results matching filter/search
"No results for \"{query}\" — try adjusting your search or filters."

// Specific section with no linked records
"No {itemType} found for this {parentType}."

// Create CTA variant
"No {itemType} yet — {createAction}"  // e.g. "No stores yet — add your first store"
```

---

## 6. Error Boundaries — Add Role-Level error.tsx

Every role directory needs:
```tsx
// src/app/{role}/error.tsx
"use client"
export default function RoleError({ error, reset }: { error: Error; reset: () => void }) {
  return <WorkspaceShell session={session}><!-- Workspace-aware error UI --></WorkspaceShell>
}
```

Same pattern for admin, staff, candidate, company, inspector.

---

## 7. Loading States — Individual Page Skeletons

Instead of relying solely on the parent `(role)/loading.tsx`, add per-page loading.tsx for heavy pages:
- `admin/candidates/loading.tsx` — CandidateSearchSkeleton
- `company/requests/loading.tsx` — DataTableSkeleton

---

## Priority Order for Implementation

1. **StatusBadge** — lowest effort, highest visual impact (replaces inline styles)
2. **Role-level error.tsx** — prevents silent failures in production
3. **Standardize empty states** — quick text replacements
4. **Adopt DataTablePage** — brings loading/error/empty/pagination to all list pages
5. **Adopt ActionBar** — unifies admin + staff action patterns
6. **Unify CandidateSearchOS** — single component with role prop
7. **Add missing design tokens** — typography, spacing, shadows, animations
