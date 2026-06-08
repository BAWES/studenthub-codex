# StudentHub Design System & Component Audit

> STU-616 / STU-190 — Unified design language definition and component inventory across all 5 role-specific implementations.

---

## 1. Component Inventory

### 1.1 shadcn/ui Wrapper Components (`src/components/ui/`)

These 23 components form the primitive layer. Each wraps a Radix UI headless primitive (or HTML element) and maps to CSS classes defined in `styles.css` via `class-variance-authority`.

#### Original 15 (STU-163 baseline)

| Component | Radix Primitive | Variants | Status |
|---|---|---|---|
| **Button** | `@radix-ui/react-slot` | `variant`: default, secondary, ghost, outline, destructive / `size`: default, sm, lg, icon | Complete |
| **Badge** | (native span) | `variant`: default, secondary, success, warning, outline | Complete |
| **Card** | (native section) | Sub-components: Card, CardHeader, CardTitle, CardDescription, CardContent | Complete |
| **Input** | (native input) | None — single variant | Complete |
| **Label** | `@radix-ui/react-label` | None | Complete |
| **Dialog** | `@radix-ui/react-dialog` | Sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter | Complete |
| **Sheet** | `@radix-ui/react-dialog` (adapted) | Sub-components: SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter | Complete |
| **Select** | `@radix-ui/react-select` | Sub-components: SelectTrigger, SelectValue, SelectContent, SelectItem | Complete |
| **Tabs** | `@radix-ui/react-tabs` | Sub-components: TabsList, TabsTrigger, TabsContent | Complete |
| **Command** | `cmdk` | Sub-components: CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty, CommandShortcut | Complete |
| **DropdownMenu** | `@radix-ui/react-dropdown-menu` | Sub-components: DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel | Complete |
| **Tooltip** | `@radix-ui/react-tooltip` | Sub-components: TooltipTrigger, TooltipContent | Complete |
| **Skeleton** | (native div) | None — CSS-only pulse animation | Complete |
| **Separator** | `@radix-ui/react-separator` | `orientation`: horizontal, vertical | Complete |
| **Sonner** | `sonner` | Toaster wrapper | Complete |

#### Added in STU-629 (this branch)

| Component | Radix Primitive | Variants | Status |
|---|---|---|---|
| **Checkbox** | `@radix-ui/react-checkbox` | None | Complete |
| **RadioGroup** | `@radix-ui/react-radio-group` | Sub-components: RadioGroup, RadioGroupItem | Complete |
| **Switch** | `@radix-ui/react-switch` | None | Complete |
| **Textarea** | (native textarea) | None | Complete |
| **Alert** | (native div) | `variant`: default, destructive | Complete |
| **AlertDialog** | `@radix-ui/react-alert-dialog` | Sub-components: AlertDialogTrigger, Content, Header, Title, Description, Footer, Cancel, Action | Complete |
| **Avatar** | `@radix-ui/react-avatar` | Sub-components: AvatarImage, AvatarFallback | Complete |
| **Popover** | `@radix-ui/react-popover` | Sub-components: PopoverTrigger, PopoverContent, PopoverAnchor | Complete |

**Pattern**: Every component follows the same structure — import Radix primitives, apply CSS classes via `cn()` utility, export typed React components with `forwardRef`. No Tailwind utility classes are used inline; all styling lives in `styles.css`.

### 1.2 Workspace Module Components (`src/modules/workspace/`)

These 16 files form the application shell and shared UI patterns:

| Component | Type | Role | Shared By |
|---|---|---|---|
| **WorkspaceOS** | Client | Outer shell: sidebar rail, command palette (Cmd+K), G-chord keyboard nav, theme toggle, sign-out, mobile tab bar | All 5 role layouts + /app |
| **WorkspaceShell** | Client | Inner page layout: topbar, metrics grid, children slot, primary/secondary data lists. Has `embedded` mode flag | Every role page |
| **WorkspaceNavigation** | Client | Renders `navForRole()` items as sidebar rail (desktop) + bottom tab bar (mobile) | WorkspaceOS, WorkspaceShell |
| **FeatureGrid** | Server | Navigation tile grid from `NavItem[]` | Admin dashboard |
| **DataTable** | Server | Generic typed data table with optional `rowHref` link column | Every list page across all roles |
| **FactPanel** | Server | Key-value fact grid for detail views | Every detail page across all roles |
| **CompactList** | Server | Row list with main text + meta badge + optional link | Every detail page across all roles |
| **SlidePanel** | Client | Slide-out drawer wrapping Sheet with header/body/footer slots | Detail views |
| **WorkTabs** | Client | localStorage-persisted tab bar for recently viewed records | Detail pages |
| **NoticeToast** | Client | Reads `?notice=` search param, fires sonner toast from catalog | Any page |
| **Skeletons** | Client | Loading placeholders: WorkspaceShellSkeleton, DataTableSkeleton, DetailPageSkeleton, QuickSkeleton | Every loading.tsx |
| **StaffCandidateConsole** | Client | Full Kanban-style candidate management desk with search, lanes, peek panel | Staff candidates page |
| **WorkspaceOSContext** | Client | React context: `{ embedded, session }` — tells WorkspaceShell whether inside WorkspaceOS | WorkspaceOS → WorkspaceShell bridge |
| **navigation** | Data | `navForRole(role): NavItem[]` — single source of truth for role navigation | WorkspaceNavigation |
| **data** | Data | 2,384 lines of Prisma queries: `getAdmin*`, `getStaff*`, `getCandidate*`, `getCompany*`, `getInspector*` | All role pages |
| **format** | Util | `formatDate()`, `formatMoney()` | Data display |

### 1.3 Role Page Matrix

Every role follows the same pattern: **Layout** (guard + WorkspaceOS) → **Page** (WorkspaceShell + role content).

| Role | Pages | Shared Components Used | Unique Components |
|---|---|---|---|
| **Admin** (10 files) | Dashboard, Candidates search, Companies list/detail, Requests list/detail, Transfers list/detail | WorkspaceOS, WorkspaceShell, DataTable, FactPanel, CompactList, SlidePanel, CandidateSearchOS, RequestFulfillmentOS, RequestActionBar, MatchActions, StageActions | Dashboard, TransferActionBar |
| **Staff** (8 files) | Home, Candidates search, Requests list/detail, Interviews list/detail | WorkspaceOS, WorkspaceShell, DataTable, FactPanel, CompactList, CandidateSearchOS, RequestFulfillmentOS, RequestActionBar, MatchActions, StageActions, RequestCreateForm, WorkLogStaffActions, ExportCVsForm | StaffHome, StaffCandidateConsole |
| **Candidate** (9 files) | Profile, Edit form, Invitations list/detail, Work Logs list/detail, Payments list/detail | WorkspaceOS, WorkspaceShell, DataTable, FactPanel, CompactList, CandidateProfile | CandidateEditForm, InvitationRespondForm, WorkLogAppealForm |
| **Company** (9 files) | Workspace home, Companies list/detail, Requests list/detail/create, Contacts, Stores | WorkspaceOS, WorkspaceShell, DataTable, FactPanel, CompactList, CandidateProfile (read-only) | CompanyRequestCreateForm, AddContactForm, AddStoreForm, RemoveContactButton, RemoveStoreButton |
| **Inspector** (5 files) | Home, ID Requests list/detail | WorkspaceOS, WorkspaceShell, DataTable, FactPanel | Inline IdRequestActions in detail page |

**Key finding**: CandidateSearchOS and RequestFulfillmentOS are already shared between admin and staff. The Company request detail uses a simpler FactPanel-based view instead of the shared RequestFulfillmentOS — this is a unification opportunity.

### 1.4 Missing Common Components

#### Added (STU-629)

These were identified as gaps in the original audit and have been implemented:

- **Checkbox / RadioGroup / Switch** — toggle inputs via `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`, `@radix-ui/react-switch`
- **Textarea** — styled multi-line input
- **Alert / AlertDialog** — styled notification and destructive-action confirmation
- **Avatar** — user/profile image with fallback initials
- **Popover** — inline popover for contextual actions

#### Still Missing

| Component | Priority | Notes |
|---|---|---|
| **Table** | Medium | Custom `DataTable` handles most use cases; shadcn Table would provide a styled base for simpler tables |
| **Accordion** | Low | Expandable sections for FAQ/settings |
| **Progress** | Low | Multi-step progress indicator (could enhance RequestFulfillmentOS) |
| **ScrollArea** | Low | Styled scroll container with overflow shadows |
| **Form** | Medium | react-hook-form + zod integration wrapper (all current forms use raw HTML inputs) |
| **Toggle / ToggleGroup** | Low | Toggle button group for filters |
| **ContextMenu** | Low | Right-click context menus |
| **HoverCard** | Low | Preview cards on hover |

### 1.5 CSS Class Inventory

Approximately 120 unique CSS classes organized by prefix:

| Prefix | Count | Purpose |
|---|---|---|
| `ui*` | ~30 | shadcn component wrappers (uiButton, uiCard, uiBadge, uiInput, etc.) |
| `workspace*` | ~10 | Shell layout (workspaceRail, workspaceStage, workspaceRailNav) |
| `linear*` | ~56 | Staff candidate console (linearDesk, linearLane, linearCandidateCard) |
| `shell*` | ~3 | Shell variants (shell, shellEmbedded) |
| `data*` | ~5 | Data display (dataList, listHeader, rows, row, rowMain, rowMeta) |
| `feature*` | ~2 | Feature grid tiles |
| Other | ~14 | Empty states, topbar, metrics, finance sections, detail panels |

### 1.6 Role-Module Component Catalog

Full inventory of every component file organized by module. This covers all `.tsx` files outside `src/components/ui/` and `src/modules/workspace/`.

#### Auth (`src/modules/auth/`)

| Component | Type | Role |
|---|---|---|
| **LoginForm** | Client | Email/password form with server action submission |

#### Candidates (`src/modules/candidates/`)

| Component | Type | Role | Shared By |
|---|---|---|---|
| **CandidateProfile** | Server | Read-only profile detail view with quick actions | Admin, Staff, Candidate (own profile) |
| **CandidateEditForm** | Client | Multi-section form: personal info, languages, skills, education, civil ID | Candidate (self-edit) |
| **CandidateSearchOS** | Client | Search form + results with filters (name, phone, email, nationality, status) | Admin, Staff |
| **InvitationRespondForm** | Client | Accept/decline invitation with reason | Candidate |
| **WorkLogAppealForm** | Client | Dispute a work log entry | Candidate |
| **WorkLogStaffActions** | Client | Approve/reject work log entries | Staff, Admin |
| **ExportCVsForm** | Client | Batch CV export form | Staff, Admin |

#### Requests (`src/modules/requests/`)

| Component | Type | Role | Shared By |
|---|---|---|---|
| **RequestFulfillmentOS** | Client | Multi-step fulfillment workflow (review → match → stage → close) | Admin, Staff |
| **RequestActionBar** | Client | Action buttons for request status transitions | Admin, Staff |
| **RequestCreateForm** | Client | Staff-side request creation form | Staff |
| **CompanyRequestCreateForm** | Client | Company-side request submission | Company |
| **MatchActions** | Client | Candidate match/unmatch controls | Admin, Staff |
| **StageActions** | Client | Stage progression controls | Admin, Staff |

#### Company (`src/modules/company/`)

| Component | Type | Role |
|---|---|---|
| **AddContactForm** | Client | Add company contact person form |
| **AddStoreForm** | Client | Add store/location form |
| **RemoveContactButton** | Client | Confirm-then-remove contact button |
| **RemoveStoreButton** | Client | Confirm-then-remove store button |

#### Staff (`src/modules/staff/`)

| Component | Type | Role |
|---|---|---|
| **StaffHome** | Server | Staff landing page with quick stats and queue summaries |

#### Dashboard (`src/modules/dashboard/`)

| Component | Type | Role |
|---|---|---|
| **Dashboard** | Server | Admin dashboard with metrics grid and navigation tiles |

#### Finance (`src/modules/finance/`)

| Component | Type | Role |
|---|---|---|
| **TransferActionBar** | Client | Approve/reject transfer requests | Admin |

#### Hub (`src/modules/hub/`)

| Component | Type | Role |
|---|---|---|
| **HubContent** | Server | Universal command hub at `/app` — role-specific guide, search, navigation |
| **HubShortcuts** | Client | Quick-action shortcut buttons |

#### Theme (`src/modules/theme/`)

| Component | Type | Role |
|---|---|---|
| **ThemeToggle** | Client | Light/dark mode toggle button |
| **ThemeScript** | Client | Inline `<script>` to prevent flash of wrong theme |

#### Inspector (`src/modules/inspector/`)

No standalone component files. Inspector ID verification actions (approve/reject) are implemented inline in the detail page at `src/app/inspector/id-requests/[id]/page.tsx`.

#### Layouts (`src/app/**\/layout.tsx`)

All 6 role layouts follow an identical pattern: session guard → WorkspaceOS with role-specific navigation. Each layout is ~9 lines. Consolidation opportunity: a `createRoleLayout(role, capability)` factory would eliminate 5 duplicate layout files.

| Layout | Guard | Capability Check |
|---|---|---|
| `admin/layout.tsx` | `requireRole("ADMIN")` | None (role-only) |
| `staff/layout.tsx` | `requireRole("STAFF")` | None (role-only) |
| `candidate/layout.tsx` | `requireRole("CANDIDATE")` | None (role-only) |
| `company/layout.tsx` | `requireRole("COMPANY")` | None (role-only) |
| `inspector/layout.tsx` | `requireRole("INSPECTOR")` | None (role-only) |
| `app/layout.tsx` | Session only (any authenticated) | None (universal hub) |

---

## 2. Design Tokens

### 2.1 Color System

**Source**: `src/app/styles.css` lines 26-99.

#### Semantic Tokens (7 tokens)

These form the foundation. All components reference these, never raw hex values directly (except in `:root` definitions).

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--ink` | `#182230` | `#e7ecf5` | Primary text, headings |
| `--muted` | `#667085` | `#9da8ba` | Secondary text, descriptions |
| `--faint` | `#8a95a6` | `#78859b` | Tertiary text, placeholders |
| `--line` | `#d6dce7` | `#2a3547` | Borders, dividers |
| `--paper` | `#f5f7fa` | `#090d14` | Page background |
| `--surface` | `#ffffff` | `#111824` | Card/sheet backgrounds |
| `--surface-soft` | `#fbfcfe` | `#151d2a` | Subtle elevated surfaces |

#### Accent Tokens (5 tokens)

Used for status indicators, links, and semantic coloring.

| Token | Light Value | Dark Value | Semantic Meaning |
|---|---|---|---|
| `--blue` | `#0b63ce` | `#8abfff` | Primary action, links, info |
| `--blue-deep` | `#084b9b` | `#5aa4ff` | Hover/pressed blue states |
| `--green` | `#24835b` | `#6ed5a0` | Success, approved, positive |
| `--amber` | `#a66212` | `#e8ae63` | Warning, pending, attention |
| `--rose` | `#b42357` | `#ff8aac` | Error, destructive, rejected |

#### Shadcn Compatibility Tokens (11 tokens)

Mapped through to enable shadcn/ui component compatibility.

| Token | Light Value | Dark Value |
|---|---|---|
| `--primary` | `#111827` | `#e7ecf5` |
| `--primary-foreground` | `#ffffff` | `#090d14` |
| `--secondary` | `#eef2f7` | `#1b2534` |
| `--secondary-foreground` | `#172033` | `#e7ecf5` |
| `--accent` | `#eaf2ff` | `#15263f` |
| `--accent-foreground` | `#12376c` | `#cfe4ff` |
| `--destructive` | `#b42318` | `#ff8a8a` |
| `--destructive-foreground` | `#ffffff` | `#090d14` |
| `--border` | `var(--line)` | `var(--line)` |
| `--input` | `var(--line)` | `var(--line)` |
| `--ring` | `#2563eb` | `#8abfff` |

**Issue**: `--primary` (`#111827`) and `--ink` (`#182230`) are nearly identical in light mode — almost indistinguishable. This collapses the visual hierarchy between primary actions and body text.

**Issue**: `--destructive` (`#b42318`) and `--rose` (`#b42357`) are visually similar reds but carry different semantics. Only `--destructive` is wired into shadcn; `--rose` is used in raw CSS.

### 2.2 Typography

**Typeface**: Inter (with system-ui fallback stack: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)

**No formal type scale exists.** The following font sizes appear in `styles.css`:

| Size | Usage | Frequency |
|---|---|---|
| `11px` | Eyebrow labels, fine print | 2 occurrences |
| `12px` | Small labels, meta text | 5 occurrences |
| `13px` | Row meta | 2 occurrences |
| `14px` | Body text, row content, compact UI | 4 occurrences |
| `15px` | Metric values, table content | 3 occurrences |
| `0.76rem` (~12px) | Badge text | 1 occurrence |
| `0.86rem` (~14px) | Small button text | 1 occurrence |
| `0.875rem` (~14px) | Dialog body, select items | 3 occurrences |
| `0.88rem` (~14px) | Card description | 1 occurrence |
| `0.9375rem` (~15px) | Button base, form elements | 2 occurrences |
| `1.05rem` (~17px) | Card titles | 1 occurrence |
| `1.125rem` (~18px) | Section headings | 1 occurrence |
| `17px` | Landing body | 1 occurrence |
| `18px` | Topbar title area | 1 occurrence |
| `20px` | Landing subtitle | 1 occurrence |
| `27px–42px` (clamp) | Landing hero heading | 1 occurrence |
| `34px` | Large metric number | 1 occurrence |
| `38px–64px` (clamp) | Landing mega heading | 1 occurrence |

**Line heights used**: 0.98, 1, 1.05, 1.2, 1.4, 1.45, 1.55 — no consistent pattern.

**Font weights**: 500, 600, 700, 760, 800, 900 — no defined weight scale. Most interactive elements use 760 (a non-standard weight).

**Critical gap**: No design token for font sizes, line heights, or font weights. Every component picks its own values.

### 2.3 Spacing

**No spacing scale exists.** Values are hardcoded across all CSS. The most common values extracted from `styles.css`:

**Padding values used**: 0, 2px, 4px, 5px, 6px, 8px, 10px, 11px, 12px, 13px, 14px, 16px, 18px, 20px, 28px, 42px

**Gap values used**: 4px, 5px, 6px, 8px, 10px, 12px, 14px, 18px, 28px

**Margin values used**: 0, 2px, 4px, 8px, 10px, 14px, 18px

No rem-based spacing tokens. No Tailwind spacing scale in use. Values are arbitrary pixels.

### 2.4 Elevation & Shadow

**Single shadow token**: `--shadow: 0 22px 80px rgba(16, 24, 40, 0.12)` (dark: `0 24px 90px rgba(0, 0, 0, 0.45)`)

Used sparingly — mostly on the `.uiCard` component. No elevation scale (1–5) or layered shadow system exists.

### 2.5 Radii

**Single radius token**: `--radius: 8px`

Used by: buttons, inputs, cards, dialogs, sheets, select triggers.

**Issue**: Badge uses `border-radius: 999px` (pill) directly, bypassing the token. No smaller/larger radius variants exist (e.g., sm: 4px, lg: 12px).

### 2.6 Motion

**Single transition pattern**: `160ms ease` on background, border-color, color, box-shadow, and transform.

Used on: Button, Input, and other interactive elements. No motion tokens defined. No duration scale (100ms micro, 200ms standard, 300ms emphasis). No spring/bezier curve tokens.

### 2.7 Icon System

**Library**: Lucide React (`lucide-react` ^1.14.0)

**Size**: `16px` (in buttons via `.uiButton svg { width: 16px; height: 16px; }`), `18px` (in workspace navigation), `20px` (in some layout contexts)

**No icon size tokens.** The 16px default on buttons is applied globally via the CSS selector `.uiButton svg`. Navigation icons are sized ad-hoc.

### 2.8 Background Pattern

```css
body {
  background:
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
    linear-gradient(180deg, var(--grid-line) 1px, transparent 1px),
    var(--paper);
  background-size: 44px 44px;
}
```

A 44px dot-grid pattern on the body. This is a brand element that appears across all pages. The 44px grid size is hardcoded; no token exists.

---

## 3. UX Flows

### 3.1 Authentication & Session

```
Login (/login) → Session cookie (studenthub_next_session, 7 days) → Role redirect
```

The middleware (`src/middleware.ts`) intercepts all routes. Unauthenticated users on protected routes → `/login`. Authenticated users on `/login` → their role home.

### 3.2 Shell Architecture (All Roles)

```
┌─ WorkspaceOS ──────────────────────────────────────────┐
│ ┌─ Sidebar Rail (desktop) ─┐  ┌─ WorkspaceStage ──────┐│
│ │                           │  │ ┌─ Topbar ───────────┐││
│ │  Brand mark               │  │ │ Eyebrow + Title    │││
│ │  Navigation (role items)  │  │ │ AccountBox (user)  │││
│ │                           │  │ └────────────────────┘││
│ │                           │  │ ┌─ Metrics ──────────┐││
│ │  ── footer ──             │  │ │ Metric cards       │││
│ │  Theme toggle             │  │ └────────────────────┘││
│ │  Sign out                 │  │                       ││
│ └───────────────────────────┘  │ ┌─ Page Content ─────┐││
│                                │ │ (children)         │││
│  Command Palette (Cmd+K)       │ └────────────────────┘││
│  G-chord navigation            │                       ││
│  j/k row nav (data tables)     │ ┌─ Data Lists ───────┐││
│                                │ │ Primary / Secondary│││
│ ┌─ Mobile Tab Bar ────────────┐│ └────────────────────┘││
│ └─────────────────────────────┘└───────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 3.3 Key User Journeys

#### Flow 1: List → Detail (Data-heavy roles: Admin, Staff, Company, Inspector)

```
WorkspaceShell (role home)
  → DataTable (list view with row links)
  → Detail page (FactPanel + CompactList + SlidePanel optional)
  → WorkTabs persist visited records
```

#### Flow 2: Search → Fulfillment (Admin/Staff candidates & requests)

```
DataTable
  → CandidateSearchOS (search form + results)
  → RequestFulfillmentOS (multi-step fulfillment workflow)
  → SlidePanel for related records
```

#### Flow 3: Profile → Edit (Candidate self-service)

```
WorkspaceShell (profile home)
  → CandidateProfile (read view with quick actions)
  → Edit page (CandidateEditForm — large multi-section form)
  → Invitation respond / Work log appeal forms
```

#### Flow 4: Kanban Console (Staff candidates)

```
Staff home
  → StaffCandidateConsole (linearDesk layout)
    ├── Search bar (linearSearch)
    ├── Filter bar (linearFilters)
    ├── Kanban lanes (linearLanes → linearLane → linearCandidateCard)
    └── Peek panel (linearPeek: detail preview + activity + estate)
```

#### Flow 5: Command Hub (All roles, @ /app)

```
HubContent
  → Role-specific guide (buildRoleGuide)
  → Search (candidates by name/phone/email)
  → Navigation commands (buildCommands)
  → Quick queue summaries
```

#### Flow 6: ID Verification (Inspector)

```
Inspector home → ID Requests list → ID Request detail
  → IdRequestActions (approve/reject buttons, hidden when !pending)
```

### 3.4 Navigation Map

```
                    ┌──────────────┐
                    │   / (landing) │
                    └──────┬───────┘
                           │ Login
                    ┌──────▼───────┐
                    │    /login     │
                    └──────┬───────┘
                           │ Session
                    ┌──────▼───────┐
                    │    /app       │ ← Universal hub (any role)
                    └──────────────┘
                           │
          ┌────────────────┼────────────────┬──────────────┐
          ▼                ▼                 ▼              ▼
    /admin/*          /staff/*         /candidate/*    /company/*
    /inspector/*

 Admin nav:           Staff nav:        Candidate nav:   Company nav:
  Overview             Overview           Overview         Overview
  Candidates           My Requests        Invitations      Requests
  Companies            Candidates         Work Logs        Companies
  Requests             Interviews         Payments         Contacts
  Transfers                                                Stores

 Inspector nav:
  Overview
  ID Requests
```

### 3.5 Keyboard Navigation System

The WorkspaceOS provides a keyboard-first navigation layer:

| Shortcut | Action |
|---|---|
| `Cmd+K` / `?` | Open command palette |
| `G` + letter | Go-to navigation chord (e.g., `G C` → Candidates) |
| `j` / `k` | Navigate up/down through `[data-os-navigable]` rows |
| `/` | Focus workspace search |
| `Escape` | Close command palette / dismiss overlay |

---

## 4. Gap Analysis & Recommendations

### 4.1 Critical: Typography Scale

**Current state**: 20+ font sizes, no hierarchy, no tokens.

**Recommendation**: Define a 7-step type ramp with CSS custom properties:

```
--text-xs: 0.75rem    (12px) — captions, badges
--text-sm: 0.8125rem  (13px) — meta, labels
--text-base: 0.875rem (14px) — body
--text-md: 0.9375rem  (15px) — emphasized body, button
--text-lg: 1.0625rem  (17px) — card titles, section heads
--text-xl: 1.25rem    (20px) — page titles
--text-2xl: 1.5rem    (24px) — hero/metric emphasis
```

Line heights: `--leading-tight: 1.1`, `--leading-normal: 1.4`, `--leading-relaxed: 1.6`

Font weights: `--weight-normal: 500`, `--weight-medium: 600`, `--weight-semibold: 700`

The non-standard `760` weight should be replaced with standard `700`.

### 4.2 Critical: Spacing Scale

**Current state**: 16+ arbitrary pixel values.

**Recommendation**: Adopt a 6-step spacing scale based on 4px grid:

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
```

This aligns with the existing 44px background grid and covers all observed values.

### 4.3 Critical: Elevation System

**Current state**: Single shadow, no elevation layering.

**Recommendation**: 3-step elevation scale:

```
--elevation-1: 0 1px 3px rgba(16, 24, 40, 0.06)   — cards, inputs
--elevation-2: 0 8px 24px rgba(16, 24, 40, 0.08)   — dropdowns, sheets
--elevation-3: 0 22px 80px rgba(16, 24, 40, 0.12)  — dialogs, modals (existing --shadow)
```

### 4.4 High: Missing Component Coverage

Add these shadcn components to reduce ad-hoc CSS and improve a11y:

1. **Checkbox + Radio + Switch** — currently using raw HTML inputs
2. **Textarea** — styled multi-line input for forms
3. **AlertDialog** — destructive action confirmation (replaces raw confirm())
4. **Avatar** — user/profile images
5. **Popover** — contextual action menus
6. **Form** — react-hook-form + zod integration wrapper
7. **Accordion** — expandable FAQ/settings sections
8. **Progress** — multi-step indicators for RequestFulfillmentOS

### 4.5 Medium: Architecture Simplifications

1. **Remove WorkspaceShell standalone mode.** The `embedded` flag is always true in practice. Remove the dead code path.
2. **Extract role layouts to a factory.** All 5 layouts are identical (~9 lines). A `createRoleLayout(role, capability)` factory eliminates duplication.
3. **Share RequestFulfillmentOS with Company.** Currently company request detail uses FactPanel; admin/staff share a full OS. Unify.
4. **Split `data.ts` (2,384 lines).** Per-role data modules would improve discoverability.

### 4.6 Medium: CSS Architecture

1. **Split `styles.css` (9,406 lines) into layers:**
   - `tokens.css` — custom properties
   - `ui.css` — shadcn component primitives
   - `shell.css` — workspace layout
   - `pages.css` — page-level patterns
2. **Adopt a formal CSS class naming convention.** Current mix of BEM-like prefixes (`ui*`, `workspace*`, `linear*`) is informal. Standardize on one pattern.
3. **Convert hardcoded pixel values to token references** across all component CSS.

### 4.7 Low: Polish & Consistency

1. **Standardize empty state components.** `DataTable` has "No records found" but no visual treatment. Other lists have no empty state at all.
2. **Standardize error boundaries.** Each role page should have consistent error recovery.
3. **Add reduced-motion support.** `@media (prefers-reduced-motion)` is absent.
4. **Define focus ring system.** Currently a single `focus-visible` rule on Button/Input. Extend to all interactive elements.

---

## 5. Token Reference Sheet

### Proposed Complete Token Set

```css
:root {
  /* === Semantic Color === */
  --ink: #182230;
  --muted: #667085;
  --faint: #8a95a6;
  --line: #d6dce7;
  --paper: #f5f7fa;
  --surface: #ffffff;
  --surface-soft: #fbfcfe;

  /* === Accent Color === */
  --blue: #0b63ce;
  --blue-deep: #084b9b;
  --green: #24835b;
  --amber: #a66212;
  --rose: #b42357;

  /* === Typography (proposed) === */
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.8125rem;
  --text-base: 0.875rem;
  --text-md: 0.9375rem;
  --text-lg: 1.0625rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --leading-tight: 1.1;
  --leading-normal: 1.4;
  --leading-relaxed: 1.6;
  --weight-normal: 500;
  --weight-medium: 600;
  --weight-semibold: 700;

  /* === Spacing (proposed) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* === Elevation (proposed) === */
  --elevation-1: 0 1px 3px rgba(16, 24, 40, 0.06);
  --elevation-2: 0 8px 24px rgba(16, 24, 40, 0.08);
  --elevation-3: 0 22px 80px rgba(16, 24, 40, 0.12);

  /* === Radius === */
  --radius-sm: 6px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-full: 999px;

  /* === Motion === */
  --duration-fast: 120ms;
  --duration-normal: 160ms;
  --duration-slow: 240ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  /* === Grid === */
  --grid-size: 44px;
}
```

---

## 6. Implementation Roadmap

### Completed

| Priority | Task | Completed |
|---|---|---|
| P0 | Define and codify typography scale tokens in CSS (`tokens.css` + `tokens.ts`) | STU-629 |
| P0 | Define and codify spacing scale tokens in CSS | STU-629 |
| P1 | Add elevation tokens | STU-629 |
| P1 | Add motion tokens | STU-629 |
| P1 | Add Checkbox, RadioGroup, Switch, Textarea components | STU-629 |
| P1 | Add AlertDialog, Alert, Avatar, Popover components | STU-629 |

### Remaining

| Priority | Task | Effort | Dependencies |
|---|---|---|---|
| P0 | Normalize font weights (760 → 700, 900 → 700) across all CSS | S | Typography scale |
| P2 | Split CSS into layered files (tokens.css, ui.css, shell.css, pages.css) | M | Token codification |
| P2 | Remove WorkspaceShell standalone mode (dead code path) | S | None |
| P2 | Extract createRoleLayout factory (5 duplicate layouts → 1) | S | None |
| P2 | Split data.ts (2,384 lines) into per-role data modules | M | None |
| P2 | Add shadcn Form component (react-hook-form + zod integration) | M | Tokens |
| P3 | Standardize empty/error/loading states across all data views | M | Component coverage |
| P3 | Unify Company request detail with RequestFulfillmentOS | M | None |
| P3 | Add Accordion, Progress, ScrollArea where needed | S | Tokens |
