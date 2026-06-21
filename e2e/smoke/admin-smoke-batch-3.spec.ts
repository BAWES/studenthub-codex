import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma } from "../fixtures/auth";

test.afterAll(async () => {
  await disconnectPrisma();
});

test.describe("Admin smoke — agents, attendance", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
  });

  const pages = [
    { path: "/admin/agents", name: "Agents" },
    { path: "/admin/attendance", name: "Attendance" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${path}`, async ({ browser }) => {
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

    test(`${name} page renders content`, async ({ browser }) => {
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

test.describe("Admin smoke — bank, compliance", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
  });

  const pages = [
    { path: "/admin/bank", name: "Bank" },
    { path: "/admin/compliance", name: "Compliance" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${path}`, async ({ browser }) => {
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

    test(`${name} page renders content`, async ({ browser }) => {
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

test.describe("Admin smoke — candidate-account-requests, candidate-education", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
  });

  const pages = [
    { path: "/admin/candidate-account-requests", name: "Candidate Account Requests" },
    { path: "/admin/candidate-education", name: "Candidate Education" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${path}`, async ({ browser }) => {
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

    test(`${name} page renders content`, async ({ browser }) => {
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
