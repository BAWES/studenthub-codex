import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma } from "../fixtures/auth";

test.afterAll(async () => {
  await disconnectPrisma();
});

test.describe("Admin smoke — compliance, invoices", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
  });

  const pages = [
    { path: "/admin/compliance", name: "Compliance" },
    { path: "/admin/invoices", name: "Invoices" },
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

test.describe("Admin smoke — permissions, designations, agents", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
  });

  const pages = [
    { path: "/admin/permissions", name: "Permissions" },
    { path: "/admin/designations", name: "Designations" },
    { path: "/admin/agents", name: "Agents" },
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
