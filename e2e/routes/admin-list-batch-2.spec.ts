// ---------------------------------------------------------------------------
// E2E Smoke: Admin list pages (batch 2)
//
// Tests remaining admin list pages not covered in admin.spec.ts:
// attendance, bank, blocked-ips, candidate-account-requests,
// candidate-education, company-requests, currency, departments,
// designations, employees, evaluations, invoices, permissions,
// reports, stores, tags, tickets, user-requests.
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;

const LIST_ROUTES: { module: string; path: string }[] = [
  { module: "attendance",              path: "/admin/attendance" },
  { module: "bank",                    path: "/admin/bank" },
  { module: "blocked-ips",             path: "/admin/blocked-ips" },
  { module: "candidate-account-requests", path: "/admin/candidate-account-requests" },
  { module: "candidate-education",     path: "/admin/candidate-education" },
  { module: "company-requests",        path: "/admin/company-requests" },
  { module: "currency",                path: "/admin/currency" },
  { module: "departments",             path: "/admin/departments" },
  { module: "designations",            path: "/admin/designations" },
  { module: "employees",               path: "/admin/employees" },
  { module: "evaluations",             path: "/admin/evaluations" },
  { module: "invoices",                path: "/admin/invoices" },
  { module: "permissions",             path: "/admin/permissions" },
  { module: "reports",                 path: "/admin/reports" },
  { module: "stores",                  path: "/admin/stores" },
  { module: "tags",                    path: "/admin/tags" },
  { module: "tickets",                 path: "/admin/tickets" },
  { module: "user-requests",           path: "/admin/user-requests" },
];

test.describe("Admin list pages (batch 2)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  async function authContext(user: FixtureUser) {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: user.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    return { browser, context, page, errors, close: async () => { await context.close(); await browser.close(); } };
  }

  function assertNoReactErrors(errors: string[]) {
    const bad = errors.filter(m => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"));
    expect(bad).toEqual([]);
  }

  for (const { module, path } of LIST_ROUTES) {
    test(`${module} list page loads without errors`, async () => {
      const ctx = await authContext(admin);
      await ctx.page.goto(path);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test(`${module} list page renders heading or content`, async () => {
      const ctx = await authContext(admin);
      await ctx.page.goto(path);
      await ctx.page.waitForLoadState("load");
      const hasContent = await ctx.page.locator("h1, h2, h3, main, [class*='container'], [class*='list'], [class*='page']").first().isVisible().catch(() => false);
      expect(hasContent).toBe(true);
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  }

  // ── Cross-role guards (one representative route) ──

  test("candidate is redirected away from admin list pages", async () => {
    const ctx = await authContext(candidateUser);
    await ctx.page.goto(LIST_ROUTES[0].path);
    await ctx.page.waitForLoadState("load");
    expect(ctx.page.url()).not.toContain("/admin/");
    await ctx.close();
  });

  test("company is redirected away from admin list pages", async () => {
    const ctx = await authContext(companyUser);
    await ctx.page.goto(LIST_ROUTES[0].path);
    await ctx.page.waitForLoadState("load");
    expect(ctx.page.url()).not.toContain("/admin/");
    await ctx.close();
  });
});
