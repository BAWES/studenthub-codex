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
import { getFixtures, disconnectPrisma } from "../fixtures/auth";

test.afterAll(async () => {
  await disconnectPrisma();
});

// ── Admin pages ────────────────────────────────────────────────────────

test.describe("Admin smoke batch 7 — AWS, company-requests, bank-advice", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
  });

  const pages = [
    { path: "/admin/aws", name: "AWS Config" },
    { path: "/admin/company-requests", name: "Company Requests" },
    { path: "/admin/transfers/bank-advice", name: "Bank Advice" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
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
        { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});

// ── Staff pages ────────────────────────────────────────────────────────

test.describe("Staff smoke batch 7 — candidate search", () => {
  test.describe.configure({ mode: "serial" });

  let staffCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    staffCookie = fixtures.get("staff")!.cookie;
  });

  const pages = [
    { path: "/staff/candidates/search", name: "Candidate Search" },
  ];

  for (const { path, name } of pages) {
    test(`staff can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
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
        { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});

// ── Company pages ──────────────────────────────────────────────────────

test.describe("Company smoke batch 7 — create request", () => {
  test.describe.configure({ mode: "serial" });

  let companyCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    companyCookie = fixtures.get("company")!.cookie;
  });

  const pages = [
    { path: "/company/requests/create", name: "Create Request" },
  ];

  for (const { path, name } of pages) {
    test(`company can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: companyCookie, domain: "127.0.0.1", path: "/" },
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
        { name: "studenthub_next_session", value: companyCookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});

// ── Candidate pages ────────────────────────────────────────────────────

test.describe("Candidate smoke batch 7 — jobs, languages", () => {
  test.describe.configure({ mode: "serial" });

  let candidateCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    candidateCookie = fixtures.get("candidate")!.cookie;
  });

  const pages = [
    { path: "/candidate/jobs", name: "Jobs" },
    { path: "/candidate/languages", name: "Languages" },
  ];

  for (const { path, name } of pages) {
    test(`candidate can access ${name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
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
        { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
      await context.close();
    });
  }
});
