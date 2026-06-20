# Phase 2 Employer Hiring — Test Plan

**Issue:** STU-3195
**Author:** QA Agent
**Date:** 2026-06-11

---

## 1. Scope

Phase 2 Employer Hiring covers the employer (company role) job posting CRUD flow:

| Page | Route | Purpose |
|------|-------|---------|
| Jobs List | `/employer/jobs` | List & manage job postings |
| New Job | `/employer/jobs/new` | Create a new job posting |
| Job Detail/Edit | `/employer/jobs/[id]` | View & edit a specific job |

Server actions: `actions.ts` — listJobs, getJob, createJob, updateJob, deleteJob, getMyEmployerId
Schemas: `schemas.ts` — Zod validation for all CRUD operations

---

## 2. Test Categories

### 2.1 Schema Validation (Unit Tests — Existing)
- [x] `listJobsSchema` — pagination, coercion, bounds
- [x] `createJobSchema` — required fields, max length, defaults
- [x] `updateJobSchema` — optional fields, partial updates
- [x] `getJobSchema` — positive integer jobId
- [x] `deleteJobSchema` — positive integer jobId

Existing test coverage in `actions.test.ts` (586 lines). Schema tests are comprehensive.

### 2.2 Server Actions (Integration — Missing)

**listJobs**
- [ ] Returns paginated list for employer with jobs
- [ ] Returns empty list for employer with no jobs
- [ ] Returns 401/redirect when not logged in
- [ ] Returns 403 for non-company role (candidate, admin, staff)
- [ ] Filters by status (active, draft, closed, filled)
- [ ] Searches by keyword (q param matches title)
- [ ] Handles page > totalPages gracefully (empty result)

**getJob**
- [ ] Returns job by valid jobId
- [ ] Returns null for non-existent jobId
- [ ] Returns 403 for non-company user
- [ ] Returns 403 if company user is not the owner

**createJob**
- [ ] Creates job with valid required fields only
- [ ] Creates job with all optional fields
- [ ] Rejects empty title
- [ ] Rejects title > 255 chars
- [ ] Rejects empty description
- [ ] Defaults status to "active"
- [ ] Returns the new jobListingId
- [ ] Returns 403 without company.write.linked capability

**updateJob**
- [ ] Updates title only (partial update)
- [ ] Updates all fields at once
- [ ] Can change status (active → closed, active → filled)
- [ ] Returns 404 for non-existent jobId
- [ ] Returns 403 if company user is not the owner

**deleteJob**
- [ ] Deletes an existing job
- [ ] Returns 404 for non-existent jobId
- [ ] Returns 403 if company user is not the owner

**getMyEmployerId**
- [ ] Returns company_id for a valid session with company link
- [ ] Returns null when session has no company link
- [ ] Returns null without session

### 2.3 UI / E2E (Browser Tests)

**Jobs List Page (`/employer/jobs`)**
- [ ] Page renders with DataTable showing existing jobs
- [ ] Columns: title, employmentType, location, salaryRange, status, createdAt
- [ ] "New Job" button/link navigates to `/employer/jobs/new`
- [ ] Row click navigates to `/employer/jobs/[id]`
- [ ] Shows empty state when no jobs exist
- [ ] Responsive layout works at mobile width

**New Job Page (`/employer/jobs/new`)**
- [ ] Form renders with all fields (title, description, requirements, location, employmentType, salaryRange)
- [ ] employerId is auto-populated (hidden field)
- [ ] Validation errors shown for empty required fields
- [ ] Successful submit redirects to job detail page
- [ ] Form shows loading state during submission
- [ ] Cancel returns to jobs list

**Job Edit Page (`/employer/jobs/[id]`)**
- [ ] Pre-populates form with existing job data
- [ ] Can edit and save all fields
- [ ] Shows "read-only" mode when current user is not the owner
- [ ] Non-owner cannot edit (no save button / fields disabled)
- [ ] Delete action with confirmation
- [ ] Successful update shows success feedback
- [ ] 404 page for non-existent jobId
- [ ] Back navigation returns to jobs list

### 2.4 Auth & Authorization
- [ ] Unauthenticated access to ANY employer route redirects to `/login`
- [ ] Candidate role cannot access any employer route (403)
- [ ] Staff role cannot access any employer route (403)
- [ ] Admin role cannot access any employer route (403)
- [ ] Company user with no linked company sees appropriate empty state
- [ ] Company user can only see/edit their own jobs (not other companies')

### 2.5 Error Handling
- [ ] Network error during form submit shows user-friendly error
- [ ] Rate limiting / double-submit protection on create
- [ ] Invalid URL params (string instead of number for [id]) handled gracefully
- [ ] Job deleted by another user shows appropriate 404

---

## 3. Priority

### P0 — Must test first
1. Auth gating: unauthenticated redirect, role-based 403
2. Create + List + View — happy path end-to-end
3. Edit + Delete — happy path

### P1 — Core coverage
4. Schema validation edge cases
5. Partial updates
6. Empty states
7. Owner-only enforcement

### P2 — Polish
8. Accessibility (keyboard nav, aria labels)
9. Mobile responsive layout
10. Loading states
11. Error feedback

---

## 4. Test Environment

- **Dev server:** http://localhost:3000
- **Tunnel:** https://bot-sh-testing.studenthub.co
- **Test accounts needed:**
  - Company user with linked employer → can see jobs
  - Company user without linked employer → empty state
  - Candidate user → should be blocked
  - Admin user → should be blocked
- **Test fixtures:** Create in `e2e/fixtures/` with mock job data

---

## 5. Known Risks

- Owner enforcement depends on `employerId` matching `getMyEmployerId()` — any bug here would leak job data to other employers
- The `getMyEmployerId()` helper returns the FIRST linked company — if a user has multiple companies, this may be incorrect
- Read-only mode on edit page is based on ownership check — verify non-owners truly can't edit
