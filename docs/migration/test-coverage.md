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

## Covered Routes

- Login:
  - `/login`
  - protected redirect from `/admin`

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

## Not Yet Covered

- Form submissions and mutations.
- Old-system parity assertions for business rules.
- Cross-role authorization denial checks beyond the basic protected redirect.
- Deep cross-role authorization denial checks for every future mutation/action.
- Visual regression checks.
- Performance budgets and slow-query detection.
- File/media/document rendering.
- External dependencies such as Algolia, email, notifications, storage, payment/payroll exports, and third-party identity providers.

## Migration Gate

Before replacing any old portal slice, that slice should have:

1. Route smoke coverage.
2. Data mapping coverage against representative prod-clone records.
3. Workflow tests for every create/update/approve/reject path.
4. Cross-role authorization tests.
5. Performance baseline for primary list and detail pages.
6. Manual sign-off notes from the role owner.
