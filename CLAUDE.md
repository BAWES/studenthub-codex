# StudentHub Next — Project Conventions

## Branch Strategy

- `main` — production-ready, deployable at all times
- Feature branches: `feature/STU-N-short-description` (e.g. `feature/STU-5-auth`)
- Bug fix branches: `fix/STU-N-short-description`
- Chore branches: `chore/STU-N-short-description`
- All branches are created off `main` and merged via pull request

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

1. Create a feature branch from `main`
2. Commit changes with conventional commit messages
3. Push the branch to `origin`
4. Create a PR with a clear title and description
5. Request review from at least one team member
6. Merge only after approval and passing checks

PR titles follow: `[STU-N] Short description of change`

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
