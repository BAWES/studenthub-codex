import { test, expect, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let admin: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;
let sharedBrowser: Browser;

test.describe("Admin routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    sharedBrowser = browser;
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  async function assertRouteLoads(route: string) {
    const consoleMessages: string[] = [];
    const context = await sharedBrowser.newContext();
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: admin.cookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleMessages.push(msg.text());
    });
    await page.goto(route);
    await page.waitForLoadState("load");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    const errors = consoleMessages.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(errors).toEqual([]);
    await context.close();
  }

  test("admin dashboard loads", async () => {
    await assertRouteLoads("/admin");
  });

  test("admin candidates list loads", async () => {
    await assertRouteLoads("/admin/candidates");
  });

  test("admin companies list loads", async () => {
    await assertRouteLoads("/admin/companies");
  });

  test("admin compliance loads", async () => {
    await assertRouteLoads("/admin/compliance");
  });

  test("admin payments loads", async () => {
    await assertRouteLoads("/admin/payments");
  });

  test("admin requests list loads", async () => {
    await assertRouteLoads("/admin/requests");
  });

  test("admin transfers list loads", async () => {
    await assertRouteLoads("/admin/transfers");
  });

  test("admin agents page loads", async () => {
    await assertRouteLoads("/admin/agents");
  });

  test("admin events page loads", async () => {
    await assertRouteLoads("/admin/events");
  });

  // ── Remaining admin list pages ──

  test("admin attendance loads", async () => {
    await assertRouteLoads("/admin/attendance");
  });

  test("admin aws loads", async () => {
    await assertRouteLoads("/admin/aws");
  });

  test("admin bank loads", async () => {
    await assertRouteLoads("/admin/bank");
  });

  test("admin blocked-ips loads", async () => {
    await assertRouteLoads("/admin/blocked-ips");
  });

  test("admin candidate-account-requests loads", async () => {
    await assertRouteLoads("/admin/candidate-account-requests");
  });

  test("admin candidate-education loads", async () => {
    await assertRouteLoads("/admin/candidate-education");
  });

  test("admin company-requests loads", async () => {
    await assertRouteLoads("/admin/company-requests");
  });

  test("admin currency loads", async () => {
    await assertRouteLoads("/admin/currency");
  });

  test("admin departments loads", async () => {
    await assertRouteLoads("/admin/departments");
  });

  test("admin designations loads", async () => {
    await assertRouteLoads("/admin/designations");
  });

  test("admin employees loads", async () => {
    await assertRouteLoads("/admin/employees");
  });

  test("admin evaluations loads", async () => {
    await assertRouteLoads("/admin/evaluations");
  });

  test("admin invoices loads", async () => {
    await assertRouteLoads("/admin/invoices");
  });

  test("admin jira loads", async () => {
    await assertRouteLoads("/admin/jira");
  });

  test("admin note loads", async () => {
    await assertRouteLoads("/admin/note");
  });

  test("admin permissions loads", async () => {
    await assertRouteLoads("/admin/permissions");
  });

  test("admin reports loads", async () => {
    await assertRouteLoads("/admin/reports");
  });

  test("admin stores loads", async () => {
    await assertRouteLoads("/admin/stores");
  });

  test("admin tags loads", async () => {
    await assertRouteLoads("/admin/tags");
  });

  test("admin tickets loads", async () => {
    await assertRouteLoads("/admin/tickets");
  });

  test("admin user-requests loads", async () => {
    await assertRouteLoads("/admin/user-requests");
  });

  test("admin xero loads", async () => {
    await assertRouteLoads("/admin/xero");
  });

  // ── Role guards ──

  test("candidate cannot access admin", async () => {
    const bContext = await sharedBrowser.newContext();
    await bContext.addCookies([
      {
        name: "studenthub_next_session",
        value: candidateUser.cookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await bContext.newPage();
    await page.goto("/admin");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/admin");
    await bContext.close();
  });

  test("company cannot access admin", async () => {
    const bContext = await sharedBrowser.newContext();
    await bContext.addCookies([
      {
        name: "studenthub_next_session",
        value: companyUser.cookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await bContext.newPage();
    await page.goto("/admin");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/admin");
    await bContext.close();
  });
});
