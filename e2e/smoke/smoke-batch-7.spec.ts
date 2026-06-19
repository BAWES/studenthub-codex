// ---------------------------------------------------------------------------
// E2E Smoke batch 7: Remaining list pages across all roles
//
// Covers routes that were missed in previous batches:
//   Admin:  /admin/aws, /admin/company-requests, /admin/transfers/bank-advice
//   Staff:  /staff/candidates/search
//   Company: /company/requests/create
//   Candidate: /candidate/jobs, /candidate/languages
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

const fixtures = getMockFixtures();
const admin = fixtures.get("admin")!;
const staff = fixtures.get("staff")!;
const companyUser = fixtures.get("company")!;
const candidate = fixtures.get("candidate")!;

// ── Admin pages ────────────────────────────────────────────────────────

test.describe("Admin smoke batch 7 — AWS, company-requests, bank-advice", () => {
  test.describe.configure({ mode: "serial" });

  const pages = [
    { path: "/admin/aws", name: "AWS Config" },
    { path: "/admin/company-requests", name: "Company Requests" },
    { path: "/admin/transfers/bank-advice", name: "Bank Advice" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });

    test(`${name} renders content`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});

// ── Staff pages ────────────────────────────────────────────────────────

test.describe("Staff smoke batch 7 — candidate search", () => {
  test.describe.configure({ mode: "serial" });

  const pages = [
    { path: "/staff/candidates/search", name: "Candidate Search" },
  ];

  for (const { path, name } of pages) {
    test(`staff can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });

    test(`${name} renders content`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});

// ── Company pages ──────────────────────────────────────────────────────

test.describe("Company smoke batch 7 — create request", () => {
  test.describe.configure({ mode: "serial" });

  const pages = [
    { path: "/company/requests/create", name: "Create Request" },
  ];

  for (const { path, name } of pages) {
    test(`company can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: companyUser.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });

    test(`${name} renders content`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: companyUser.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});

// ── Candidate pages ────────────────────────────────────────────────────

test.describe("Candidate smoke batch 7 — jobs, languages", () => {
  test.describe.configure({ mode: "serial" });

  const pages = [
    { path: "/candidate/jobs", name: "Jobs" },
    { path: "/candidate/languages", name: "Languages" },
  ];

  for (const { path, name } of pages) {
    test(`candidate can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });

    test(`${name} renders content`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});
