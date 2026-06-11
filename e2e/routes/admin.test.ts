import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let admin: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;

test.describe("Admin routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  async function assertRouteLoads(route: string) {
    const consoleMessages: string[] = [];
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      {
        name: "studenthub_next_session",
        value: admin.cookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await bContext.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleMessages.push(msg.text());
    });
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    const errors = consoleMessages.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(errors).toEqual([]);
    await bContext.close();
    await browser.close();
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

  // ── Role guards ──

  test("candidate cannot access admin", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
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
    await expect(page).not.toHaveURL("/admin");
    await bContext.close();
    await browser.close();
  });

  test("company cannot access admin", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
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
    await expect(page).not.toHaveURL("/admin");
    await bContext.close();
    await browser.close();
  });
});
