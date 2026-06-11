# StudentHub Next — Project Conventions

## 📐 Design System (MANDATORY)

Read `DESIGN_SYSTEM.md` in the project root before doing any design or UI work. Key rules:

- **Zendesk coral `#eb6651`** is the primary accent color — use it for CTAs, badges, links
- **CSS variables only** — never hardcode hex values that should theme-switch. Use `var(--ink)`, `var(--surface)`, `var(--border)`, etc.
- **Closable tabs** — the workspace UI must support closable, reorderable tabs (like VS Code / Chrome). See DESIGN_SYSTEM.md §4
- **Smooth animations** — use `--dur-fast` (120ms) to `--dur-modal` (300ms) timing tokens
- **No bounce** animations in production UI
- **Landing page is frozen** — do NOT modify `src/app/LandingContent.tsx`

## 🧠 Dosu Knowledge (MANDATORY)

StudentHub has **Dosu MCP** connected for project knowledge. Before designing or implementing:

1. If you lack context about the business model, workflow, or codebase, query Dosu first
2. Dosu is connected via Hermes native MCP: `mcp_dosu_ask`, `mcp_dosu_init_knowledge`, `mcp_dosu_search_documentation`
3. The production MySQL DB (53K candidates, 524 companies, 162 staff) is available on port 3307 for validating understanding

## Business Model (Quick Reference)

- **Staff recruiters drive matching** — not a self-serve job board. Staff invite candidates to opportunities (22,789 invitations served)
- **Contract types**: hourly (with margin), fixed-price, monthly salary, fulltimer
- **Flow**: Company request → Staff recruit → Invite candidates → Interview → Contract → Timesheets → Invoice → Payment
- **Roles**: candidate, company, staff, admin, inspector

## Branch Strategy

- `main` — production-ready releases only. Merged from `develop` via release PRs.
- `develop` — integration branch. All feature/fix/chore branches merge here via PR.
- Feature branches: `feature/STU-N-short-description` (e.g. `feature/STU-5-auth`) — created off `develop`
- Bug fix branches: `fix/STU-N-short-description` — created off `develop`
- Chore branches: `chore/STU-N-short-description` — created off `develop`
- Release branches: `release/X.Y.Z` — created off `develop`, merged to `main`
- All branches (except `main` and `develop`) are merged via pull request

## Git Anti-Patterns (PROHIBITED)

These rules exist because process violations on STU-146/STU-150 lost coder work.

- **Never cherry-pick.** Cherry-picking between branches severs the issue-to-commit audit trail and creates duplicate commits. If you need work from another branch, merge it or open a PR.
- **Never `git reset` on a branch with multiple authors' commits.** Resets silently drop work. If a branch needs to go a different direction, create a new branch from the correct base.
- **Push at the end of every heartbeat.** No local-only branches survive past the session.
- **Never commit directly to `main`.** Every commit lives on a feature/fix/chore branch. If you find uncommitted changes on main, stash them with a descriptive name, create a branch, and apply them.
- **Before deleting a local branch**, verify it has been merged via PR or pushed to `origin`.
- **Clean stashes weekly.** Stashes older than 7 days without a corresponding branch should be either committed to a branch or dropped.
- **One branch = one issue = one PR.** Do not piggyback unrelated fixes onto a feature branch. Create a separate fix branch.
- **Recovery before cleanup.** Before any destructive git operation (reset, rebase, branch delete), tag orphaned commits for recovery so work can be reconstructed.

## Commit Conventions

Use [conventional commits](https://www.conventionalcommits.org/):

```
feat: add login flow with JWT session management
fix: correct role check in middleware for inspector routes
chore: update Prisma schema with new migration
docs: add API route documentation for auth endpoints
test: add validation tests for login form edge cases
```

Format: `<type>: <present-tense description>`

Do not commit directly to `main`. Every change goes through a PR.

## Pull Request Process

1. Create a feature branch from `develop`
2. Commit changes with conventional commit messages
3. **Run the pre-push gate BEFORE pushing** (see CI/CD Enforcement below)
4. Push the branch to `origin`
5. Create a PR **against `develop`** with a clear title and description
6. Request review from at least one team member
7. Merge only after approval and passing checks
8. For releases: create a PR from `develop` to `main`

PR titles follow: `[STU-N] Short description of change`

## TDD Enforcement

**Test-driven development is mandatory.** Before writing implementation code:

1. Write the test first (RED)
2. Write the minimum code to make it pass (GREEN)
3. Refactor while keeping tests green (REFACTOR)

```
npm run test:unit     # vitest — run before every commit
```

## CI/CD Enforcement (CRITICAL — read before pushing)

**Every branch pushed to origin must pass the full CI pipeline.** Pushing code that fails CI wastes reviewer time and blocks the board. These checks run on every PR and must be verified locally before pushing:

```bash
# 0. Unit tests (TDD) — all must pass
npm run test:unit

# 1. TypeScript — zero errors required
npx tsc --noEmit

# 2. Build — must compile cleanly
npm run build

# 3. Validation — requires dev server on port 3000
npm run dev &  # start dev server, then:
npm run test:validate

# Or run all together:
npm run test:all
```

**CI runs automatically on PRs to `develop` and `main`:**

| Check | What it verifies |
|-------|-----------------|
| Branch Name | Matches `feature/STU-N-*`, `fix/STU-N-*`, `chore/STU-N-*` |
| Clean Tree | No uncommitted modifications |
| TypeScript | `npx tsc --noEmit` |
| Build | `next build` |
| Lint | `npm run lint` |
| Unit Tests | `vitest run` |
| Validation | Full integration suite (MySQL + dev server + validate.mjs) |
| E2E | `playwright test` (where applicable) |

**Stale cache warning:** When switching branches, always run `rm -rf .next && npx prisma generate` before type-checking. Stale `.next` caches and outdated Prisma clients cause false errors that masquerade as real bugs.

**Lint-staged hazard:** The pre-commit hook stashes working changes. Switching branches while lint-staged is running can corrupt files with cross-branch artifacts. Verify working tree is clean before switching branches.

## TypeScript & Code Quality

- Run `npm run test:types` before committing — zero type errors required
- Run `npm run test:validate` for smoke tests against the dev server
- Run `npm run lint` before pushing
- Strict mode enabled — no implicit `any`, no unchecked index access
- Use `@/` path alias for all internal imports
- Server actions use `"use server"` directive in `actions.ts` files

## Auth & Security

- Session cookie: `studenthub_next_session` (HMAC-signed, httpOnly)
- AUTH_SECRET env var required for session signing
- Middleware at `src/middleware.ts` handles route-level auth gating
- Role-based access via `requireRole()` in server components
- Capability-based access via `requireCapability()` for granular control
- Password hashing via bcryptjs
- All API routes defined as Next.js server actions, not Express/Fastify

## Testing

- Validation suite: `npm run test:validate` (requires running dev server on port 3000)
- Smoke tests: `node scripts/smoke-test.mjs`
- Type check: `npx tsc --noEmit`
- Full CI: `npm run test:all` (lint + types + build + validate)
