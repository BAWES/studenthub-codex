import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let company: FixtureUser;
let candidateUser: FixtureUser;
let staff: FixtureUser;

test.describe("Company routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    candidateUser = fixtures.get("candidate")!;
    staff = fixtures.get("staff")!;
  });

  async function assertRouteLoads(route: string) {
    const consoleMessages: string[] = [];
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      {
        name: "studenthub_next_session",
        value: company.cookie,
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

  test("company portal loads", async () => {
    await assertRouteLoads("/company");
  });

  test("company companies list loads", async () => {
    await assertRouteLoads("/company/companies");
  });

  test("company contacts loads", async () => {
    await assertRouteLoads("/company/contacts");
  });

  test("company requests loads", async () => {
    await assertRouteLoads("/company/requests");
  });

  test("company requests create loads", async () => {
    await assertRouteLoads("/company/requests/create");
  });

  test("company stores loads", async () => {
    await assertRouteLoads("/company/stores");
  });

  test("company workspace loads", async () => {
    await assertRouteLoads("/company/workspace");
  });

  // ── Role guards ──

  test("candidate cannot access company portal", async () => {
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
    await page.goto("/company");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/company");
    await bContext.close();
    await browser.close();
  });

  test("staff cannot access company portal", async () => {
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
    await page.goto("/company");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/company");
    await bContext.close();
    await browser.close();
  });
});
