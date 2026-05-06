# Migration Parity Checklist

Use this as the working definition of "ready to migrate." A page existing is not enough.

## Request Pipeline

- [x] Admin request list renders from prod clone.
- [x] Admin request detail renders applications, invitations, interviews, stories, notes.
- [x] Staff request list renders assigned requests.
- [x] Staff request detail is scoped to assigned staff.
- [x] Admin/staff request fulfillment desk renders matches, suggestions, invitations, applications, interviews, stories, and request skills.
- [x] Company request list renders linked company requests.
- [x] Company request detail is scoped to linked company contacts.
- [ ] Status transition rules mapped from Yii2.
- [ ] Application/interview/invitation actions implemented.
- [x] Local candidate suggestion creation writes legacy-compatible note and suggestion rows.
- [ ] Create/edit request forms implemented.
- [ ] Old-vs-new fixture tests for request statuses.

## Candidate Profile

- [x] Admin candidate list renders.
- [x] Admin/staff candidate detail renders profile, invitations, work history, work logs, notes.
- [x] Staff candidate console renders scoped operating queues, selected record preview, activity stream, action plan, skills, tags, warnings, and ID-card coverage.
- [x] Shared admin/staff candidate search OS renders from prod-clone data with role scope, facets, selected preview, and content smoke checks.
- [x] Candidate invitation list/detail renders.
- [ ] Candidate profile edit implemented.
- [ ] Profile completeness rules mapped.
- [ ] Education/experience/skills/document sections implemented.
- [ ] Candidate authorization denial tests for all detail/action routes.

## Work Logs And Payroll

- [x] Candidate work-log list/detail renders.
- [x] Admin transfer list renders.
- [x] Admin transfer detail renders candidate payouts, invoices, and transfer file entries.
- [ ] Work-log approval/rejection flows mapped.
- [ ] Appeal workflows implemented.
- [ ] Transfer detail implemented.
- [ ] Payroll export/payment file behavior mapped and tested.

## Company Portal

- [x] Linked company list/detail renders.
- [x] Company requests list/detail renders.
- [ ] Contacts/stores management implemented.
- [ ] Company request creation implemented.
- [ ] Company notes and communications mapped.

## Inspector / ID Verification

- [x] Inspector overview renders.
- [x] ID request list/detail renders.
- [x] ID request detail resolves candidate rows.
- [ ] Approve/reject verification workflow implemented.
- [ ] Candidate ID card media/document rendering implemented.
- [ ] Audit trail requirements mapped.

## Platform Readiness

- [x] Existing Yii bcrypt password hashes validate locally.
- [x] Unified `/login` resolves active legacy account type from verified email/password credentials.
- [x] Role session cookies implemented for local validation.
- [x] Build test added.
- [x] Route smoke test added.
- [x] Basic cross-role/ownership smoke checks added.
- [x] Staff candidate console smoke coverage includes selected-record query mode.
- [ ] Normalized account/capability session model implemented.
- [ ] Real auth provider plan finalized.
- [x] Algolia/search replacement isolated behind module.
- [ ] Search read adapter queries Meilisearch with MySQL fallback.
- [ ] File storage/media strategy implemented.
- [ ] Observability, error reporting, and audit logs implemented.
- [ ] Production deployment pipeline defined.
