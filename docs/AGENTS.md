# StudentHub Next — Agent Collaboration Guide

> **Purpose:** This document is the canonical reference for any agent or developer working on the StudentHub Next rebuild. Update it whenever architecture, conventions, or status changes.

## Architecture

```
studenthub-next/
  src/
    app/                    # Next.js 15 App Router pages
      layout.tsx            # Root layout (ThemeScript, TooltipProvider, Toaster, NoticeToast)
      page.tsx              # Landing → redirect to /app
      styles.css            # Global CSS (+ component CSS)
      login/                # Unified login (email + password + auto-detect role)
      app/                  # Legacy hub redirect
      hub/                  # Workspace hub (standalone commandOS shell)
      admin/
        layout.tsx          # WorkspaceOS shell — persistent across admin navigation
        loading.tsx         # Skeleton during route transitions
        page.tsx            # Dashboard + FeatureGrid
        candidates/         # Candidate search (shared with staff)
        companies/          # Company list + detail
        requests/           # Request list + detail + actions
        transfers/          # Transfer list + detail + actions
      staff/
        layout.tsx          # WorkspaceOS shell
        loading.tsx         # Skeleton during route transitions
        page.tsx            # StaffHome
        candidates/         # Candidate search (staff-scoped kanban)
        requests/           # Request list + detail
      candidate/
        layout.tsx          # WorkspaceOS shell
        loading.tsx         # Skeleton during route transitions
        page.tsx            # Own profile
        invitations/        # Invitation list + detail
        work-logs/          # Work log list + detail
      company/
        layout.tsx          # WorkspaceOS shell
        loading.tsx         # Skeleton during route transitions
        page.tsx            # Overview + linked companies
        companies/          # Linked company list + detail
        requests/           # Request list + detail
      inspector/
        layout.tsx          # WorkspaceOS shell
        loading.tsx         # Skeleton during route transitions
        page.tsx            # Overview + ID requests
        id-requests/        # ID request list + detail
      error.tsx             # Global error boundary
      not-found.tsx         # 404 page
      loading.tsx           # Global loading state (spinner)
      middleware.ts          # Auth gate + security headers
    modules/                # Feature modules (domain logic, zero Next.js deps)
      auth/                 # Auth (session, login, password, capabilities)
      candidates/           # Candidate search, profile
      requests/             # Request fulfillment, suggestion, create-actions
      workspace/            # Shell, navigation, data queries, tables, panels, skeletons
        WorkspaceOS.tsx     # Unified OS shell: sidebar + Cmd+K + keyboard shortcuts
        WorkspaceOSContext.tsx # Context for embedded shell detection
        WorkspaceShell.tsx  # Context-aware: skips rail when inside WorkspaceOS layout
        Skeletons.tsx       # Reusable skeleton components for loading states
      finance/              # Transfer/payment actions, UI
      dashboard/            # Dashboard data, shortcuts
      theme/                # Dark/light mode toggle
      hub/                  # Command palette, keyboard shortcuts
      staff/                # Staff-specific workspace
    components/ui/          # shadcn/ui primitives
    lib/                    # Prisma client, cn() utility
  prisma/schema.prisma      # 128-model schema (introspected from prod MySQL)
  scripts/                  # Dev tooling
    validate.mjs            # 63-test automated validation suite
    smoke-test.mjs          # Route smoke tests
    import-prod-local-db.sh # Import production DB clone
    index-candidates-meilisearch.mjs  # Search indexing
  docs/AGENTS.md            # This file
```

## Key Patterns

### 1. Server Actions (mutations)
All write operations use `"use server"` functions accepting `FormData`:
```ts
"use server";
export async function someAction(formData: FormData) {
  const session = await requireCapability("capability.string");
  // validate, write, revalidatePath, redirect
}
```
- Capability check is the first line → no check means no access
- Use `revalidatePath()` to bust Next.js cache after writes
- Use `redirect()` with notice params for feedback (being replaced by toasts)

### 2. Auth Model
- Custom HMAC-signed cookies (`studenthub_next_session`)
- Unified login: one email can have multiple roles → account chooser
- Legacy Yii2 bcrypt password verification (`$2y$` prefix normalization)
- `requireCapability(cap)` / `requireRoleCapability(role, cap)` for access control
- All capabilities defined in `src/modules/auth/capabilities.ts`

### 3. Data Layer
- All DB queries in `src/modules/workspace/data.ts` (2,149 lines)
- Each function returns typed objects consumed by pages and components
- Single Prisma client (`src/lib/prisma.ts`)
- MySQL 8.4 via Docker Compose (port 3307)

### 4. Workspace Shell Pattern (updated)

**Two-tier shell architecture:**

1. **WorkspaceOS** (`src/modules/workspace/WorkspaceOS.tsx`) — the outer shell provided by per-role layouts:
   - Persistent sidebar rail (236px, sticky) — does NOT remount on page navigation
   - Global Cmd+K command palette (search views, navigate, see shortcuts)
   - Global keyboard shortcuts:
     - `Cmd+K` / `?` → command palette
     - `G` then `H`/`R`/`C`/`T`/`O` → go to hub/requests/candidates/transfers/companies
     - `/` → focus workspace search
     - `j` / `k` → navigate rows (vim-style)
     - `Escape` → close palette
   - Sets `WorkspaceOSContext` with `{ embedded: true, session }`
   - Renders `<main class="shell">` with rail + `<section class="workspaceStage">{children}</section>`

2. **WorkspaceShell** (`src/modules/workspace/WorkspaceShell.tsx`) — the inner content wrapper:
   - When **embedded** (inside WorkspaceOS layout): renders only the content area (stage with topbar, metrics, children, lists). Uses `.shellEmbedded` class (display: block).
   - When **standalone** (hub/app pages): renders the full shell including its own rail.
   - Detection via `useWorkspaceOS()` context hook.
   - **Zero page changes needed** — existing pages rendered seamlessly.

**Per-role layouts** (e.g., `app/admin/layout.tsx`):
- Server components that call `requireRoleCapability()` for auth
- Render `<WorkspaceOS session={session}>{children}</WorkspaceOS>`
- Sidebar persists across all pages under that role
- Skeleton loading states automatically via `loading.tsx` in each role directory

### 5. Component Categories
- **Pages** (`src/app/**/page.tsx`): Server components, fetch data, render shell
- **Modules** (`src/modules/**`): Business logic, reusable UI, server actions
- **UI Primitives** (`src/components/ui/**`): shadcn/ui design system

## Database
- **128 tables** (full legacy parity)
- Key entities: candidate, company, request, transfer, invoice, staff, admin, inspector
- Soft deletes via `deleted = 0/1` pattern
- Status fields use integer codes (10, 20) or Prisma enums
- All UUIDs are prefixed (e.g., `request_`, `suggestion_`, `note_`)

## Current State (2025-05-21)

### Working
- Unified auth with legacy password verification
- Read paths for all 5 roles (35 routes)
- Candidate search with facets, filters, tabs
- Request fulfillment desk (suggestions, pipeline)
- Staff console (kanban lanes)
- **8 mutation server actions** (finance: 4, requests: 4)
- **Middleware** (route protection + security headers)
- **Error boundaries** (error.tsx, not-found.tsx, loading.tsx)
- **Validation suite** (63 automated tests)
- **Global toast notifications** (NoticeToast + sonner, 16 notice types)
- **Per-role WorkspaceOS layouts** (persistent sidebar, zero page changes)
- **Global Cmd+K command palette** (search views, keyboard navigation)
- **Power-user keyboard shortcuts** (G+chords, j/k rows, / search focus)
- **Skeleton loading states** (per-role loading.tsx + reusable Skeletons component)
- **11 shadcn/ui components** (command, dialog, dropdown-menu, select, separator, sheet, skeleton, sonner, tabs, tooltip)
- **CI/CD pipeline** (GitHub Actions: typescript, build, lint, validate)
- **PR workflow** (template, CodeRabbit auto-review, CODEOWNERS)
- **Agent collaboration doc** (this file + architecture patterns)

### In Progress
- CSS refactor (Tailwind-first component styles)
- Slide-in panel system for detail views (shadcn Sheet)
- One-command local test flow

### Known Gaps
- No file upload/storage (S3/Cloudinary integration needed)
- No PDF/document generation (CV exports, invoices, ID cards)
- No Meilisearch MySQL fallback (search requires Meilisearch running)
- No real-time features (WebSocket/SSE)
- No i18n (Arabic fields exist in DB)
- No E2E tests (only smoke + validation)

## UX Principles
- **Operating system feel:** One unified shell, panels slide in, never leave the workspace
- **Command-first:** Cmd+K for everything, keyboard shortcuts for power users
- **Data-dense but clean:** Like Attio CRM — packed with info, never cluttered
- **Linear-speed:** Actions happen instantly, toasts confirm, no page reloads

## Pull Request Workflow

All changes go through PRs against `main`. The CI pipeline runs automatically.

### CI Pipeline (`.github/workflows/ci.yml`)

| Job | What it checks | Triggers |
|-----|---------------|----------|
| `typescript` | `npx tsc --noEmit` | Every PR + push to main |
| `build` | `npx next build` | Every PR + push to main |
| `lint` | `npm run lint` | Every PR + push to main |
| `validate` | Spins up MySQL, starts dev server, runs `scripts/validate.mjs` | Every PR + push to main |

### CodeRabbit
- Auto-reviews every PR with a summary and per-file comments
- Configured in `.coderabbit.yaml` (chill profile, no change requests)
- Ignores SQL dumps, keystores, and build artifacts

### PR Template
Every PR uses `.github/pull_request_template.md` with:
- Summary and change list
- Type classification (feature/bug/refactor/docs/CI/design)
- Checklist (TypeScript, build, validation, no secrets, capability checks)
- Test plan
- AI attribution notice

### Creating a PR
```bash
# 1. Run checks locally
npx tsc --noEmit && npx next build && node scripts/validate.mjs

# 2. Create branch and push
git checkout -b feature/your-change
git add .
git commit -m "Description of changes"
git push -u origin feature/your-change

# 3. Create PR via GitHub CLI
gh pr create --title "..." --body "..."

# 4. CodeRabbit auto-reviews, CI runs automatically
```

## Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npx tsc --noEmit         # TypeScript check
node scripts/validate.mjs  # 63-test validation suite
node scripts/smoke-test.mjs # Route smoke tests
npm run db:import-prod-local  # Import production DB clone
```

## Agent Rules
1. **Never use `git` without explicit user request** — only commit/push when asked
2. **Always run `npx tsc --noEmit` after changes** — type safety is non-negotiable
3. **Always run `scripts/validate.mjs` after changes** — it catches regressions
4. **Use server actions for mutations** — never `fetch()` to API routes
5. **Use Prisma types** — never raw SQL unless unavoidable
6. **Capability-check first** — every server action starts with `requireCapability`
7. **Revalidate paths after writes** — `cache: "no-store"` on pages is not enough
8. **Update this doc** — when architecture, patterns, or status changes

## Testing with Production DB
```bash
# 1. Ensure the prod SQL dump exists at ../StudentHub Backup.sql
ls "../StudentHub Backup.sql"

# 2. Start Docker and import
docker compose up -d
bash scripts/import-prod-local-db.sh

# 3. Generate Prisma client
npx prisma generate

# 4. Start dev server and validate
npm run dev &
node scripts/validate.mjs
```
