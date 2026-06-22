import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

/**
 * Auth context helper — uses mock session cookie from fixtures.
 * Returns { browser, context, page, close } — caller must close.
 */
async function authContext(user: FixtureUser) {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: user.cookie,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return {
    browser,
    context,
    page,
    errors,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

/** Assert no React hydration/serialization errors in captured console errors. */
function assertNoReactErrors(errors: string[]) {
  const bad = errors.filter(
    (m) =>
      m.includes("hydration") ||
      m.includes("serialization") ||
      m.includes("Functions cannot be passed"),
  );
  expect(bad).toEqual([]);
}

// ─────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────

test.describe("Staff Interaction Smoke", () => {
  test.describe.configure({ mode: "serial" });

  let staff: FixtureUser;
  let candidateUser: FixtureUser;

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;
  });

  test("staff hub renders with heading and sidebar", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL("/staff");

    // Sidebar nav items should be present
    await expect(ctx.page.locator('a[href="/staff/candidates"]').first()).toBeVisible({ timeout: 10000 });
    await expect(ctx.page.locator('a[href="/staff/interviews"]').first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator('a[href="/staff/requests"]').first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff candidates page loads with DataTable", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/candidates");
    await ctx.page.waitForLoadState("networkidle");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // DataTable renders — use networkidle + robust selector
    await expect(ctx.page.locator('[class*="shOsDataTable"], [class*="DataTable"], [class*="dataTable"], .dataList, table').first()).toBeVisible({ timeout: 15000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff interviews page loads", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/interviews");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/staff\/interviews/);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff requests page loads", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/staff\/requests/);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff navigation — sidebar links navigate correctly", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const navLinks = [
      { text: "Candidates", url: "/staff/candidates" },
      { text: "Interviews", url: "/staff/interviews" },
      { text: "Requests", url: "/staff/requests" },
    ];

    for (const link of navLinks) {
      const sidebarLink = ctx.page.locator(`a[href="${link.url}"]`).first();
      if ((await sidebarLink.count()) > 0) {
        await sidebarLink.click();
        await ctx.page.waitForURL((url) => url.pathname.includes(link.url), { timeout: 10000 });
        expect(ctx.page.url()).toContain(link.url);
        // Navigate back to hub
        await ctx.page.goto("/staff");
        await ctx.page.waitForLoadState("load");
      }
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("candidate cannot access staff pages", async () => {
    const ctx = await authContext(candidateUser);
    await ctx.page.goto("/staff");
    await ctx.page.waitForLoadState("load");
    const url = new URL(ctx.page.url());
    expect(url.pathname).not.toBe("/staff");
    await ctx.close();
  });
});

// ─────────────────────────────────────────────────────
// Company
// ─────────────────────────────────────────────────────

test.describe("Company Interaction Smoke", () => {
  test.describe.configure({ mode: "serial" });

  let company: FixtureUser;
  let candidateUser: FixtureUser;

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    candidateUser = fixtures.get("candidate")!;
  });

  test("company hub renders with heading and sidebar", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL("/company");

    // Sidebar nav items
    await expect(ctx.page.locator('a[href="/company/companies"]').first()).toBeVisible({ timeout: 10000 });
    await expect(ctx.page.locator('a[href="/company/contacts"]').first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator('a[href="/company/requests"]').first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator('a[href="/company/stores"]').first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator('a[href="/company/search"]').first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company contacts page loads", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/contacts");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/company\/contacts/);
    await expect(ctx.page.locator('[class*="shOsDataTable"], [class*="DataTable"], [class*="dataTable"], .dataList, table').first()).toBeVisible({ timeout: 15000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company navigation — sidebar links navigate correctly", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company");
    await ctx.page.waitForLoadState("load");

    const navLinks = [
      { url: "/company/companies" },
      { url: "/company/contacts" },
      { url: "/company/requests" },
      { url: "/company/stores" },
    ];

    for (const link of navLinks) {
      const sidebarLink = ctx.page.locator(`a[href="${link.url}"]`).first();
      if ((await sidebarLink.count()) > 0) {
        await sidebarLink.click();
        await ctx.page.waitForURL((url) => url.pathname.includes(link.url), { timeout: 10000 });
        expect(ctx.page.url()).toContain(link.url);
        await ctx.page.goto("/company");
        await ctx.page.waitForLoadState("load");
      }
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("candidate cannot access company pages", async () => {
    const ctx = await authContext(candidateUser);
    await ctx.page.goto("/company");
    await ctx.page.waitForLoadState("load");
    const url = new URL(ctx.page.url());
    expect(url.pathname).not.toBe("/company");
    await ctx.close();
  });
});

// ─────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────

test.describe("Admin Interaction Smoke", () => {
  test.describe.configure({ mode: "serial" });

  let admin: FixtureUser;
  let staffUser: FixtureUser;

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    staffUser = fixtures.get("staff")!;
  });

  test("admin hub renders with heading and sidebar", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL("/admin");

    // Sidebar nav items
    await expect(ctx.page.locator('a[href="/admin/candidates"]').first()).toBeVisible({ timeout: 10000 });
    await expect(ctx.page.locator('a[href="/admin/companies"]').first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator('a[href="/admin/requests"]').first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator('a[href="/admin/transfers"]').first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator('a[href="/admin/agents"]').first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin candidates list loads with DataTable", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/candidates");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/admin\/candidates/);
    await expect(ctx.page.locator('[class*="shOsDataTable"], [class*="DataTable"], [class*="dataTable"], .dataList, table').first()).toBeVisible({ timeout: 15000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin companies list loads", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/companies");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/admin\/companies/);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // Note: /admin/compliance and /admin/payments only have [id] subroutes
  // (compliance/[id], payments/[paymentId]), no index pages — tests removed.

  test("admin requests list loads", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/admin\/requests/);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin transfers list loads", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/transfers");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/admin\/transfers/);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin navigation — sidebar links navigate correctly", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");

    const navLinks = [
      { url: "/admin/candidates" },
      { url: "/admin/companies" },
      { url: "/admin/requests" },
      { url: "/admin/transfers" },
      { url: "/admin/agents" },
      { url: "/admin/employees" },
    ];

    for (const link of navLinks) {
      const sidebarLink = ctx.page.locator(`a[href="${link.url}"]`).first();
      if ((await sidebarLink.count()) > 0) {
        await sidebarLink.click();
        await ctx.page.waitForURL((url) => url.pathname.includes(link.url), { timeout: 10000 });
        expect(ctx.page.url()).toContain(link.url);
        await ctx.page.goto("/admin");
        await ctx.page.waitForLoadState("load");
      }
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff cannot access admin pages", async () => {
    const ctx = await authContext(staffUser);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    const url = new URL(ctx.page.url());
    expect(url.pathname).not.toBe("/admin");
    await ctx.close();
  });
});

// ─────────────────────────────────────────────────────
// Inspector
// ─────────────────────────────────────────────────────

test.describe("Inspector Interaction Smoke", () => {
  test.describe.configure({ mode: "serial" });

  let inspector: FixtureUser;
  let companyUser: FixtureUser;

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    inspector = fixtures.get("inspector")!;
    companyUser = fixtures.get("company")!;
  });

  test("inspector hub renders with heading and sidebar", async () => {
    const ctx = await authContext(inspector);
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL("/inspector");

    // Sidebar nav items
    await expect(ctx.page.locator('a[href="/inspector/id-requests"]').first()).toBeVisible({ timeout: 10000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("inspector ID requests page loads", async () => {
    const ctx = await authContext(inspector);
    await ctx.page.goto("/inspector/id-requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/inspector\/id-requests/);
    await expect(ctx.page.locator('[class*="shOsDataTable"], [class*="DataTable"], [class*="dataTable"], .dataList, table').first()).toBeVisible({ timeout: 15000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company cannot access inspector pages", async () => {
    const ctx = await authContext(companyUser);
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    const url = new URL(ctx.page.url());
    expect(url.pathname).not.toBe("/inspector");
    await ctx.close();
  });
});
