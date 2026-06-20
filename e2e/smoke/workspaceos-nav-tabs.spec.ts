// ---------------------------------------------------------------------------
// E2E: WorkspaceOS nav tabs — verify sidebar renders for each role
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Tests that the WorkspaceNavigation sidebar renders the expected tabs
// for candidate, staff, company, and admin roles.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let staff: FixtureUser;
let company: FixtureUser;
let candidate: FixtureUser;

// Expected nav tab labels per role (derived from navForRole in navigation.ts)
const ADMIN_TABS = [
  "App", "Overview", "Candidates", "Companies", "Requests",
  "Transfers", "Agents", "Employees", "Attendance", "Designations",
  "Candidate Requests", "Company Requests", "User Requests",
];

const STAFF_TABS = [
  "App", "Overview", "My Requests", "Candidates", "Interviews",
  "Contracts", "Leaves",
];

const COMPANY_TABS = [
  "App", "Overview", "Job Postings", "Requests", "Search",
  "Companies", "Contacts", "Stores",
];

const CANDIDATE_TABS = [
  "App", "Overview", "Jobs", "My Applications", "Invitations",
  "Work Logs", "Chat", "Payments",
];

test.describe("WorkspaceOS — nav tabs per role", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    staff = fixtures.get("staff")!;
    company = fixtures.get("company")!;
    candidate = fixtures.get("candidate")!;
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
    const bad = errors.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(bad).toEqual([]);
  }

  /** Verify the sidebar nav for a given role contains the expected tab labels. */
  async function verifyNavTabs(roleName: string, user: FixtureUser, startUrl: string, expectedTabs: string[]) {
    const ctx = await authContext(user);
    await ctx.page.goto(startUrl);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Find sidebar nav links — scope to workspaceRailNav only (avoid mobile tab bar / header nav)
    const navLinks = ctx.page.locator("[class*='workspaceRailNav'] a");
    const linkCount = await navLinks.count();
    console.log(`${roleName}: found ${linkCount} nav links, expected ${expectedTabs.length} tabs`);

    // Collect visible tab labels
    const visibleLabels: string[] = [];
    for (let i = 0; i < linkCount; i++) {
      const label = (await navLinks.nth(i).textContent())?.trim() || "";
      if (label) visibleLabels.push(label);
    }

    // Check that all expected tabs are present
    for (const tab of expectedTabs) {
      const tabLink = ctx.page.locator(`[class*='workspaceRailNav'] a:has-text("${tab}")`).first();
      await expect(tabLink).toBeVisible({ timeout: 5000 });
      console.log(`${roleName}: verified tab "${tab}" is visible`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  }

  test("admin sidebar renders all admin tabs", async () => {
    await verifyNavTabs("Admin", admin, "/admin", ADMIN_TABS);
  });

  test("staff sidebar renders all staff tabs", async () => {
    await verifyNavTabs("Staff", staff, "/staff", STAFF_TABS);
  });

  test("company sidebar renders all company tabs", async () => {
    await verifyNavTabs("Company", company, "/company", COMPANY_TABS);
  });

  test("candidate sidebar renders all candidate tabs", async () => {
    await verifyNavTabs("Candidate", candidate, "/candidate", CANDIDATE_TABS);
  });
});
