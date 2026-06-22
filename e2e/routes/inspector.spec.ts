import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let inspector: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;

test.describe("Inspector routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    inspector = fixtures.get("inspector")!;
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
        value: inspector.cookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await bContext.newPage();
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
    await bContext.close();
    await browser.close();
  }

  test("inspector portal loads", async () => {
    await assertRouteLoads("/inspector");
  });

  test("inspector ID requests loads", async () => {
    await assertRouteLoads("/inspector/id-requests");
  });

  // ── Role guards ──

  test("candidate cannot access inspector portal", async () => {
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
    await page.goto("/inspector");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/inspector");
    await bContext.close();
    await browser.close();
  });

  test("company cannot access inspector portal", async () => {
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
    await page.goto("/inspector");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/inspector");
    await bContext.close();
    await browser.close();
  });
});
