import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma } from "../fixtures/auth";

test.afterAll(async () => {
  await disconnectPrisma();
});

test.describe("Role portal smoke tests", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;
  let staffCookie: string;
  let candidateCookie: string;
  let companyCookie: string;
  let inspectorCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
    staffCookie = fixtures.get("staff")!.cookie;
    candidateCookie = fixtures.get("candidate")!.cookie;
    companyCookie = fixtures.get("company")!.cookie;
    inspectorCookie = fixtures.get("inspector")!.cookie;
  });

  // ── Admin ──

  test("admin portal loads", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin");
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("admin can access candidates list", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("admin can access companies list", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/companies");
    await expect(page).toHaveURL("/admin/companies");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("admin can access transfers list", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/transfers");
    await expect(page).toHaveURL("/admin/transfers");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  // ── Staff ──

  test("staff portal loads with operating home", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff");
    await expect(page).toHaveURL("/staff");
    await expect(page.locator('text="Staff operating home"')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text="Production data loaded"')).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("staff can access requests list", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/requests");
    await expect(page).toHaveURL("/staff/requests");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  // ── Candidate ──

  test("candidate portal loads with readiness", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate");
    await expect(page).toHaveURL("/candidate");
    await expect(page.locator('text="Readiness"')).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("candidate can access invitations", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/invitations");
    await expect(page).toHaveURL("/candidate/invitations");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("candidate can access work logs", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/work-logs");
    await expect(page).toHaveURL("/candidate/work-logs");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  // ── Company ──

  test("company portal loads", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: companyCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/company");
    await expect(page).toHaveURL("/company");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("company can access linked companies", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: companyCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/company/companies");
    await expect(page).toHaveURL("/company/companies");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  // ── Inspector ──

  test("inspector portal loads", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: inspectorCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/inspector");
    await expect(page).toHaveURL("/inspector");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("inspector can access ID requests", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: inspectorCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/inspector/id-requests");
    await expect(page).toHaveURL("/inspector/id-requests");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  // ── Cross-role guards ──

  test("admin cannot access staff portal", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff");
    await expect(page).not.toHaveURL("/staff");
    await context.close();
  });

  test("staff cannot access admin portal", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin");
    await expect(page).not.toHaveURL("/admin");
    await context.close();
  });

  test("company cannot access candidate portal", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: companyCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate");
    await expect(page).not.toHaveURL("/candidate");
    await context.close();
  });

  test("candidate cannot access admin portal", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin");
    await expect(page).not.toHaveURL("/admin");
    await context.close();
  });

  // ── App shell ──

  test("authenticated user can access /app shell", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/app");
    await expect(page).toHaveURL("/app");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("authenticated user can access /hub shell", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/hub");
    await expect(page).toHaveURL("/hub");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });
});
