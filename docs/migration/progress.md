# Progress

## Completed

- Created `studenthub-next` as the new Next.js/TypeScript workspace.
- Added dump inspection and sample generation scripts.
- Generated a sanitized sample SQL file from `../StudentHub Backup.sql`.
- Started local MySQL with Docker Compose on `localhost:3307`.
- Imported the sanitized sample database successfully.
- Introspected 128 legacy tables with Prisma.
- Patched Prisma relation-name collisions:
  - `contact.contact_email_records`
  - `staff.staff_notification_records`
  - `staff.staff_salary_records`
- Generated Prisma Client.
- Built the first live dashboard against the real sample database.
- Verified `npm run build` passes.
- Started the dev server at `http://localhost:3000`.
- Imported the raw production backup into a separate local-only database: `studenthub_prod_local`.
- Pointed local `.env` at `studenthub_prod_local` for manual validation.
- Added existing-credential login for:
  - admin
  - staff
  - company contact
  - candidate
  - inspector
- Added role landing pages at:
  - `/admin`
  - `/staff`
  - `/company`
  - `/candidate`
  - `/inspector`
- Verified Yii `$2y$` bcrypt hashes can be validated in Node after prefix normalization.
- Verified local prod-clone smoke counts:
  - admins: 16
  - staff: 161
  - candidates: 53,517
  - companies: 523
  - contacts: 690
  - inspectors: 1
- Added first-pass production-data list and detail routes for all roles:
  - admin candidates, companies, requests, transfers
  - staff requests and candidate assignments
  - candidate invitations and work logs
  - company linked accounts and requests
  - inspector civil ID request batches
- Added admin transfer detail with candidate payouts, invoices, and transfer file entries.
- Added `npm run test:build` for compile/type verification.
- Added `npm run test:smoke` to sign local role sessions, discover representative prod-clone records, and verify every built route returns the expected status.
- Verified `npm run test:smoke` passes against `http://127.0.0.1:3000`.
- Expanded smoke coverage with response-time budgets and role/ownership guard checks.
- Built the unified `/hub` command workspace with role switching, global search, priority queues, and selected-record previews.
- Added in-hub production-data previews for candidates, companies, requests, transfers, and civil ID batches.
- Added smoke coverage for selected hub records across admin, staff, candidate, company, and inspector sessions.
- Removed visible dev role switching from the end-user hub and disabled `/dev/impersonate` unless `DEV_IMPERSONATION_ENABLED=1`.
- Scoped staff candidate search/detail access to candidates connected to the signed-in staff account.
- Added a contextual hub command menu with `Cmd/Ctrl K`, grouped navigation/search/queue/result actions, shortcut help, and `G then _` navigation patterns.
- Tightened the hub visual system toward a denser operations workspace with compact headers, rounded command surfaces, and role-aware command actions.
- Rebuilt `/staff/candidates` from a thin directory into a scoped candidate operations console:
  - staff-owned candidate queues
  - selected candidate preview without leaving the page
  - action plan from approval/profile/civil ID/work-log/invitation/warning signals
  - activity stream from work logs, invitations, appeals, and warnings
  - skills, tags, warnings, links, and ID-card coverage from imported legacy tables
- Added smoke coverage for `/staff/candidates?candidate=:id`.
- Reframed `/staff/candidates` into a staff operating-system shell with persistent workflow navigation for:
  - candidates
  - requests
  - time tracking
  - candidate pay
  - company invoices
  - ID cards and PDF/document queues
- Added live workflow cards backed by request, application, interview, story, work-log, appeal, transfer-candidate, invoice, and ID-request tables.
- Replaced the admin/staff candidate list surface with a shared production-backed candidate search OS:
  - scoped admin/staff access
  - query search over names, email, phone, UID, IDs, skills, and tags
  - facets for country, university, company, and skills
  - selected candidate preview with profile, invitations, work history, time logs, notes, skills, and tags
- Added a Meilisearch candidate indexing script so the current MySQL search surface can move to a dedicated open-source search index without changing the workflow UI.
- Expanded smoke coverage with content checks for the shared candidate search OS and staff candidate access denial preview.
- Rebuilt admin/staff request detail into a request fulfillment desk:
  - request brief, skills, status, seats, and company context
  - pipeline stages for matches, suggestions, invitations, applications, interviews, and stories
  - skill-based candidate match rows from prod-clone data
  - local add-suggestion action that creates the legacy `note` + `suggestion` records and updates the request timestamp
  - mailto draft for employer suggestion emails without auto-sending anything
- Expanded smoke coverage with content checks for the new admin/staff request fulfillment desk.
- Started unified login/account resolution:
  - `/login` now asks for email/password only.
  - server action checks all active legacy identity tables and creates the right session when exactly one account matches.
  - if credentials match multiple active legacy accounts, the user chooses only from verified accounts.
  - `/login/[role]` URLs are compatibility redirects to `/login?intent=:role`, not separate role-selected login forms.
- Added the first capability registry under the existing role routes:
  - sessions are enriched with `accountKey`, `legacyType`, and capabilities.
  - existing route guards still work, but new modules can begin using capability checks instead of hard-coded role checks.
- Migrated current authenticated routes from role-only guards to role + capability bridge guards:
  - admin, staff, candidate, company, inspector routes still keep their compatibility URLs.
  - each route now declares the capability it needs, such as `candidate.search`, `request.read.assigned`, `finance.read`, or `id_review.read`.
  - request suggestion creation now checks `request.suggest` instead of checking only `admin`/`staff`.
- Added `/app` as the canonical authenticated entry point:
  - login, existing-session login redirects, app CTAs, dev impersonation, and guard fallbacks now point to `/app`.
  - `/hub` remains live as a compatibility URL for existing bookmarked previews and smoke coverage.
- Rebuilt the shared candidate list/detail surface:
  - admin and staff candidate routes now use one reusable candidate profile module for selected preview and full record pages.
  - the candidate self-service landing page now uses the same profile module, scoped to the signed-in candidate.
  - candidate detail pulls richer prod-clone context: profile intro, store/company, email verification, civil ID dates, education, experience, certificates, revenue stats, warnings, links, notes, invitations, work history, and work logs.
  - candidate detail now also includes request applications, interviews, and suggestions/shortlists from the legacy workflow tables.
  - candidate search now shows active query/filter context with one-click clearing instead of leaving users guessing what data subset they are seeing.
  - smoke coverage now checks the candidate workspace language, filtered search context, readiness, and workflow sections on full candidate detail pages.

## Known Follow-Ups

- Two legacy tables are ignored by Prisma because they do not have a valid unique identifier:
  - `candidate_eval_dept_ques`
  - `candidate_evaluation_answer`
- Re-running `prisma db pull` may overwrite the manual relation-name collision fixes.
- The sample generator currently keeps representative slices by table-level limits; the next improvement is relationship-aware sampling around selected companies/candidates/requests.
- Production-clone mode is local-only and should not be deployed with real data or the local auth secret.
- Login currently supports password auth only. Google/Auth0/Apple/two-step login flows still need parity mapping.
- The session still stores one selected legacy role for route compatibility. Shared `/app/*` modules should continue moving to capability-only guards.
- The smoke suite proves route renderability, not business correctness. Workflow-level tests still need to cover old-vs-new behavior for create/update/approve/payroll flows before migration.
- Staff candidate detail currently renders candidate detail data for a linked staff fixture; deeper authorization tests should assert staff cannot open unrelated candidates once editing/actions begin.
- Current performance budget is a route-level smoke threshold, not a production load test.

## Recommended Next Slice

Build workflow-grade coverage around the highest-risk flows:

1. Candidate self-service console: profile completeness, documents, ID verification, availability, skills, invitations, and work logs.
2. Work-log/payroll console: shift approval, appeals, feedback, transfer/payroll connection, and export checks.
3. Company portal console: request lifecycle, contacts, stores, notes, and candidate shortlists.
4. PDF/document generation: CV exports, ID cards, invoices, and transfer files.
