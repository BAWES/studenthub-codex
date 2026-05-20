# StudentHub Next — Agent Collaboration Guide

> **Purpose:** This document is the canonical reference for any agent or developer working on the StudentHub Next rebuild. Update it whenever architecture, conventions, or status changes.

## Architecture

```
studenthub-next/
  src/
    app/                    # Next.js 15 App Router pages
      layout.tsx            # Root layout (theme, fonts)
      page.tsx              # Landing → redirect to /app
      styles.css            # Global CSS (being refactored to Tailwind)
      login/                # Unified login (email + password + auto-detect role)
      app/                  # Legacy hub redirect
      hub/                  # Workspace hub (Cmd+K, scope-based navigation)
      admin/                # Admin portal (candidates, companies, requests, transfers)
      staff/                # Staff portal (candidates, requests)
      candidate/            # Candidate portal (invitations, work-logs)
      company/              # Company portal (accounts, requests)
      inspector/            # Inspector portal (ID requests)
      error.tsx             # Global error boundary
      not-found.tsx         # 404 page
      loading.tsx           # Global loading state
      middleware.ts          # Auth gate + security headers
    modules/                # Feature modules (domain logic, zero Next.js deps)
      auth/                 # Auth (session, login, password, capabilities)
      candidates/           # Candidate search, profile
      requests/             # Request fulfillment, suggestion, create-actions
      workspace/            # Shell, navigation, data queries, tables, panels
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

### 4. Workspace Shell Pattern
- `WorkspaceShell` is the main layout: sidebar + topbar + metrics + panels
- Every role page wraps content in WorkspaceShell
- Navigation items per role defined in `src/modules/workspace/navigation.ts`

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

### In Progress
- Design system expansion (toast, dialog, dropdown, tabs, skeleton, etc.)
- Unified workspace UX (one-app feel, slide-in panels)
- Toast notifications replacing URL-param notices
- Skeleton loading states
- CSS refactor (Tailwind-first)

### Known Gaps
- No file upload/storage (S3/Cloudinary integration needed)
- No PDF/document generation (CV exports, invoices, ID cards)
- No Meilisearch MySQL fallback (search requires Meilisearch running)
- No real-time features (WebSocket/SSE)
- No i18n (Arabic fields exist in DB)
- No E2E tests (only smoke + validation)
- No CI/CD (GitHub Actions needed)

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
