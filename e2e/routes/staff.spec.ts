import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let staff: FixtureUser;
let admin: FixtureUser;
let candidateUser: FixtureUser;

test.describe("Staff routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    staff = fixtures.get("staff")!;
    admin = fixtures.get("admin")!;
    candidateUser = fixtures.get("candidate")!;
  });

  async function assertRouteLoads(route: string) {
    const consoleMessages: string[] = [];
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      {
        name: "studenthub_next_session",
        value: staff.cookie,
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

  test("staff portal loads", async () => {
    await assertRouteLoads("/staff");
  });

  test("staff candidates list loads", async () => {
    await assertRouteLoads("/staff/candidates");
  });

  test("staff interviews loads", async () => {
    await assertRouteLoads("/staff/interviews");
  });

  test("staff requests loads", async () => {
    await assertRouteLoads("/staff/requests");
  });

  // ── Role guards ──

  test("candidate cannot access staff portal", async () => {
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
    await page.goto("/staff");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/staff");
    await bContext.close();
    await browser.close();
  });

  test("admin cannot access staff portal", async () => {
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
    await page.goto("/staff");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/staff");
    await bContext.close();
    await browser.close();
  });
});
