# StudentHub Design System

> Unified design tokens and component blueprints for the StudentHub Next.js rebuild.
> Phase 0 deliverable under STU-190 / STU-947.

---

## 1. Design Tokens

### Color Palette

#### Light Mode (`:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#182230` | Body text, headings |
| `--muted` | `#667085` | Secondary text, metadata |
| `--faint` | `#8a95a6` | Disabled text, placeholders |
| `--line` | `#d6dce7` | Borders, dividers, input edges |
| `--paper` | `#f5f7fa` | Page background |
| `--surface` | `#ffffff` | Card, panel, dropdown backgrounds |
| `--surface-soft` | `#fbfcfe` | Subtle surface variant |
| `--grid-line` | `rgba(214, 220, 231, 0.42)` | Background grid pattern |
| `--blue` | `#0b63ce` | Primary action, active state, links |
| `--blue-deep` | `#084b9b` | Hover state for blue |
| `--green` | `#24835b` | Success, approved, complete |
| `--amber` | `#a66212` | Warning, pending, needs review |
| `--rose` | `#b42357` | Error, destructive, cancelled |

#### Dark Mode (`[data-theme="dark"]`)

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#e7ecf5` | Body text |
| `--muted` | `#9da8ba` | Secondary text |
| `--faint` | `#78859b` | Disabled text |
| `--line` | `#2a3547` | Borders |
| `--paper` | `#090d14` | Page background |
| `--surface` | `#111824` | Card background |
| `--surface-soft` | `#151d2a` | Subtle surface |
| `--blue` | `#8abfff` | Primary action (inverted) |
| `--green` | `#6ed5a0` | Success |
| `--amber` | `#e8ae63` | Warning |
| `--rose` | `#ff8aac` | Error |

#### Semantic Status Colors

| Status | Light | Dark |
|--------|-------|------|
| Success / Approved | `--green` | `--green` |
| Warning / Needs review | `--amber` | `--amber` |
| Error / Cancelled | `--rose` | `--rose` |
| Info / Active | `--blue` | `--blue` |
| Neutral / Inactive | `--muted` | `--muted` |

#### shadcn/ui Mapping

| shadcn Token | Light Value | Dark Value |
|-------------|-------------|------------|
| `--background` | `--paper` | `--paper` |
| `--foreground` | `--ink` | `--ink` |
| `--card` | `--surface` | `--surface` |
| `--card-foreground` | `--ink` | `--ink` |
| `--primary` | `#111827` | `#e7ecf5` |
| `--primary-foreground` | `#ffffff` | `#090d14` |
| `--secondary` | `#eef2f7` | `#1b2534` |
| `--secondary-foreground` | `#172033` | `#e7ecf5` |
| `--muted` (shadcn) | `#f4f6fa` | `#111824` |
| `--muted-foreground` | `--muted` | `--muted` |
| `--accent` | `#eaf2ff` | `#15263f` |
| `--accent-foreground` | `#12376c` | `#cfe4ff` |
| `--destructive` | `#b42318` | `#ff8a8a` |
| `--destructive-foreground` | `#ffffff` | `#090d14` |
| `--border` / `--input` | `--line` | `--line` |
| `--ring` | `#2563eb` | `#2563eb` |
| `--radius` | `8px` | `8px` |

### Typography

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Hero | `clamp(38px, 4.5vw, 64px)` | 400 | 0.98 | Landing page heading |
| h1 | `clamp(27px, 2.8vw, 42px)` | 400 | 1.05 | Page title |
| h2 | `20px` | 600 | 1.2 | Section heading |
| Body | `14px` / `1rem` | 400 | 1.45 | Default text |
| Small | `12px` / `0.86rem` | 400 | 1.4 | Metadata, captions |
| Label | `0.8125rem` | 500 | 1 | Form labels |
| Eyebrow | `12px` | 700 | 1 | Uppercase section marker |
| Badge | `0.76rem` | 600 | 1 | Badge/tag text |
| Button | `inherit` | 600 | 1 | Button text |

**Font Family:** `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Spacing System

Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight gaps, icon spacing |
| `--space-2` | `8px` | Button gaps, nav item gaps |
| `--space-3` | `12px` | Rail padding, card padding |
| `--space-4` | `14px` | Stage padding, section gap |
| `--space-5` | `16px` | Card content padding, topbar padding |
| `--space-6` | `18px` | Topbar gap |
| `--space-7` | `22px` | Card shadows |
| `--space-8` | `24px` | Large gaps |
| `--space-9` | `28px` | Login shell gap |
| `--space-10` | `32px` | Page margins |
| `--space-12` | `44px` | Large section spacing |

### Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Buttons (sm), small controls |
| `--radius-md` | `6px` | Tabs, smaller cards |
| `--radius` | `8px` | Default: cards, inputs, buttons, panels |
| `--radius-lg` | `12px` | Modals, large panels |
| `--radius-full` | `999px` | Badges, pills, circular elements |

### Shadow Levels

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 8px 22px rgba(16,24,40,0.08)` | Hover states, subtle elevation |
| `--shadow-md` | `0 8px 24px rgba(16,24,40,0.08)` | Active nav items |
| `--shadow-lg` | `0 18px 60px rgba(16,24,40,0.06)` | Card default shadow |
| `--shadow-xl` | `0 22px 80px rgba(16,24,40,0.12)` | Modals, dropdowns |
| `--shadow-button` | `0 10px 28px color-mix(in srgb, var(--primary) 14%, transparent)` | Primary button |

### Animation Timing

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-fast` | `120ms` | `ease` | Micro-interactions, color transitions |
| `--duration-normal` | `160ms` | `ease` | Button hover, border color, form focus |
| `--duration-slow` | `240ms` | `ease-out` | Panel open/close |
| `--duration-xl` | `300ms` | `ease-out` | Page transitions |

### Responsive Breakpoints

| Name | Width | Target |
|------|-------|--------|
| Mobile | `< 640px` | Phone |
| Tablet | `640px - 1023px` | Tablet portrait |
| Desktop | `1024px - 1279px` | Small desktop |
| Wide | `>= 1280px` | Large desktop |

---

## 2. Component Blueprints

### Breadcrumbs

**Location:** `src/modules/workspace/Breadcrumbs.tsx`
**Status:** ✅ Implemented

**Props interface:**
```typescript
export type BreadcrumbItem = {
  label: string;
  href?: Route;
};
```

**Role-scoping:** Auto-generated from pathname segments. Role prefix (`admin`, `staff`, `candidate`, `company`, `inspector`) becomes root breadcrumb.

**States:**
- **Loading:** Not applicable (client-side, instant render)
- **Empty:** Returns `null` when at root (`/app`)
- **Normal:** Shows `Home > Section > Detail` with clickable links
- **Overflow:** Long paths truncate naturally (limited segments)

**Unified spec:**
- One component, no role-specific variants
- ChevronRight separator (Lucide icon)
- Last segment is bold + non-clickable (aria-current="page")
- Custom label overrides for kebab-case → Title Case

---

### StatusBadge

**Location:** `src/modules/workspace/StatusBadge.tsx`
**Status:** ✅ Implemented

**Props interface:**
```typescript
interface StatusBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  label: string;
  loading?: boolean;
  showDetails?: boolean;
  detail?: string;
  className?: string;
}
```

**Role-scoping:**
- `showDetails` prop — when true (admin/staff), shows extra detail context in parentheses
- Default `false` for candidate/company views

**States:**
- **Loading:** `animate-pulse` skeleton shimmer
- **Success:** Green bg/text (`--green`)
- **Warning:** Amber bg/text (`--amber`)
- **Error:** Rose bg/text (`--rose`)
- **Info:** Blue bg/text (`--blue`)
- **Neutral:** Gray bg/text (`--muted`)

---

### DataTable

**Location:** `src/modules/workspace/DataTable.tsx`
**Status:** ✅ Implemented

**Props interface:**
```typescript
interface DataTableProps<T extends { id: string | number }> {
  title: string;
  description: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref?: (row: T) => Route;
  loading?: boolean;
  loadingSkeletonRows?: number;
  emptyMessage?: string;
  emptyAction?: EmptyAction;
  error?: string;
  onRetry?: () => void;
  totalPages?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
}
```

**States:**
- **Loading:** Skeleton rows (configurable count, default 5)
- **Empty:** Custom message + optional CTA button
- **Error:** Red alert + retry button
- **Normal:** Full data with pagination
- **Disabled:** N/A (parent controls visibility)

---

### CandidateCard

**Location:** `src/modules/candidates/CandidateCard.tsx`
**Status:** ✅ Implemented (with role scoping)

**Props interface:**
```typescript
type CandidateCardRole = 'staff' | 'admin' | 'company';

interface CandidateCardProps {
  data: CandidateCardData;
  href: string;
  isSelected?: boolean;
  role?: CandidateCardRole;
  variant?: 'queue';
}
```

**Role-scoping:**
- `staff`/`admin`: All fields visible (rate, email, status, flags)
- `company`: Rate and email hidden (sensitive data gated by `showSensitive`)
- Default role: `"staff"`

**States:**
- **Normal:** Grid card with initial avatar, name, email, status, company, store, updated date, flags
- **Selected:** Blue left border indicator + elevated shadow
- **Loading:** Parent controls via DataTable
- **Empty:** Parent controls via DataTable
- **Flag overflow:** Max 3 flags shown

---

### RoleLayoutShell

**Location:** `src/modules/workspace/RoleLayoutShell.tsx`
**Status:** ✅ Implemented (STU-988)

Provides role-specific branding via icon mapping:
| Role | Icon | Label |
|------|------|-------|
| Admin | Shield | Admin |
| Staff | Briefcase | Staff |
| Candidate | GraduationCap | Candidate |
| Company | Building2 | Company |
| Inspector | SearchCheck | Inspector |

---

### FormPage

**Location:** `src/modules/workspace/FormPage.tsx`
**Status:** ✅ Implemented

**States:** Loading, submitting, dirty state validation, error display, success toast.

---

### DetailPage

**Location:** `src/modules/workspace/DetailPage.tsx`
**Status:** ✅ Implemented

**States:** Loading skeleton, error state with retry, empty state for related records, normal detail view.

---

### SearchInterface

**Location:** `src/modules/workspace/SearchInterface.tsx`
**Status:** ✅ Implemented

**Features:** Scope pills, text search with debounce, filter chips, recent searches.

---

## 3. Identified Duplications & Gaps

### Components That Need Unification

| Component | Current State | Action |
|-----------|--------------|--------|
| Layout wrappers | 5 identical files | ✅ DONE (STU-988) |
| Error boundary | ErrorBoundary.tsx exists but is basic | 🔴 Needs upgrade from basic to full recovery UI |
| WorkTabs | In WorkspaceShell but not extracted as reusable | 🟡 Extract to shared component |
| DetailPanels | FactPanel + DetailPanels overlap | 🟡 Consolidate into one |
| WorkLog components | WorkLogAppealForm + WorkLogStaffActions should share base | 🟡 Refactor |

### Missing Components / States

| Missing | Impact | Priority |
|---------|--------|----------|
| Transition animations between routes | Jarring page switches | Medium |
| Accessibility audit | Keyboard nav, ARIA, focus trap | Medium |
| Visual regression tests for 5 role dashboards | No visual smoke tests | Medium |
| Mobile navigation polish | MobileTabBar exists but missing active state on some roles | Low |
| Landing page /app/ still empty | Root of unified route does nothing | Low |

---

## 4. UX Flow Maps

### Admin Flow
```
Login → /app (Admin dashboard)
  ├── Candidates → list → detail (approve, edit, review notes)
  ├── Companies → list → detail (manage accounts, approve)
  ├── Requests → list → detail (manage pipeline, assign staff)
  └── Transfers → list → detail (finance, approve payments)
```

### Staff Flow
```
Login → /app (Staff dashboard)
  ├── Candidates → list → detail (match, send CVs, create shortlist)
  ├── Interviews → list → detail (schedule, confirm)
  └── Requests → list → detail (fulfill request, manage pipeline)
```

### Candidate Flow
```
Login → /app (Candidate dashboard)
  ├── Edit Profile (manage personal info, documents, preferences)
  ├── Invitations → list → detail (accept/decline, track)
  ├── Payments → list → detail (view earnings, history)
  └── Work Logs → list → detail (submit, track hours)
```

### Company Flow
```
Login → /app (Company dashboard)
  ├── Companies → list → detail (manage profiles)
  ├── Contacts → list (manage company contacts)
  ├── Requests → list → create → detail (submit hiring demand, review)
  └── Stores → list (manage store locations)
```

### Inspector Flow
```
Login → /app (Inspector dashboard)
  └── ID Requests → list → detail (review batches, resolve documents)
```

---

## 5. Design System Architecture

```
src/
├── components/ui/          # 26 shadcn/ui primitives (low-level)
├── modules/workspace/      # Shared workspace components (Breadcrumbs, DataTable, etc.)
├── modules/candidates/     # Candidate-specific business logic components
├── modules/requests/       # Request-specific business logic components
├── modules/finance/        # Finance-specific components
├── modules/admin/          # Admin-specific layout wrapper (thin)
├── modules/staff/          # Staff-specific layout wrapper (thin)
├── modules/candidate/      # Candidate-specific layout wrapper (thin)
├── modules/company/        # Company-specific layout wrapper (thin)
├── modules/inspector/      # Inspector-specific layout wrapper (thin)
├── styles/
│   ├── styles.css          # Main CSS with design tokens (source of truth)
│   ├── shell.css           # Shell layout styles (extracted)
│   ├── ui.css              # UI primitive styles (extracted)
│   └── pages.css           # Page-specific styles (extracted)
└── modules/design-system/stories/  # 21 story files for shadcn/ui components
```
