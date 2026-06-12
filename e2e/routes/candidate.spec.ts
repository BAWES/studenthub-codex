import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let candidate: FixtureUser;
let admin: FixtureUser;
let companyUser: FixtureUser;

test.describe("Candidate routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
    admin = fixtures.get("admin")!;
    companyUser = fixtures.get("company")!;
  });

  async function assertRouteLoads(route: string) {
    const consoleMessages: string[] = [];
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      {
        name: "studenthub_next_session",
        value: candidate.cookie,
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

  test("candidate portal loads", async () => {
    await assertRouteLoads("/candidate");
  });

  test("candidate certifications loads", async () => {
    await assertRouteLoads("/candidate/certifications");
  });

  test("candidate documents loads", async () => {
    await assertRouteLoads("/candidate/documents");
  });

  test("candidate edit profile loads", async () => {
    await assertRouteLoads("/candidate/edit");
  });

  test("candidate experience loads", async () => {
    await assertRouteLoads("/candidate/experience");
  });

  test("candidate invitations loads", async () => {
    await assertRouteLoads("/candidate/invitations");
  });

  test("candidate languages loads", async () => {
    await assertRouteLoads("/candidate/languages");
  });

  test("candidate notifications loads", async () => {
    await assertRouteLoads("/candidate/notifications");
  });

  test("candidate payments loads", async () => {
    await assertRouteLoads("/candidate/payments");
  });

  test("candidate references loads", async () => {
    await assertRouteLoads("/candidate/references");
  });

  test("candidate schedule loads", async () => {
    await assertRouteLoads("/candidate/schedule");
  });

  test("candidate skills loads", async () => {
    await assertRouteLoads("/candidate/skills");
  });

  test("candidate work logs loads", async () => {
    await assertRouteLoads("/candidate/work-logs");
  });

  test("candidate applications loads", async () => {
    await assertRouteLoads("/candidate/applications");
  });

  test("candidate jobs loads", async () => {
    await assertRouteLoads("/candidate/jobs");
  });

  test("candidate profile loads", async () => {
    await assertRouteLoads("/candidate/profile");
  });

  test("candidate search loads", async () => {
    await assertRouteLoads("/candidate/search");
  });

  // ── Role guards ──

  test("admin cannot access candidate portal", async () => {
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
    await page.goto("/candidate");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/candidate");
    await bContext.close();
    await browser.close();
  });

  test("company cannot access candidate portal", async () => {
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
    await page.goto("/candidate");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/candidate");
    await bContext.close();
    await browser.close();
  });
});
