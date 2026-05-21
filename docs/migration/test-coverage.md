# Test Coverage

## Current Automated Checks

- `npm run test:build`
  - Runs `next build`.
  - Catches TypeScript, typed route, server component, and production build failures.

- `npm run test:smoke`
  - Requires local MySQL prod clone and dev server at `SMOKE_BASE_URL` or `http://127.0.0.1:3000`.
  - Loads `.env`, signs local session cookies, discovers representative records from `studenthub_prod_local`, and verifies every built route responds with the expected status.
  - Covers anonymous login, protected redirect, and role routes for admin, staff, candidate, company, and inspector.
  - Enforces a default per-route response budget of 5 seconds. Override with `SMOKE_BUDGET_MS`.
  - Checks cross-role redirects and ownership guards for candidate invitation/work-log detail and company account/request detail pages.
  - Checks canonical `/app` access, selected `/app` preview URLs, and selected `/hub` compatibility preview URLs.
  - Checks staff cannot open an unassigned candidate detail route.
  - Checks the shared admin/staff/candidate candidate workspace renders from prod-clone data, filtered search context is visible, full candidate detail pages expose readiness and workflow sections, and staff get an unavailable preview for unassigned candidates.
  - Checks staff candidate search has both all-production and assigned-only modes.
  - Checks staff home exposes the operating landing and production-data signal.
  - Checks candidate search exposes the internal open-tab workspace.
  - Checks the admin/staff request fulfillment desk renders for representative prod-clone requests.
  - Checks `/login` renders the unified login language and role-specific login URLs redirect back to the unified login.
  - Existing signed smoke sessions are decoded through the same session enrichment path used by unified login.
  - Current role compatibility routes pass through role + capability bridge guards.

## Covered Routes

- Login:
  - `/login`
  - `/login/admin`
  - `/login/candidate`
  - protected redirect from `/app`
  - protected redirect from `/admin`

- Unified App:
  - `/app`
  - `/app?scope=people&record=candidate-[id]`

- Admin:
  - `/admin`
  - `/admin/candidates`
  - `/admin/candidates/[id]`
  - `/admin/companies`
  - `/admin/companies/[id]`
  - `/admin/requests`
  - `/admin/requests/[id]`
  - `/admin/transfers`
  - `/admin/transfers/[id]`

- Staff:
  - `/staff`
  - `/staff/requests`
  - `/staff/requests/[id]`
  - `/staff/candidates`
  - `/staff/candidates/[id]`

- Candidate:
  - `/candidate`
  - `/candidate/invitations`
  - `/candidate/invitations/[id]`
  - `/candidate/work-logs`
  - `/candidate/work-logs/[id]`

- Company:
  - `/company`
  - `/company/companies`
  - `/company/companies/[id]`
  - `/company/requests`
  - `/company/requests/[id]`

- Inspector:
  - `/inspector`
  - `/inspector/id-requests`
- `/inspector/id-requests/[id]`

- Hub selected-record previews:
  - `/hub?scope=people&record=candidate-[id]`
  - `/hub?scope=companies&record=company-[id]`
  - `/hub?scope=demand&record=request-[uuid]`
  - `/hub?scope=money&record=transfer-[id]`
  - `/hub?scope=compliance&record=id-[uuid]`

## Playwright Smoke Tests (added STU-26)

Playwright smoke tests live in `e2e/smoke/` and use fixture-signed session cookies
for authenticated brower tests. Fixtures are discovered from the database via
`scripts/fixtures/discover.mjs` and validated with `scripts/fixtures/validate.mjs`.

- `e2e/smoke/login.spec.ts` — login page rendering, form fields, unauthenticated redirect
- `e2e/smoke/candidate-search.spec.ts` — admin + staff candidate search, cross-role guards
- `e2e/smoke/request-desk.spec.ts` — admin + staff + company request pages, cross-role guards
- `e2e/smoke/role-portals.spec.ts` — full portal smoke per role (admin/staff/candidate/company/inspector), app/hub shell, cross-role guards

Run with: `npx playwright test` (requires dev server at `PLAYWRIGHT_BASE_URL` and MySQL at `DATABASE_URL`).

## Not Yet Covered

- Form submissions and mutations.
- End-to-end credential submission for unified login server actions.
- Multiple-account verified chooser flow.
- Direct assertions for individual capability decisions.
- Capability-only route coverage for future shared `/app/*` modules.
- Mutation smoke coverage for local-only suggestion creation and duplicate handling.
- Old-system parity assertions for business rules.
- Cross-role authorization denial checks beyond the basic protected redirect.
- Deep cross-role authorization denial checks for every future mutation/action.
- Content-level assertions for unavailable hub previews.
- Automated keyboard/command-palette interaction tests.
- Visual regression checks.
- Performance budgets and slow-query detection.
- File/media/document rendering.
- External dependencies such as Algolia, email, notifications, storage, payment/payroll exports, and third-party identity providers.
- Meilisearch integration tests for indexing, filtering, typo tolerance, and MySQL fallback behavior.

## Parity Checklist — Automated Test Gap Map

Each gap from "Not Yet Covered" is mapped to whether automated testing is needed
and the current implementation status.

| # | Gap | Needs Automation | Status | Owner | Notes |
|---|---|---|---|---|---|
| 1 | Form submissions and mutations | Yes | Not started | QA | `e2e/smoke/` covers read-only routes; mutation tests need DB seeding + cleanup |
| 2 | Credential submission E2E | Yes | Not started | QA | Requires test credentials in seed data; blocked until test accounts exist |
| 3 | Multi-account chooser flow | Yes | Not started | QA | Needs DB with multi-identity users |
| 4 | Capability decision assertions | Yes | Not started | QA | Unit-testable with `capabilities.ts`; can add Jest/Vitest suite |
| 5 | Shared `/app/*` capability routes | Yes | Not started | QA | Gated on module delivery |
| 6 | Suggestion mutation smoke | Yes | Not started | QA | Needs mutation test harness |
| 7 | Old-system parity assertions | Manual | Not started | Role owners | Business-rule parity is manual sign-off per migration gate |
| 8 | Cross-role auth denial (basic) | Done | Covered | QA | Playwright role-portal + candidate-search + request-desk |
| 9 | Cross-role auth denial (deep) | Yes | Partial | QA | Basic redirect guards covered; per-mutation auth not tested |
| 10 | Unavailable hub previews | Yes | Not started | QA | Can add to `role-portals.spec.ts` |
| 11 | Keyboard/command-palette tests | Yes | Not started | QA | Playwright keyboard API; needs Cmd+K palette stable |
| 12 | Visual regression checks | Yes | Blocked | UXDesigner | Gated on STU-21 (app shell delivery); use Playwright screenshot diffing |
| 13 | Performance budgets | Yes | Not started | QA | `test:smoke` enforces per-route 5s budget; needs Lighthouse CI or similar |
| 14 | File/media/document rendering | Manual | Not started | Role owners | Visual inspection needed |
| 15 | External dependencies | No | Not started | DevOps | Algolia/email/storage/payment tested in their own stacks |
| 16 | Meilisearch integration | Yes | Not started | QA | Needs Meilisearch instance; `search:index-candidates` exists |

### Legend
- **Needs Automation**: whether automated testing is appropriate
- **Status**: Done / Partial / Not started / Blocked / Manual
- **Owner**: who should deliver the test coverage

## Migration Gate

Before replacing any old portal slice, that slice should have:

1. Route smoke coverage.
2. Data mapping coverage against representative prod-clone records.
3. Workflow tests for every create/update/approve/reject path.
4. Cross-role authorization tests.
5. Performance baseline for primary list and detail pages.
6. Manual sign-off notes from the role owner.
