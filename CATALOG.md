# StudentHub React Component Catalog

Generated: comprehensive catalog of all UI components across the StudentHub Next.js app.
Codebase: ~/Sites/studenthub/studenthub-next

---

## 1. LAYOUT & SHELL COMPONENTS

### WorkspaceOS
- **Path:** `src/modules/workspace/WorkspaceOS.tsx`
- **Type:** Client component ("use client")
- **Renders:** The top-level role-based app shell with sidebar rail, command palette (⌘K), keyboard shortcut chord detection (G-then-key navigation), role-scoped quick commands, and a WorkspaceOSContext provider. Renders a full-screen layout with desktop sidebar nav and mobile tab bar.
- **Used by routes:** All role layouts — `/admin/layout.tsx`, `/candidate/layout.tsx`, `/company/layout.tsx`, `/staff/layout.tsx`, `/inspector/layout.tsx`, `/app/layout.tsx`
- **Duplicated?** No — single component reused by all 6 route groups
- **States:** Normal, command palette open/closed, mobile/desktop

### WorkspaceShell
- **Path:** `src/modules/workspace/WorkspaceShell.tsx`
- **Type:** Client component ("use client")
- **Renders:** Content-stage layout with topbar (eyebrow + title + account box), metric cards section, children content area, primary/secondary data lists. Uses WorkspaceOSContext to detect embedding.
- **Used by routes:** All home/detail/list pages across admin, candidate, company, staff, inspector
- **Duplicated?** No — single shared shell
- **States:** Normal, embedded mode (when parent provides sidebar), loading metrics, empty lists

### RoleLayoutShell
- **Path:** `src/modules/workspace/RoleLayoutShell.tsx`
- **Type:** Client component ("use client")
- **Renders:** Alternative layout header with role branding icon (shield/briefcase/graduation cap/building/search-check), breadcrumbs, theme toggle, sign-out button. Wraps children in a simple flex column.
- **Used by routes:** Not directly used by any route pages — imported but available as alternative shell
- **Duplicated?** No

---

## 2. NAVIGATION COMPONENTS

### WorkspaceNavigation
- **Path:** `src/modules/workspace/WorkspaceNavigation.tsx`
- **Type:** Client component ("use client")
- **Renders:** Desktop sidebar nav with icons, labels, and active-state highlighting. Uses `isActive()` for current-page detection.
- **Used by routes:** All authenticated routes via WorkspaceShell/WorkspaceOS
- **Duplicated?** No — renders different nav items based on `role` prop

### WorkspaceMobileNavigation
- **Path:** `src/modules/workspace/WorkspaceNavigation.tsx` (same file)
- **Type:** Client component ("use client")
- **Renders:** Mobile bottom tab bar with role-scoped nav items, icons, and active highlighting.
- **Used by routes:** All authenticated routes via WorkspaceShell
- **Duplicated?** No

### Breadcrumbs
- **Path:** `src/modules/workspace/Breadcrumbs.tsx`
- **Type:** Client component ("use client")
- **Renders:** Auto-generated breadcrumb trail from URL pathname segments with chevron separators. `[id]` segments render as "Detail". Has `useBreadcrumbs()` hook.
- **Used by routes:** RoleLayoutShell and potentially any sub-page
- **Duplicated?** No

### WorkTabs
- **Path:** `src/modules/workspace/WorkTabs.tsx`
- **Type:** Client component ("use client")
- **Renders:** Browser-like tab bar showing recently opened record detail pages (persisted in localStorage). Each tab has a close button. Includes "Clear all" when >1 tabs. Uses `useWorkTabs()` hook.
- **Used by routes:** Intended for record detail pages
- **Duplicated?** No
- **States:** Empty (null), populated with tabs

### FeatureGrid
- **Path:** `src/modules/workspace/FeatureGrid.tsx`
- **Type:** Server-compatible
- **Renders:** Grid of link tiles for role-scoped workspace features, each showing label and "Open" link.
- **Used by routes:** `/admin/page.tsx` — {FeatureGrid items={navForRole("admin")}}
- **Duplicated?** No

---

## 3. DATA DISPLAY COMPONENTS

### DataTable
- **Path:** `src/modules/workspace/DataTable.tsx`
- **Type:** Server-compatible
- **Renders:** Semantic HTML `<table>` with header row, body rows with clickable "Open" link, and an empty state ("No records found") when rows=0. Accepts column definitions with custom render functions.
- **Used by routes:**
  - `/admin/companies/page.tsx` — Company accounts
  - `/admin/requests/page.tsx` — Request pipeline
  - `/admin/transfers/page.tsx` — Transfer runs
  - `/candidate/invitations/page.tsx` — Invitation history
  - `/candidate/payments/page.tsx` — Payment history
  - `/candidate/work-logs/page.tsx` — Work log history
  - `/company/companies/page.tsx` — Linked companies
  - `/company/contacts/page.tsx` — Contacts list
  - `/company/requests/page.tsx` — Hiring requests
  - `/company/stores/page.tsx` — Store locations
  - `/staff/requests/page.tsx` — Assigned requests
  - `/staff/interviews/page.tsx` — Interview pipeline
  - `/inspector/id-requests/page.tsx` — ID verification queue
- **Duplicated?** No — single reusable component
- **States:** Normal (rows present), Empty ("No records found")

### DataTablePage
- **Path:** `src/modules/workspace/DataTablePage.tsx`
- **Type:** Client component ("use client")
- **Renders:** Full list-page wrapper with search bar, client-side filtering, DataTable, pagination controls (prev/next), loading skeleton (DataTableSkeleton), and error state. Handles controlled/uncontrolled search value.
- **Used by routes:** Not directly used by any current route pages — available as a reusable pattern
- **Duplicated?** No
- **States:** Loading, Error, Empty filtered, Empty no records, Normal with pagination

### DetailPage
- **Path:** `src/modules/workspace/DetailPage.tsx`
- **Type:** Client component ("use client")
- **Renders:** Detail page template with eyebrow + title, action buttons, FactPanel sections for facts, and related records list with empty state. Shows DetailPageSkeleton when loading.
- **Used by routes:** Not directly used by current route pages — available as reusable pattern
- **Duplicated?** No
- **States:** Loading, Error, Normal, Empty related

### FormPage
- **Path:** `src/modules/workspace/FormPage.tsx`
- **Type:** Client component ("use client")
- **Renders:** Form page template with header (title, description, dirty indicator), validation error alert, form sections (fieldset legend + body), and footer with save/cancel buttons. Supports loading, submitting, dirty state.
- **Used by routes:** Not directly used by current route pages — available pattern
- **Duplicated?** No
- **States:** Normal, Loading, Submitting, Dirty, Errors

### DetailPanels
- **Path:** `src/modules/workspace/DetailPanels.tsx`
- **Type:** Server-compatible
- **Renders:** Two sub-components:
  - **FactPanel:** Section with heading and grid of label/value pairs. Shows "Not set" for null/undefined values.
  - **CompactList:** Section with header (title + count) and rows of linked/unlinked records. Shows "No imported records found here yet." when empty.
- **Used by routes:**
  - FactPanel: `/admin/companies/[id]` (Account), `/admin/transfers/[id]` (Transfer Run), `/candidate/invitations/[id]` (Invitation Brief), `/candidate/payments/[id]` (Payment Breakdown), `/candidate/work-logs/[id]` (Shift Record), `/company/companies/[id]` (Account), `/company/requests/[id]` (Request Brief), `/staff/interviews/[id]` (Interview Details), `/inspector/id-requests/[id]` (Batch)
  - CompactList: `/admin/companies/[id]` (Stores, Notes), `/admin/transfers/[id]` (Transfer File Entries), `/candidate/invitations/[id]` (Notes), `/candidate/payments/[id]` (Invoices), `/candidate/work-logs/[id]` (Appeals, Feedback), `/company/companies/[id]` (Stores, Notes), `/company/requests/[id]` (Interviews, Stories)
- **Duplicated?** No — single shared component
- **States:** Normal, Empty ("No imported records found here yet.")

### Skeletons
- **Path:** `src/modules/workspace/Skeletons.tsx`
- **Type:** Client component ("use client")
- **Renders:** Four skeleton variants:
  - **WorkspaceShellSkeleton** — Full-page placeholder matching WorkspaceShell with topbar, 4 metric cards, content area, and 2 data-list columns (8 rows each)
  - **DataTableSkeleton** — Table placeholder with header, search bar, filter bar, header row, and N data rows
  - **DetailPageSkeleton** — Detail placeholder with action bar, hero, fact panels, and related lists
  - **QuickSkeleton** — Lightweight pulse lines for Suspense fallbacks
- **Used by routes:**
  - WorkspaceShellSkeleton: `/admin/loading.tsx`, `/candidate/loading.tsx`, `/company/loading.tsx`, `/staff/loading.tsx`, `/inspector/loading.tsx`
  - DataTableSkeleton: Available for DataTablePage
  - DetailPageSkeleton: Available for DetailPage
- **Duplicated?** No

### SlidePanel
- **Path:** `src/modules/workspace/SlidePanel.tsx`
- **Type:** Client component ("use client")
- **Renders:** Slide-out sheet panel (wraps shadcn Sheet) with configurable side (right/top/bottom/left), title, description, eyebrow, body content, footer, close button. Includes `useSlidePanel()` hook and `SlidePanelTrigger` component.
- **Used by routes:** Not currently used by any route pages — available for modals
- **Duplicated?** No
- **States:** Open, Closed

### SearchInterface
- **Path:** `src/modules/workspace/SearchInterface.tsx`
- **Type:** Client component ("use client")
- **Renders:** Full search interface with input bar, quick filter chips, expandable advanced filters (select dropdowns), saved searches panel (expandable list with bookmark icons), and results count. Uses Input and Button from ui/.
- **Used by routes:** Not currently used by route pages — available for search
- **Duplicated?** No
- **States:** Default, Searching, Filter expanded, Saved expanded

### DashboardGrid
- **Path:** `src/modules/workspace/DashboardGrid.tsx`
- **Type:** Client component ("use client")
- **Renders:** Dashboard grid with stat cards (trend indicators up/down), chart card area, and activity feed (with empty state). Shows DashboardSkeleton when loading.
- **Used by routes:** Not used by current route pages — available pattern
- **Duplicated?** No
- **States:** Loading, Normal, Empty activity

---

## 4. CANDIDATE MODULE COMPONENTS

### CandidateProfile
- **Path:** `src/modules/candidates/CandidateProfile.tsx`
- **Type:** Server-compatible
- **Renders:** Full candidate readout: hero (avatar, name, status, company), action links, readiness score bar (0-100% with missing fields), fact grid (email, phone, country, university, company, store, rate, revenue, civil ID, updated), CivilID panel (expiry/warning/verification badges + photos), profile intro, skills/tags pills, timeline, education, experience, applications, interviews, invitations, work history, work logs (staff actions variant), notes, warnings, documents/links. Includes sub-components: Fact, CivilIdPanel, PanelHeader, RowsPanel, RowContent, WorkLogStaffPanel.
- **Used by routes:** `/candidate/page.tsx` (candidate's own profile), `/admin/candidates` + `/staff/candidates` (via CandidateSearchOS)
- **Duplicated?** No — shared by admin, staff, and candidate roles
- **States:** Empty (no candidate selected), Normal, Compact mode

### CandidateSearchOS
- **Path:** `src/modules/candidates/CandidateSearchOS.tsx`
- **Type:** Server-compatible (no "use client")
- **Renders:** Full candidate search workspace: topbar with branded link and search form (with hidden facet inputs), HubShortcuts command palette, theme toggle, account info. Scrollable candidate rows, faceted search filters (country, university, skills, gender, profile, assignment, document), selected candidates count, export CV form, and CandidateProfile detail pane with tabs for multiple candidates. Includes HiddenFacetInputs helper.
- **Used by routes:** `/admin/candidates/page.tsx` and `/staff/candidates/page.tsx`
- **Duplicated?** No — single component shared by admin + staff with role-param differences
- **States:** Normal, Empty results

### CandidateEditForm
- **Path:** `src/modules/candidates/CandidateEditForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Multi-section edit form with profile fields (name, email, phone, objective, intro, civil ID, birth date, address, country, university), bank info (bank, IBAN, account name), document uploads (photo, resume, video, civil ID photos), skills (add/remove), experience, certificates, education (university, degree, major, graduation year, studying), languages. Uses useActionState for form submission and sonner toast for feedback.
- **Used by routes:** `/candidate/edit/page.tsx`
- **Duplicated?** No
- **States:** Normal, Submitting, Error (toast)

### InvitationRespondForm
- **Path:** `src/modules/candidates/InvitationRespondForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Accept/Reject invitation form. Shows "Already accepted/rejected" notice if status is terminal. Renders action buttons with pending state.
- **Used by routes:** `/candidate/invitations/[id]/page.tsx`
- **Duplicated?** No
- **States:** Open (accept/reject buttons), Already responded (info notice), Pending, Error

### WorkLogAppealForm
- **Path:** `src/modules/candidates/WorkLogAppealForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Appeal form with textarea for reason, hidden workLogUuid, and submit button with pending state. Shows error on failure.
- **Used by routes:** `/candidate/work-logs/[id]/page.tsx`
- **Duplicated?** No
- **States:** Normal, Submitting, Error

### WorkLogStaffActions
- **Path:** `src/modules/candidates/WorkLogStaffActions.tsx`
- **Type:** Client component ("use client")
- **Renders:** Approve/Reject actions for work logs. Shows status badge if already approved (green) or rejected (red). In idle mode: Approve button + Reject button → toggles to reject form with reason input, Confirm and Cancel buttons. Uses useActionState with sonner toast.
- **Used by routes:** Embedded inside CandidateProfile (when viewerRole="staff")
- **Duplicated?** No
- **States:** Idle (approve/reject), Reject form open, Approved badge, Rejected badge, Pending

### ExportCVsForm
- **Path:** `src/modules/candidates/ExportCVsForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Simple form with hidden candidate IDs and "Export CVs" submit button. Used inside CandidateSearchOS.
- **Used by routes:** Embedded inside CandidateSearchOS
- **Duplicated?** No

### CandidateDetailRedirect
- **Path:** `src/modules/candidates/candidate-detail-redirect.tsx`
- **Type:** Server component
- **Renders:** Nothing — it's a redirect utility. Reads params, validates, redirects to `?candidate=N&tabs=N` format.
- **Used by routes:** `/admin/candidates/[id]` and `/staff/candidates/[id]` (both redirect)
- **Duplicated?** No — reusable utility

---

## 5. REQUEST MODULE COMPONENTS

### RequestFulfillmentOS
- **Path:** `src/modules/requests/RequestFulfillmentOS.tsx`
- **Type:** Server-compatible
- **Renders:** Full request detail/fulfillment desk with hero (title, summary, skills badges, company, status, seats), action bar (Find candidates, Draft employer email, Review suggestions links), pipeline stage nav, and card-based pipeline sections:
  - **Matches:** Search-led candidate shortlist with signal, reasons (badges), country/university/rate badges, SuggestForm + InviteForm actions, "Open full profile" link
  - **Suggestions:** Employer-ready candidate rows
  - **Invitations:** Candidate outreach with InvitationStatusActions
  - **Applications:** Inbound with ApplicationStatusActions
  - **Interviews:** Evaluation with InterviewStatusActions
  - **Stories:** Work trail with story create form + StoryStatusActions
  Uses sub-component `RequestRows` for rendering rows with empty state.
- **Used by routes:** `/admin/requests/[id]/page.tsx` (role="admin"), `/staff/requests/[id]/page.tsx` (role="staff")
- **Duplicated?** No — shared by admin + staff
- **States:** Normal, Empty sections ("No imported rows here yet.")

### RequestActionBar
- **Path:** `src/modules/requests/RequestActionBar.tsx`
- **Type:** Client component ("use client")
- **Renders:** Card with request management actions: status transition dropdown (pending/started/delivered/cancelled/finished/re-work), update title/seats form, assign staff form (admin-only). Uses Card, Button, Input from ui/.
- **Used by routes:** `/admin/requests/[id]/page.tsx` and `/staff/requests/[id]/page.tsx`
- **Duplicated?** No — shared by admin + staff

### RequestCreateForm
- **Path:** `src/modules/requests/RequestCreateForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Full create request form: company select, position title, job description textarea, compensation, number of employees, location, additional info, skills (comma-separated), priority dropdown. Uses Card, Button, Input from ui/.
- **Used by routes:** Not currently used by any route page (RequestCreateForm is available but CompanyRequestCreateForm is used instead)
- **Duplicated?** Yes — similar to CompanyRequestCreateForm
- **States:** Normal

### CompanyRequestCreateForm
- **Path:** `src/modules/requests/CompanyRequestCreateForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Company-facing create request form: company select, job title, compensation type, store, brand, vacancy count. Shows field-level error messages. Redirects to request detail on success. Uses Card, Button, Input from ui/.
- **Used by routes:** `/company/requests/create/page.tsx`
- **Duplicated?** Yes — similar to RequestCreateForm but lighter (company role)
- **States:** Normal, Submitting ("Creating..."), Validation errors (fieldError), Server errors

### MatchActions
- **Path:** `src/modules/requests/MatchActions.tsx`
- **Type:** Client component ("use client")
- **Renders:** Two sub-components:
  - **SuggestForm:** Hidden request+ candidate IDs, reason input + "Suggest" button (Send icon)
  - **InviteForm:** Hidden request + candidate IDs + optional suggestion UUID, "Invite" button (UserPlus icon)
- **Used by routes:** Embedded inside RequestFulfillmentOS (Matches section)
- **Duplicated?** No

### StageActions
- **Path:** `src/modules/requests/StageActions.tsx`
- **Type:** Client component ("use client")
- **Renders:** Four action sub-components with togglable note textareas:
  - **ApplicationStatusActions:** Shortlist (with optional note) + Reject buttons
  - **InterviewStatusActions:** Complete (with optional outcome note) + Cancel buttons
  - **InvitationStatusActions:** Responded + Declined buttons
  - **StoryStatusActions:** Complete + Cancel buttons
  Uses Check, MessageSquare, ThumbsDown, X icons. Hides buttons based on current status (non-idempotent transitions).
- **Used by routes:** Embedded inside RequestFulfillmentOS pipeline cards
- **Duplicated?** No

---

## 6. COMPANY MODULE COMPONENTS

### AddContactForm
- **Path:** `src/modules/company/AddContactForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Compact form with company select, name, email, position, phone inputs, allow-access checkbox, and "Add Contact" button. Uses useActionState with error display.
- **Used by routes:** `/company/contacts/page.tsx`
- **Duplicated?** No
- **States:** Normal, Submitting ("Adding..."), Error

### RemoveContactButton
- **Path:** `src/modules/company/RemoveContactButton.tsx`
- **Type:** Client component ("use client")
- **Renders:** Inline form with hidden contact UUID, styled danger-link "Remove" button with confirm dialog. Shows "Removing..." when pending.
- **Used by routes:** `/company/contacts/page.tsx` (inside DataTable actions column)
- **Duplicated?** No
- **States:** Idle, Pending

### AddStoreForm
- **Path:** `src/modules/company/AddStoreForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Compact form with company select, store name, location, mall select, brand select, and "Add Store" button. Uses useActionState with error display.
- **Used by routes:** `/company/stores/page.tsx`
- **Duplicated?** No
- **States:** Normal, Submitting ("Adding..."), Error

### RemoveStoreButton
- **Path:** `src/modules/company/RemoveStoreButton.tsx`
- **Type:** Client component ("use client")
- **Renders:** Inline form with hidden store ID, styled danger-link "Remove" button with confirm dialog. Shows "Removing..." when pending.
- **Used by routes:** `/company/stores/page.tsx` (inside DataTable actions column)
- **Duplicated?** No
- **States:** Idle, Pending

---

## 7. FINANCE MODULE COMPONENTS

### TransferActionBar
- **Path:** `src/modules/finance/TransferActionBar.tsx`
- **Type:** Client component ("use client")
- **Renders:** Transfer run action panel with: Lock/Unlock toggle, PaymentReceivedForm (date input + button), Delete button, and CandidatePayouts card with per-candidate Mark paid/unpaid toggle. Uses Card, Button, Input from ui/ and Lucide icons.
- **Used by routes:** `/admin/transfers/[id]/page.tsx`
- **Duplicated?** No
- **States:** Normal, Locked vs unlocked, Paid vs unpaid

---

## 8. AUTH MODULE COMPONENTS

### LoginForm
- **Path:** `src/modules/auth/LoginForm.tsx`
- **Type:** Client component ("use client")
- **Renders:** Sign-in form with email input (Label + Input), password input, styled submit button (LogIn icon), and error display. Below the form, VerifiedAccountChooser shows multiple matched accounts as selectable buttons. Uses useActionState.
- **Used by routes:** `/login/page.tsx`
- **Duplicated?** No
- **States:** Idle, Checking credentials (pending), Error, Multiple accounts (VerifiedAccountChooser)

---

## 9. THEME COMPONENTS

### ThemeToggle
- **Path:** `src/modules/theme/ThemeToggle.tsx`
- **Type:** Client component ("use client")
- **Renders:** Toggle button (Moon/Sun icons) that swaps data-theme attribute and persists to localStorage. Used in landing, login, workspace navigation, and all authenticated layouts.
- **Used by routes:** All routes — root layout, landing page, login page, every authenticated layout
- **Duplicated?** No — but rendered in multiple places (sidebar footer, public nav)
- **States:** Light mode, Dark mode

### ThemeScript
- **Path:** `src/modules/theme/ThemeScript.tsx`
- **Type:** Server component
- **Renders:** Inline `<script>` that reads localStorage theme (or prefers-color-scheme) and applies data-theme before React hydration to prevent flash.
- **Used by routes:** Root layout (`/layout.tsx`)
- **Duplicated?** No

---

## 10. HUB/COMMAND MODULE COMPONENTS

### HubContent
- **Path:** `src/modules/hub/HubContent.tsx`
- **Type:** Client component ("use client")
- **Renders:** Main app/hub page showing role-based guide (journey cards with steps and action links), priority queues (cards with counts and tones), system stats, search results, navigation items, scopes list, record preview with facts/actions/related rows, and HubShortcuts command palette.
- **Used by routes:** `/app/page.tsx`
- **Duplicated?** No
- **States:** Normal, Empty queues/results, Preview open

### HubShortcuts
- **Path:** `src/modules/hub/HubShortcuts.tsx`
- **Type:** Client component ("use client")
- **Renders:** Command palette triggered by keyboard shortcuts (Cmd+K, ?, G-then-key chords). Shows filtered/sectioned command list with keyboard navigation. Uses global keydown listener with sequence buffer.
- **Used by routes:** Embedded inside HubContent and CandidateSearchOS
- **Duplicated?** No — reused by HubContent and CandidateSearchOS
- **States:** Closed, Open with query, Open filtered

---

## 11. SHARED UI PRIMITIVES (shadcn/ui)

All located in `src/components/ui/` — Radix-based primitives used across the app:

| Component | File | Purpose |
|-----------|------|---------|
| **Accordion** | `src/components/ui/accordion.tsx` | Collapsible sections |
| **AlertDialog** | `src/components/ui/alert-dialog.tsx` | Confirmation modals |
| **Alert** | `src/components/ui/alert.tsx` | Inline alert messages |
| **Badge** | `src/components/ui/badge.tsx` | Status/skill tags (used in RequestFulfillmentOS) |
| **Button** | `src/components/ui/button.tsx` | All buttons app-wide |
| **Card** | `src/components/ui/card.tsx` | Card containers (landing, request actions, forms) |
| **Checkbox** | `src/components/ui/checkbox.tsx` | Form checkboxes |
| **Command** | `src/components/ui/command.tsx` | Command palette primitives |
| **Dialog** | `src/components/ui/dialog.tsx` | Modal dialogs |
| **DropdownMenu** | `src/components/ui/dropdown-menu.tsx` | Dropdown menus |
| **Form** | `src/components/ui/form.tsx` | Form field wrappers |
| **Input** | `src/components/ui/input.tsx` | Text inputs (search bars, forms, edit fields) |
| **Label** | `src/components/ui/label.tsx` | Form labels |
| **Popover** | `src/components/ui/popover.tsx` | Popover overlays |
| **Progress** | `src/components/ui/progress.tsx` | Progress bars |
| **RadioGroup** | `src/components/ui/radio-group.tsx` | Radio button groups |
| **ScrollArea** | `src/components/ui/scroll-area.tsx` | Scrollable containers |
| **Select** | `src/components/ui/select.tsx` | Native select dropdowns |
| **Separator** | `src/components/ui/separator.tsx` | Visual separators |
| **Sheet** | `src/components/ui/sheet.tsx` | Slide-out panels (used by SlidePanel) |
| **Skeleton** | `src/components/ui/skeleton.tsx` | Loading placeholders (used by Skeletons) |
| **Sonner** | `src/components/ui/sonner.tsx` | Toast notifications (Toaster) |
| **Table** | `src/components/ui/table.tsx` | HTML table primitives |
| **Tabs** | `src/components/ui/tabs.tsx` | Tab panels |
| **Textarea** | `src/components/ui/textarea.tsx` | Multi-line text inputs |
| **Tooltip** | `src/components/ui/tooltip.tsx` | Tooltip provider (root layout) |

---

## 12. APP-LEVEL COMPONENTS

### RootLayout
- **Path:** `src/app/layout.tsx`
- **Renders:** HTML shell with ThemeScript, TooltipProvider, Suspense-wrapped NoticeToast, and Toaster (sonner). Styles imported from `./styles.css`.

### NoticeToast
- **Path:** `src/modules/workspace/NoticeToast.tsx`
- **Type:** Client component ("use client")
- **Renders:** Null (side-effect only). Reads `?notice=` from searchParams, looks up catalog, fires appropriate sonner toast (success/error/info/default).
- **Used by routes:** Root layout (always mounted under Suspense)
- **Duplicated?** No
- **States:** Fires toast or renders null

### ErrorPage
- **Path:** `src/app/error.tsx`
- **Type:** Client component ("use client")
- **Renders:** Error boundary page with message, error digest, and "Try again" button.
- **Used by routes:** Global error boundary

### Loading (various)
- **Paths:** `src/app/admin/loading.tsx`, `src/app/candidate/loading.tsx`, `src/app/company/loading.tsx`, `src/app/staff/loading.tsx`, `src/app/inspector/loading.tsx`
- **Renders:** All render `WorkspaceShellSkeleton` from Skeletons.tsx
- **Duplicated?** Yes — identical across 5 role routes

### App Layout
- **Path:** `src/app/app/layout.tsx`
- **Renders:** Wraps children in WorkspaceOS for the `/app/*` hub route.

### Dashboard
- **Path:** `src/modules/dashboard/Dashboard.tsx`
- **Type:** Server component (async)
- **Renders:** Admin dashboard with health metrics, migration strategy section, status mix, "Next Slices" list, and four DataList sections (Recent Candidates, Companies, Requests, Transfers). Includes internal `DataList` sub-component for list rendering.
- **Used by routes:** `/admin/page.tsx`
- **Duplicated?** No

### StaffHome
- **Path:** `src/modules/staff/StaffHome.tsx`
- **Type:** Server-compatible
- **Renders:** Staff landing page with hero (search + open requests links, production stats), workflow grid (4 cards: Find candidates, Work requests, Time and pay, Documents), and two StaffRows panels (Recent requests, Recent stories). Uses ArrowRight, BriefcaseBusiness, Clock3, FileText, Search, Users icons.
- **Used by routes:** `/staff/page.tsx`
- **Duplicated?** No

### StaffCandidateConsole
- **Path:** `src/modules/workspace/StaffCandidateConsole.tsx`
- **Type:** Server-compatible
- **Renders:** Full staff candidate desk with search, workflow dock, filter navigation, kanban-style lanes with CandidateQueueCard components, candidate preview panel (header, actions, flags, facts, next actions, related records), recent activity panel, and production estate stats. Includes CandidateQueueCard, RecordSection, Fact sub-components.
- **Used by routes:** Not currently used by any current route page — available for staff candidate desk
- **Duplicated?** No
- **States:** Normal, Empty lanes, Empty preview, No candidate selected

---

## 13. ROUTE-SPECIALIZED COMPONENTS (no shared module)

### IdRequestActions (Inspector)
- **Path:** `src/app/inspector/id-requests/[id]/IdRequestActions.tsx`
- **Type:** Client component ("use client")
- **Renders:** ID request approval/rejection with confirm dialog, expandable rejection reason textarea. Uses approveIdRequest/rejectIdRequest server actions. Hides when status !== "pending".
- **Used by routes:** `/inspector/id-requests/[id]/page.tsx`
- **Duplicated?** No (route-local component)
- **States:** Pending (approve/reject visible), Non-pending (hidden), Reject form expanded

---

## SUMMARY: COMPONENTS DUPLICATED ACROSS ROUTES

The app is well-structured with minimal duplication. Only the following are duplicated:

1. **Loading skeletons** — All 5 role routes (admin, candidate, company, staff, inspector) each have `loading.tsx` that renders the same `WorkspaceShellSkeleton` — this is correct Next.js pattern, not true duplication.

2. **RequestCreateForm vs CompanyRequestCreateForm** — Two similar but distinct create-request forms (admin/staff vs company). Could be unified but the forms differ in detail level and redirect behavior.

3. **CandidateSearchOS** — Shared by admin and staff (single component, different basePath and role params).

## COMPONENT COUNT

- **Module/feature components:** 41
- **UI primitive components (shadcn/ui):** 27
- **Route-specialized components:** 1 (IdRequestActions)
- **Page-level wrapper components (pages/layouts):** 54 page files
- **Total unique components cataloged:** ~69 component files
