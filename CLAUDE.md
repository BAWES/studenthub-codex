# StudentHub Next — Project Conventions

## Branch Strategy

- `main` — production-ready, deployable at all times
- Feature branches: `feature/STU-N-short-description` (e.g. `feature/STU-5-auth`)
- Bug fix branches: `fix/STU-N-short-description`
- Chore branches: `chore/STU-N-short-description`
- All branches are created off `main` and merged via pull request

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

## Git Anti-Patterns (PROHIBITED)

These operations have caused lost work. Never do any of the following:

- **Cherry-pick between branches.** Each change needs its own branch and PR. Cherry-picking breaks the issue-to-commit audit trail and creates duplicate commits. If you need another branch's changes, merge the branch or open a PR.
- **Reset branches containing others' work.** `git reset` on a branch with commits from multiple authors can silently drop work. If a branch has gone in the wrong direction, create a new branch from the correct base and re-apply changes properly.
- **Delete a local branch that hasn't been pushed.** Before deleting any local branch, verify it is merged via PR or pushed to `origin`.
- **Leave uncommitted changes on `main`.** Every change must be on a feature/fix/chore branch. Uncommitted work on main is at risk of being lost during checkout or pull operations.
- **Work on multiple unrelated changes on one branch.** One branch = one issue = one PR. If you find yourself fixing something unrelated, create a new branch.
- **Accumulate stashes.** Stashes are for temporary context switches (minutes, not days). If work will survive the current session, commit it to a branch and push. Prune stashes weekly.

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
