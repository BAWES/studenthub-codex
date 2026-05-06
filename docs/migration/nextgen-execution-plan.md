# StudentHub Next-Gen Execution Plan

This is the product and engineering contract for continuing the rebuild without repeatedly changing direction. Future implementation passes should follow this plan unless the user explicitly changes the goal.

## Current State From Repo Scan

- The old product is a Yii2 backend plus separate Angular/Ionic apps for admin, staff, candidate, company, and inspector.
- The new app is a Next.js app in `studenthub-next` with Prisma pointed at the imported local production clone.
- The production backup is present locally as `../StudentHub Backup.sql` and is about 161 MB.
- The dump manifest sees 128 legacy tables. Largest operational tables include `note`, `candidate_skill`, `candidate_experience`, `candidate`, `transfer_candidate`, `invitation`, `suggestion`, `transfer`, `invoice`, and `candidate_id_card`.
- Existing Next routes cover read-only slices for admin, staff, candidate, company, inspector, a canonical `/app` command workspace, `/hub` compatibility, candidate search, request fulfillment, and admin transfers.
- Current login is wrong for the target product: it asks the user to choose a role or portal before verifying credentials.
- Current UI direction is inconsistent: there is a landing page, role login pages, hub, role shells, generic tables, and partial shadcn components mixed together.
- TypeScript currently passes with `npx tsc --noEmit`.
- Automated coverage is route smoke coverage and build coverage, not business-rule parity coverage.

## Non-Negotiable Product Direction

- One public landing page at `/`.
- One login experience at `/login`. The user enters email and password only.
- The server resolves which legacy identity or identities the credentials match.
- Users never self-select privileged roles before authentication.
- If one identity matches, open the correct workspace automatically.
- If multiple identities legitimately match the same credentials, show an authenticated account chooser after verification.
- The app has one universal authenticated shell. Navigation must not feel like jumping between unrelated apps.
- Candidate, company, request, transfer, and document detail pages are shared entity modules with role-scoped actions.
- Permissions decide what data and actions appear. The UI should not hide security decisions in route naming.
- Mobile is first-class. Every core workflow must be usable one-handed without horizontal tables.
- Search, command menu, keyboard shortcuts, and recent work tabs are core OS primitives, not decoration.
- The app must use production-clone data for validation until a proper test fixture layer exists.

## Target Architecture

### Identity And Access

Create a unified auth layer with these parts:

- `auth/legacy-resolver`: checks admin, staff, candidate, company contact, and inspector tables by email and password.
- `auth/account`: normalized account shape with stable `accountId`, `legacyType`, `legacyId`, `email`, `name`, and status.
- `auth/membership`: maps one signed-in person to one or more memberships/capabilities.
- `auth/session`: stores the selected account plus allowed capabilities, not just one hard-coded role.
- `auth/permissions`: capability registry such as `candidate.read.any`, `candidate.read.own`, `request.suggest`, `finance.transfer.read`, `company.request.create`, `id_review.approve`.
- `auth/audit`: every sensitive login, account switch, mutation, PDF export, and payroll action gets an audit event.

Do not keep `/login/[role]` as a primary path. It can redirect to `/login` with a non-authoritative hint for backwards compatibility.

### Universal App Shell

Replace fragmented shells with one authenticated shell:

- `/app`: role-aware home and command center.
- `/app/search`: universal search across visible entities.
- `/app/candidates`: shared candidate list/search module, scoped by capability.
- `/app/candidates/[id]`: shared candidate record with role-specific action panels.
- `/app/companies`: shared company list/search module.
- `/app/companies/[id]`: shared company account record with contacts, stores, requests, notes, contracts, invoices.
- `/app/requests`: request pipeline.
- `/app/requests/[id]`: request fulfillment desk with matching, suggestions, invitations, interviews, stories, notes, CV/PDF actions.
- `/app/time`: work logs, approvals, appeals, and feedback.
- `/app/finance`: transfers, candidate payouts, invoices, receipts, bank files, Xero context.
- `/app/documents`: CV exports, ID cards, invoices, receipts, contracts, uploaded files.
- `/app/admin`: admin-only system management, permissions, staff, settings, imports, reports.

Legacy role paths like `/admin/candidates` should redirect into `/app/candidates` with server-side permission checks, or remain temporary compatibility aliases.

### UI System

Finish the shadcn direction properly:

- Install Tailwind and shadcn in the standard way, or keep the current CSS-backed components only as a short-lived bridge.
- Build a small design system before adding more product pages:
  - `Button`, `Input`, `Textarea`, `Select`, `Tabs`, `Dialog`, `DropdownMenu`, `Command`, `Sheet`, `Table`, `Badge`, `Card`, `Toast`, `Tooltip`.
  - Use lucide icons in icon buttons and command actions.
  - Dark mode is a first-class theme with `system`, `light`, and `dark`.
- Build OS primitives:
  - stable left rail on desktop
  - bottom tab/navigation on mobile
  - command menu with actions, not only links
  - record tabs/work tabs for recently opened candidates, companies, requests, transfers
  - global search input with scope chips and saved views
  - detail side panels/drawers for fast preview without losing list context
- Avoid generic dashboards and large tables as primary UX. Lists should be task queues with next action, status, owner, and quick actions.

## Data And Search Direction

MySQL remains the source of truth during migration.

Use repository modules per domain:

- `domains/candidates`
- `domains/companies`
- `domains/requests`
- `domains/time`
- `domains/finance`
- `domains/documents`
- `domains/auth`
- `domains/audit`

Every module should expose:

- typed read models
- role/capability scoped queries
- server actions or route handlers for mutations
- fixture discovery helpers for smoke tests
- parity notes against legacy Yii actions

Search should sit behind an adapter:

- `search/provider.ts`: interface for candidate/company/request search.
- `search/mysql-provider.ts`: current fallback and dev-safe path.
- `search/meilisearch-provider.ts`: derived index path.
- `scripts/index-candidates-meilisearch.mjs`: existing candidate indexer should be kept and upgraded.

Use Meilisearch as the first open-source search implementation because the indexer is already started and the app needs fast typo-tolerant candidate search with facets. Treat the index as disposable derived data. All permissions and mutations still happen in MySQL/Next server code.

## Feature Parity Map

### Candidate Experience

Goal: candidate logs in once and sees a clear mobile path from profile to work to pay.

Must include:

- profile readiness score and exact missing fields
- edit personal info, contact info, nationality, university, objective, work experience, skills, bank info
- upload/update profile photo, CV, video, civil ID front/back, driving license where applicable
- invitations list and detail
- accept/reject invitation with legacy-compatible status changes
- work logs list/detail
- appeal a work log
- payment/transfer history and receipts visible to the candidate
- ID card/civil expiry state
- notifications and support/contact path

Acceptance:

- candidate cannot access any other candidate record
- manual login with production candidate credentials lands on their own progress/action page
- Playwright mobile smoke proves profile, invitations, work logs, and payments are reachable in under three taps

### Staff Operations

Goal: staff can run the daily placement workflow faster than the old staff app.

Must include:

- assigned requests queue
- request detail fulfillment desk
- candidate matching/search with filters/facets
- suggest candidates to requests
- send/export candidate CV pack for employer
- manage candidate notes, tags, warnings, skills, experience
- work logs, approvals, appeals, feedback
- candidate ID requests/cards/PDF queue
- company account view with stores, contacts, requests, documents, notes, follow-ups
- invitation and interview management
- chat/support/tickets where legacy workflow depends on it

Acceptance:

- staff cannot open candidates, companies, or requests outside allowed scope
- staff can complete a request-to-shortlist flow on prod-clone data
- PDF/CV export produces a downloadable artifact

### Company Experience

Goal: company contacts request workers, review people, approve work, and see invoices without seeing internal data.

Must include:

- linked companies and contact permissions
- company profile, stores, contacts, contracts
- create/edit request
- review suggested candidates and CVs
- request interviews
- approve/reject work logs where legacy company app supports it
- transfer/invoice/receipt history
- chat/support path

Acceptance:

- company contact only sees linked companies and requests
- company can create a request and see it in staff/admin queues
- company invoice PDF and receipt paths work from prod-clone transfer/invoice data

### Admin And Finance

Goal: admin controls migration, approvals, payroll, finance, reporting, and permissions.

Must include:

- admin overview focused on operational risk, not decorative metrics
- candidate approval/review queue
- company approval and account management
- staff/admin/inspector management
- permission sections/users mapped from legacy tables
- request assignment and status management
- transfer runs, candidate payouts, company totals, suspicious transfer review
- invoice/receipt PDF generation
- bank advice/export files
- payment received, lock/unlock, mark paid flows
- Xero integration surface or documented replacement
- reporting/stats parity where used by the team

Acceptance:

- every finance mutation has audit logging and old-vs-new parity tests
- transfer and invoice data match legacy calculations on selected prod-clone fixtures
- admin cannot accidentally impersonate end users in production UI

### Inspector / ID Verification

Goal: inspector clears ID batches quickly without placement/admin clutter.

Must include:

- ID request queue
- candidate rows inside each batch
- front/back ID media rendering
- approve/reject/return workflow
- audit trail and staff ownership

Acceptance:

- inspector only sees ID verification workflows
- status changes match legacy behavior

## Testing And TDD Requirements

No workflow is migration-ready until all of these exist:

- unit tests for pure mappers, permission decisions, and status transitions
- integration tests for Prisma reads and mutations against local prod-clone fixtures
- server action tests for every create/update/approve/reject path
- smoke tests for routes and content markers
- authorization tests for every role and every sensitive detail/action
- Playwright tests for command menu, mobile navigation, login, and top role flows
- visual regression screenshots for login, app shell, candidate search, request desk, company request, finance transfer, mobile candidate home
- performance budgets for primary list/detail pages and slow-query logging

The current `npm run test:smoke` is useful but not enough. It proves route renderability, not business correctness.

## Data Fixture Strategy

Do not rely on manually choosing records in the browser.

Build fixture helpers that discover stable production-clone records:

- admin with active password
- staff with assigned requests and assigned candidates
- candidate with invitations, work logs, payment rows, and documents if possible
- company contact with linked companies, requests, invoices
- transfer with invoices and transfer candidates
- request with skills, suggestions, invitations, applications, interviews
- ID request with matching candidate rows

Then create a local fixture manifest, generated from the prod clone, with IDs and expected counts. Tests should use this manifest and fail clearly when fixture coverage is missing.

## Milestones

### Milestone 0: Stabilize Current App

- Finish or revert partial shadcn work so build, smoke, and browser manual flow are clean.
- Remove visible role-picker login from `/login`.
- Document current known gaps directly in the app only where it helps testing, not as marketing copy.
- Keep dev impersonation hidden and disabled outside local dev.

Done when:

- `npx tsc --noEmit` passes.
- `npm run test:smoke` passes.
- `/login` is one email/password form.
- Existing role paths still resolve through real authenticated sessions.

### Milestone 1: Unified Auth And Account Model

- Implement `resolveLegacyIdentities(email, password)`.
- Return matching legacy accounts from admin, staff, candidate, contact, inspector.
- Replace `SessionUser.role` with normalized account and capabilities.
- Add authenticated account chooser only for multiple verified matches.
- Add route aliases from old role paths to `/app` modules.
- Add auth smoke tests for each identity type and wrong-password cases.

Done when:

- user logs in once without choosing role
- app opens correct workspace automatically
- permissions are capability based
- cross-role access tests still pass

### Milestone 2: Real Design System And App Shell

- Standardize shadcn/Tailwind setup.
- Build universal app shell with desktop rail, mobile bottom nav, top command/search, account menu, dark mode, work tabs.
- Replace generic `WorkspaceShell`, `commandOS`, and role-specific shells with one shell.
- Make mobile navigation stable across every authenticated route.

Done when:

- navigation does not visually reset between modules
- command menu works from every authenticated page
- dark mode survives reload
- mobile screenshots are clean at 390px width

### Milestone 3: Shared Entity Modules

- Build shared candidate list/detail module.
- Build shared company list/detail module.
- Build shared request list/detail module.
- Move admin/staff/company/candidate-specific behavior into action panels controlled by capabilities.
- Keep MySQL fallback search, then add Meilisearch provider behind adapter.

Done when:

- same candidate detail component serves admin, staff, and candidate-own views safely
- same company detail component serves admin, staff, and company contact views safely
- same request detail component serves admin, staff, and company views safely
- Meilisearch can be turned off without breaking the app

### Milestone 4: Candidate Mobile App Parity

- Build candidate home as a guided path: profile, invitations, work logs, payments.
- Implement profile edit and document upload stubs against storage adapter.
- Implement invitation accept/reject.
- Implement work-log appeal.
- Implement payment history.

Done when:

- candidate can complete the main self-service flow on mobile
- tests prove candidate isolation
- prod-clone data makes the screen useful immediately after login

### Milestone 5: Staff Request Fulfillment Parity

- Build request pipeline queue.
- Implement candidate matching, suggestion creation, invitation actions, interview actions, notes, stories.
- Implement CV/PDF export.
- Add employer email/share flow.

Done when:

- staff can fill a request from opening the request to sending candidates
- old-vs-new fixture tests prove core status changes

### Milestone 6: Company Portal Parity

- Build company home around requests, candidates, work logs, invoices.
- Implement request creation/editing.
- Implement suggested candidate review and interview request.
- Implement work-log approval/rejection where legacy supports it.
- Implement invoice/receipt views.

Done when:

- company contact can request workers and review candidates without internal data
- staff/admin can see the created request

### Milestone 7: Finance, Payroll, And Documents

- Build transfer run detail as the source of truth for payouts and invoices.
- Implement invoice PDF, receipt PDF, CV PDF, ID card PDF.
- Implement payable candidates, bank advice/export files, mark paid, lock/unlock, payment received flows.
- Add Xero integration decision and adapter.

Done when:

- selected transfer fixtures match legacy totals
- generated documents match required content
- finance actions are audited and tested

### Milestone 8: Admin System Management

- Staff/admin/inspector CRUD.
- Permissions UI mapped to legacy `permission_*` tables and new capability registry.
- Lookup/config management for countries, universities, degrees, tags, banks, settings.
- Reports and stats used by the team.

Done when:

- admin can operate the system without old admin for selected migrated slices

### Milestone 9: Mobile App Readiness

- Make the Next app PWA-ready first.
- Confirm route/module boundaries can be wrapped later by Capacitor or native shell.
- Ensure camera/upload/location APIs are behind adapters.
- Ensure push/notifications are abstracted.

Done when:

- candidate/staff/company mobile flows pass Playwright mobile tests
- installable PWA behavior is documented

### Milestone 10: Migration And Sunset

- Run old and new in parallel per workflow slice.
- Add read-only parity dashboards comparing counts and statuses.
- Move one low-risk slice to new writes.
- Expand slice by slice only after parity tests and manual sign-off.
- Keep rollback paths until a slice has stable production usage.

Done when:

- each old app surface has an owner, parity status, test status, and migration date
- no old portal is sunset based only on page existence

## Work Instructions For Future Lower-Intelligence Passes

Before editing:

1. Read this file.
2. Read `docs/migration/parity-checklist.md`.
3. Run `git status --short`.
4. Inspect the exact files for the current milestone.
5. Do not redesign unrelated modules.

During implementation:

1. Make the smallest milestone-aligned change that improves real workflow usability.
2. Prefer shared modules over new role-specific pages.
3. Every data read must be capability scoped.
4. Every mutation must have a test or explicit test gap.
5. Keep mobile layout in mind before desktop polish.

Before finishing:

1. Run `npx tsc --noEmit`.
2. Run smoke/build tests when the dev server and database are available.
3. Update parity docs with exactly what changed.
4. State what is now testable by a real end user.

## When To Use Extra-High Reasoning

Use extra-high reasoning for:

- unified auth and permission model
- payroll/finance parity
- old-vs-new status transition mapping
- data migration and fixture strategy
- major UX architecture decisions

Use lower or medium reasoning for:

- implementing already-specified components
- adding route aliases
- writing smoke tests from existing patterns
- styling a component inside the agreed design system
- adding read models for a known table relationship
