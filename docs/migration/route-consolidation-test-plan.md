# Route Consolidation Test Plan

**Issue:** [STU-628] [STU-187] Prepare test plan for unified /app/* route consolidation
**Status:** Ready for review
**Covers:** STU-621 (admin), STU-622 (staff), STU-623 (candidate), STU-624 (company), STU-625 (inspector)

## Architecture Under Test

The consolidation moves all role-specific routes from top-level directories into a unified `/app/*` namespace:

```
Old Path                    →   New Path (canonical)
/admin/*                    →   /app/admin/*      (308 redirect)
/staff/*                    →   /app/staff/*      (308 redirect)
/candidate/*                →   /app/candidate/*  (308 redirect)
/company/*                  →   /app/company/*    (308 redirect)
/inspector/*                →   /app/inspector/*  (308 redirect)
```

**App shell:** `src/app/app/layout.tsx` — `requireSession()` → `WorkspaceOS`
**Role layouts:** Each `/app/<role>/layout.tsx` gates with `requireRoleCapability(role, capability)`
**Middleware:** `src/middleware.ts` issues 308 permanent redirects for backward compatibility

**Role gating (current):**

| Role | Layout Capability Check |
|------|------------------------|
| Admin | `requireRoleCapability("admin", "admin.system")` |
| Staff | `requireRoleCapability("staff", "request.read.assigned")` |
| Candidate | `requireRoleCapability("candidate", "candidate.read.own")` |
| Company | `requireRoleCapability("company", "company.read.linked")` |
| Inspector | `requireRoleCapability("inspector", "id_review.read")` |

## Existing Coverage

### What's Already Tested

- **Smoke test script** (`scripts/smoke-test.mjs`): 63 automated route checks using old paths (redirect-following). Covers all 5 roles, cross-role guards, ownership guards, `/app` and `/hub` shell access.
- **Playwright E2E** (`e2e/smoke/`): 8 spec files covering landing, login, role portals, candidate search, request desk, candidate self-service, language CRUD, responsive layout. All use old paths.
- **Unit tests** (`npm run test:unit`): vitest suite.
- **Build validation** (`npx tsc --noEmit`, `npm run build`).

### Identified Gaps

1. **No E2E test directly hits a `/app/*` path.** All existing tests navigate to old paths and follow middleware redirects. This means the redirect layer is tested, not the canonical routes.
2. **Smoke test script only tests old paths.** The 63-route smoke matrix uses `/admin/*`, `/staff/*`, etc.
3. **No test verifies 308 status code** on redirect responses.
4. **No test verifies redirect preserves query parameters** (e.g. `/admin/candidates?q=test` → `/app/admin/candidates?q=test`).
5. **No test verifies redirect preserves path segments** (e.g. `/admin/candidates/123` → `/app/admin/candidates/123`).
6. **Cross-role tests only target old paths.** A cross-role redirect from `/staff` to somewhere else with an admin cookie tests the old path guard, not the new `/app/staff` guard directly.
7. **No direct layout-level role-gating tests.** We don't test that `GET /app/admin/candidates` with a staff cookie returns the correct forbidden/redirect response directly.
8. **Test fixtures reference old role paths for URLs.** The URL assertions in E2E tests check old paths (e.g. `toHaveURL("/admin/candidates")`), which will pass because the browser follows the 308. This masks that we're testing redirects, not direct access.
9. **Test coverage doc gap #5** — "Shared `/app/*` capability routes" is listed as "Not started."

## Test Plan

### Phase 1: Redirect Correctness (Backward Compatibility)

Verify the middleware 308 redirects work correctly. These tests protect users/bookmarks using old URLs.

| # | Test | Method | Expected |
|---|------|--------|----------|
| R1 | `GET /admin` → 308 → `/app/admin` | HEAD (no redirect follow) | 308, Location: `/app/admin` |
| R2 | `GET /admin/candidates` → 308 → `/app/admin/candidates` | HEAD | 308 |
| R3 | `GET /admin/candidates/123` → 308 → `/app/admin/candidates/123` | HEAD | 308 |
| R4 | `GET /admin/companies` → 308 | HEAD | 308 |
| R5 | `GET /admin/requests` → 308 | HEAD | 308 |
| R6 | `GET /admin/transfers` → 308 | HEAD | 308 |
| R7 | `GET /staff` → 308 → `/app/staff` | HEAD | 308 |
| R8 | `GET /staff/candidates` → 308 | HEAD | 308 |
| R9 | `GET /staff/requests` → 308 | HEAD | 308 |
| R10 | `GET /staff/interviews` → 308 | HEAD | 308 |
| R11 | `GET /candidate` → 308 → `/app/candidate` | HEAD | 308 |
| R12 | `GET /candidate/invitations` → 308 | HEAD | 308 |
| R13 | `GET /candidate/work-logs` → 308 | HEAD | 308 |
| R14 | `GET /candidate/payments` → 308 | HEAD | 308 |
| R15 | `GET /candidate/edit` → 308 | HEAD | 308 |
| R16 | `GET /company` → 308 → `/app/company` | HEAD | 308 |
| R17 | `GET /company/companies` → 308 | HEAD | 308 |
| R18 | `GET /company/requests` → 308 | HEAD | 308 |
| R19 | `GET /company/contacts` → 308 | HEAD | 308 |
| R20 | `GET /company/stores` → 308 | HEAD | 308 |
| R21 | `GET /inspector` → 308 → `/app/inspector` | HEAD | 308 |
| R22 | `GET /inspector/id-requests` → 308 | HEAD | 308 |
| R23 | `GET /admin/candidates?q=test` preserves query string | HEAD | 308, Location includes `?q=test` |
| R24 | `GET /candidate/invitations/abc-123` preserves path segment | HEAD | 308, Location: `/app/candidate/invitations/abc-123` |

**Implementation:** Add to `scripts/smoke-test.mjs` using `redirect: "manual"` and checking `response.status === 308` and `response.headers.get("location")`.

### Phase 2: Direct Route Rendering (Canonical Paths)

Verify every consolidated route loads correctly at its new `/app/*` path. Each route must render without error and serve its expected content.

#### Admin Routes (11 files)

| # | Route | Auth | Acceptance |
|---|-------|------|------------|
| A1 | `/app/admin` | Admin cookie | 200, body visible |
| A2 | `/app/admin/candidates` | Admin cookie | 200, candidate list renders |
| A3 | `/app/admin/candidates/[id]` | Admin cookie | 200, detail renders |
| A4 | `/app/admin/companies` | Admin cookie | 200, company list renders |
| A5 | `/app/admin/companies/[id]` | Admin cookie | 200, detail renders |
| A6 | `/app/admin/requests` | Admin cookie | 200, request list renders |
| A7 | `/app/admin/requests/[id]` | Admin cookie | 200, detail renders |
| A8 | `/app/admin/transfers` | Admin cookie | 200, transfer list renders |
| A9 | `/app/admin/transfers/[id]` | Admin cookie | 200, detail renders |

#### Staff Routes (9 files)

| # | Route | Auth | Acceptance |
|---|-------|------|------------|
| S1 | `/app/staff` | Staff cookie | 200, "Staff operating home" visible |
| S2 | `/app/staff/candidates` | Staff cookie | 200, candidate list renders |
| S3 | `/app/staff/candidates/[id]` | Staff cookie | 200 or redirect (ownership-based) |
| S4 | `/app/staff/requests` | Staff cookie | 200, request list renders |
| S5 | `/app/staff/requests/[id]` | Staff cookie | 200, detail renders |
| S6 | `/app/staff/interviews` | Staff cookie | 200 |
| S7 | `/app/staff/interviews/[id]` | Staff cookie | 200 |

#### Candidate Routes (10 files)

| # | Route | Auth | Acceptance |
|---|-------|------|------------|
| C1 | `/app/candidate` | Candidate cookie | 200, "Readiness" visible |
| C2 | `/app/candidate/invitations` | Candidate cookie | 200, own invitations |
| C3 | `/app/candidate/invitations/[id]` | Candidate cookie | 200 or redirect (ownership) |
| C4 | `/app/candidate/work-logs` | Candidate cookie | 200, own work logs |
| C5 | `/app/candidate/work-logs/[id]` | Candidate cookie | 200 or redirect (ownership) |
| C6 | `/app/candidate/payments` | Candidate cookie | 200, own payments |
| C7 | `/app/candidate/payments/[id]` | Candidate cookie | 200 |
| C8 | `/app/candidate/edit` | Candidate cookie | 200, edit form renders |

#### Company Routes (10 files)

| # | Route | Auth | Acceptance |
|---|-------|------|------------|
| CO1 | `/app/company` | Company cookie | 200, body visible |
| CO2 | `/app/company/companies` | Company cookie | 200, linked companies |
| CO3 | `/app/company/companies/[id]` | Company cookie | 200 or redirect (linked-company guard) |
| CO4 | `/app/company/requests` | Company cookie | 200 |
| CO5 | `/app/company/requests/[id]` | Company cookie | 200 |
| CO6 | `/app/company/requests/create` | Company cookie | 200 |
| CO7 | `/app/company/contacts` | Company cookie | 200 |
| CO8 | `/app/company/stores` | Company cookie | 200 |

#### Inspector Routes (6 files)

| # | Route | Auth | Acceptance |
|---|-------|------|------------|
| I1 | `/app/inspector` | Inspector cookie | 200, body visible |
| I2 | `/app/inspector/id-requests` | Inspector cookie | 200 |
| I3 | `/app/inspector/id-requests/[id]` | Inspector cookie | 200 |

**Implementation:** Extend `scripts/smoke-test.mjs` with a new canonical-path matrix. Add Playwright tests in `e2e/smoke/route-consolidation.spec.ts`.

### Phase 3: Cross-Role Access Guarding (No Data Leakage)

Verify each role layout rejects unauthorized roles. Test every role-against-every-role combination for the portal home page and one representative detail route.

| # | Actor (cookie) | Target Route | Expected |
|---|---------------|---------------|----------|
| X1 | Admin | `/app/staff` | Forbidden/redirect |
| X2 | Admin | `/app/candidate` | Forbidden/redirect |
| X3 | Admin | `/app/company` | Forbidden/redirect |
| X4 | Admin | `/app/inspector` | Forbidden/redirect |
| X5 | Staff | `/app/admin` | Forbidden/redirect |
| X6 | Staff | `/app/candidate` | Forbidden/redirect |
| X7 | Staff | `/app/company` | Forbidden/redirect |
| X8 | Staff | `/app/inspector` | Forbidden/redirect |
| X9 | Candidate | `/app/admin` | Forbidden/redirect |
| X10 | Candidate | `/app/staff` | Forbidden/redirect |
| X11 | Candidate | `/app/company` | Forbidden/redirect |
| X12 | Candidate | `/app/inspector` | Forbidden/redirect |
| X13 | Company | `/app/admin` | Forbidden/redirect |
| X14 | Company | `/app/staff` | Forbidden/redirect |
| X15 | Company | `/app/candidate` | Forbidden/redirect |
| X16 | Company | `/app/inspector` | Forbidden/redirect |
| X17 | Inspector | `/app/admin` | Forbidden/redirect |
| X18 | Inspector | `/app/staff` | Forbidden/redirect |
| X19 | Inspector | `/app/candidate` | Forbidden/redirect |
| X20 | Inspector | `/app/company` | Forbidden/redirect |
| X21 | Unauthenticated | `/app/admin` | 302 → `/login?redirect=...` |
| X22 | Unauthenticated | `/app/staff` | 302 → `/login?redirect=...` |
| X23 | Unauthenticated | `/app/candidate` | 302 → `/login?redirect=...` |
| X24 | Unauthenticated | `/app/company` | 302 → `/login?redirect=...` |
| X25 | Unauthenticated | `/app/inspector` | 302 → `/login?redirect=...` |

**Implementation:** Add to smoke test script (authorized vs unauthorized cookies) and Playwright role-portals spec.

### Phase 4: Session-Scoped Data Isolation

Verify each role sees only their own data. These tests require real DB fixtures.

| # | Test | Method | Expected |
|---|------|--------|----------|
| D1 | Candidate A → `/app/candidate/invitations` | E2E | Only shows Candidate A's invitations |
| D2 | Candidate A → `/app/candidate/invitations/[B_id]` | E2E | Forbidden/redirect (ownership guard) |
| D3 | Candidate A → `/app/candidate/work-logs` | E2E | Only shows Candidate A's work logs |
| D4 | Candidate A → `/app/candidate/work-logs/[B_id]` | E2E | Forbidden/redirect (ownership guard) |
| D5 | Company A → `/app/company/companies/[B_id]` | E2E | Forbidden/redirect (linked-company guard) |
| D6 | Staff → `/app/staff/candidates/[unassigned_id]` | E2E | Unavailable preview (not full access) |

**Implementation:** Already partially covered by `candidate-self-service.spec.ts` and smoke test. Update paths to `/app/*` variants and verify guards still fire on new paths.

### Phase 5: Shared Component Rendering

Verify that the shared shell and components render correctly in each role context.

| # | Test | Expected |
|---|------|----------|
| SH1 | Any role → `/app` | WorkspaceOS shell renders, role-aware HubContent |
| SH2 | Admin → `/app/admin` | WorkspaceOS shell + admin-scoped content |
| SH3 | Staff → `/app/staff` | WorkspaceOS shell + staff-scoped content |
| SH4 | Candidate → `/app/candidate` | WorkspaceOS shell + candidate-scoped content |
| SH5 | Company → `/app/company` | WorkspaceOS shell + company-scoped content |
| SH6 | Inspector → `/app/inspector` | WorkspaceOS shell + inspector-scoped content |

**Implementation:** Covered by existing role-portals spec once paths are updated. Add explicit assertions for WorkspaceOS shell presence (nav, command palette, etc.).

### Phase 6: Test Infrastructure Updates

Required updates to existing test files to close the gap between testing redirects and testing canonical routes.

#### 6a. Update E2E tests to use canonical `/app/*` paths

Every `.goto()` call in `e2e/smoke/*.spec.ts` that navigates to an old path should be updated to use the `/app/*` path directly. The URL assertions (`toHaveURL`) should check the `/app/*` path.

Files affected:
- `e2e/smoke/role-portals.spec.ts` — 18 old-path references
- `e2e/smoke/candidate-search.spec.ts` — 10 old-path references
- `e2e/smoke/request-desk.spec.ts` — 12 old-path references
- `e2e/smoke/candidate-self-service.spec.ts` — 17 old-path references
- `e2e/smoke/candidate-language-crud.spec.ts` — 6 old-path references
- `e2e/m5-pipeline-qa.spec.ts` — 7 old-path references

**Strategy:** Update all path references in one commit. Keep one redirect test per role to verify backward compatibility.

#### 6b. Update smoke test script

Add a new canonical-path matrix to `scripts/smoke-test.mjs` that hits `/app/*` paths directly. Keep the old-path matrix for backward-compat testing but add explicit 308 status checks.

#### 6c. Update test coverage documentation

Update `docs/migration/test-coverage.md`:
- Mark gap #5 "Shared `/app/*` capability routes" as In Progress
- Add the new canonical route matrix to the Covered Routes section

### Phase 7: TypeScript and Build Gate

| # | Check | Command | Expected |
|---|-------|---------|----------|
| T1 | TypeScript | `npx tsc --noEmit` | Zero errors |
| T2 | Build | `npm run build` | Clean build |
| T3 | Lint | `npm run lint` | Zero errors |
| T4 | Unit tests | `npm run test:unit` | All passing |
| T5 | No stale imports | `rg "from.*@/app/(admin|staff|candidate|company|inspector)" src/` | Zero results |

**Implementation:** Run as pre-push gate before any test changes are committed.

## Implementation Order

1. **Phase 7 first** — Verify the current state passes TypeScript + build + lint. This gates all further test work.
2. **Phase 1** — Add redirect correctness checks to smoke test (no DB fixtures needed, fast).
3. **Phase 6b** — Extend smoke test with canonical `/app/*` path matrix.
4. **Phase 2** — Direct route rendering smoke tests.
5. **Phase 3 + 4** — Cross-role guards and data isolation (needs DB fixtures).
6. **Phase 6a** — Update all E2E tests to canonical paths.
7. **Phase 5** — Shared component rendering assertions.
8. **Phase 6c** — Update test coverage docs.

## File Manifest

| File | Action |
|------|--------|
| `scripts/smoke-test.mjs` | Add 308 redirect checks + canonical path matrix |
| `e2e/smoke/route-consolidation.spec.ts` | **New** — dedicated consolidation test spec |
| `e2e/smoke/role-portals.spec.ts` | Update paths to `/app/*` |
| `e2e/smoke/candidate-search.spec.ts` | Update paths to `/app/*` |
| `e2e/smoke/request-desk.spec.ts` | Update paths to `/app/*` |
| `e2e/smoke/candidate-self-service.spec.ts` | Update paths to `/app/*` |
| `e2e/smoke/candidate-language-crud.spec.ts` | Update paths to `/app/*` |
| `e2e/m5-pipeline-qa.spec.ts` | Update paths to `/app/*` |
| `docs/migration/test-coverage.md` | Update coverage matrix |
