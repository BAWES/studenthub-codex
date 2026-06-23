# Phase 0 Component Audit — Complete

**Agent:** UXDesigner (738c96d4)
**Date:** 2026-06-09

## 1. Component Inventory

### Shared UI Components (27 primitives at `src/components/ui/`)
button, badge, card, table, tabs, input, select, checkbox, radio-group, textarea, dialog, alert-dialog, sheet, dropdown-menu, popover, tooltip, accordion, progress, skeleton, separator, scroll-area, form, label, command, sonner, alert

### Workspace Shell Components (7 at `src/modules/workspace/`)
| Component | File | Role |
|-----------|------|------|
| WorkspaceOS | `WorkspaceOS.tsx` | Outer shell with sidebar rail + command palette (⌘K) |
| WorkspaceShell | `WorkspaceShell.tsx` | Inner page shell with eyebrow/title/metrics |
| RoleLayoutShell | `RoleLayoutShell.tsx` | Role header with Lucide icon + Breadcrumbs |
| WorkspaceNavigation | `WorkspaceNavigation.tsx` | Sidebar nav items per role |
| Breadcrumbs | `Breadcrumbs.tsx` | Auto-generated breadcrumb trail |
| SearchInterface | `SearchInterface.tsx` | Workspace-wide search |
| DataTable | `DataTable.tsx` | Generic render-props table with empty state |

### Detail Components (3 at `src/modules/workspace/`)
| Component | File | Role |
|-----------|------|------|
| FactPanel | `DetailPanels.tsx` | Label/value grid for detail pages |
| CompactList | `DetailPanels.tsx` | Compact linked list for side panels |
| DetailPage / FormPage / DataTablePage | separate files | Page-level layout templates |

### Role-Specific Page Components
| Role | Key Components | Custom Forms |
|------|---------------|-------------|
| Admin | Dashboard, CandidateSearchOS, DataTable (requests/companies/transfers) | — |
| Staff | CandidateSearchOS, DataTable (requests), FactPanel (interviews) | — |
| Candidate | CandidateProfile, DataTable (invitations/work-logs/payments) | — |
| Company | DataTable (requests/companies/stores/contacts) | AddStoreForm, RemoveStoreButton, AddContactForm, RemoveContactButton |
| Inspector | DataTable (id-requests) | — |

### Auth Gates per Route
| Role | Layout Gate | Capabilities |
|------|------------|-------------|
| Admin | admin.system | candidate.search, request.read.any, company.read.any, finance.read |
| Staff | request.read.assigned | candidate.search, request.interview |
| Candidate | candidate.read.own | (self profile) |
| Company | company.read.linked | (linked companies) |
| Inspector | id_review.read | — |

## 2. Navigation Structure
All roles share `/app` as first nav item. Role-specific trees:
- Admin: /admin → /admin/candidates → /admin/companies → /admin/requests → /admin/transfers
- Staff: /staff → /staff/requests → /staff/candidates → /staff/interviews/[id]
- Candidate: /candidate → /candidate/invitations → /candidate/work-logs → /candidate/payments → /candidate/edit
- Company: /company → /company/requests → /company/companies → /company/contacts → /company/stores
- Inspector: /inspector → /inspector/id-requests

## 3. Duplication Analysis
LOW duplication at component level. Same WorkspaceShell + DataTable pattern across ALL roles.
CandidateSearchOS shared between admin and staff.
Duplication is in PAGE STRUCTURE (identical server component pattern, different data fetchers).
Company has richest custom form components (stores + contacts CRUD).

## 4. Missing Components
- loading.tsx only for candidate route
- Empty state text hardcoded per DataTable — not centralized
- No design token system documented (colors defined per-use in Tailwind classes)
- No centralized status badge component
- No error boundary pattern
- No skeleton/shimmer for card lists

## 5. Visual Observations (from browser audit)
- Dark/light mode toggle works across all routes
- Admin dashboard shows live metrics: 46,240 waiting, 2,570 requests, 4,369 transfers, 0 ID batches
- Candidate search supports rich filters: gender, country, university, skill, document status
- DataTable has consistent header/body/pagination pattern across roles
- Command palette (⌘K) with role-specific keyboard shortcuts (G C, G R, G T)

## Next Deliverables
1. Design Tokens document (colors, spacing, typography, radii, shadows, animations)
2. Shared Component Blueprint (StatusBadge, ActionButton, CandidateCard, RequestCard with role-scoping props)
3. UX Flow Maps per role journey
4. Child issues for CTO implementation
