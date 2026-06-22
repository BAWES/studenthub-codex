import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

const fixtures = getMockFixtures();
const admin = fixtures.get("admin")!;

test.describe("Admin smoke — departments, designations", () => {
  test.describe.configure({ mode: "serial" });

  const pages = [
    { path: "/admin/departments", name: "Departments" },
    { path: "/admin/designations", name: "Designations" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${path}`, async ({ browser }) => {
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

    test(`${name} page renders content`, async ({ browser }) => {
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

test.describe("Admin smoke — employees, evaluations", () => {
  test.describe.configure({ mode: "serial" });

  const pages = [
    { path: "/admin/employees", name: "Employees" },
    { path: "/admin/evaluations", name: "Evaluations" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${path}`, async ({ browser }) => {
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

    test(`${name} page renders content`, async ({ browser }) => {
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

test.describe("Admin smoke — invoices, permissions", () => {
  test.describe.configure({ mode: "serial" });

  const pages = [
    { path: "/admin/invoices", name: "Invoices" },
    { path: "/admin/permissions", name: "Permissions" },
  ];

  for (const { path, name } of pages) {
    test(`admin can access ${path}`, async ({ browser }) => {
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

    test(`${name} page renders content`, async ({ browser }) => {
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
