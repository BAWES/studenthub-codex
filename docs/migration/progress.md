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

## Known Follow-Ups

- Two legacy tables are ignored by Prisma because they do not have a valid unique identifier:
  - `candidate_eval_dept_ques`
  - `candidate_evaluation_answer`
- Re-running `prisma db pull` may overwrite the manual relation-name collision fixes.
- The sample generator currently keeps representative slices by table-level limits; the next improvement is relationship-aware sampling around selected companies/candidates/requests.
- Production-clone mode is local-only and should not be deployed with real data or the local auth secret.
- Login currently supports password auth only. Google/Auth0/Apple/two-step login flows still need parity mapping.
- The smoke suite proves route renderability, not business correctness. Workflow-level tests still need to cover old-vs-new behavior for create/update/approve/payroll flows before migration.
- Staff candidate detail currently renders candidate detail data for a linked staff fixture; deeper authorization tests should assert staff cannot open unrelated candidates once editing/actions begin.
- Current performance budget is a route-level smoke threshold, not a production load test.

## Recommended Next Slice

Build workflow-grade coverage around the highest-risk flows:

1. Request pipeline parity: statuses, applications, invitations, interviews, stories.
2. Candidate profile parity: completeness, documents, ID verification, availability, skills.
3. Work-log parity: shift approval, appeals, feedback, transfer/payroll connection.
4. Company portal parity: request lifecycle, contacts, stores, notes.
