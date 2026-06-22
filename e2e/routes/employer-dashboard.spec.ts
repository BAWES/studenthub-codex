import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let company: FixtureUser;
let staff: FixtureUser;
let candidateUser: FixtureUser;

test.describe("Employer dashboard", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;
  });

  async function assertDashboardContent(route: string) {
    const consoleMessages: string[] = [];
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: company.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleMessages.push(msg.text());
    });
    await page.goto(route);
    await page.waitForLoadState("load");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    // Verify WorkspaceShell heading
    await expect(page.getByRole("heading", { name: /Dashboard/i }).first()).toBeVisible({
      timeout: 10000,
    });

    // Verify metric cards are rendered
    const metricCards = page.locator("div.rounded-xl.border");
    await expect(metricCards.first()).toBeVisible({ timeout: 5000 });

    // Verify no hydration/serialization errors
    const errors = consoleMessages.filter(
      (m) => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"),
    );
    expect(errors).toEqual([]);

    await bContext.close();
    await browser.close();
  }

  async function assertRoleGuard(route: string, wrongRole: FixtureUser) {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: wrongRole.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto(route);
    await expect(page).not.toHaveURL(route);
    await bContext.close();
    await browser.close();
  }

  test("employer dashboard loads for company user", async () => {
    await assertDashboardContent("/employer/dashboard");
  });

  test("staff is redirected from employer dashboard", async () => {
    await assertRoleGuard("/employer/dashboard", staff);
  });

  test("candidate is redirected from employer dashboard", async () => {
    await assertRoleGuard("/employer/dashboard", candidateUser);
  });
});
