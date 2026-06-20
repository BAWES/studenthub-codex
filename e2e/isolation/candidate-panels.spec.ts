// ---------------------------------------------------------------------------
// E2E Isolation: Candidate workspace panels — load independently
//
// Tests that each candidate panel (Dashboard, Profile, Invitations, Documents,
// Skills, Schedule) loads independently with its own heading, and no content
// from other panels leaks into the viewport.
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Follows pattern from e2e/isolation/admin-panels.spec.ts.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;

test.describe("Candidate workspace panel isolation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
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
    const bad = errors.filter(m => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"));
    expect(bad).toEqual([]);
  }

  // ── Panel definitions: route + expected-unique text fragment ──────────

  const panels: { label: string; route: string; heading: string }[] = [
    { label: "Dashboard",    route: "/candidate",              heading: "StudentHub profile" },
    { label: "Profile",      route: "/candidate/profile",      heading: "Update your candidate profile" },
    { label: "Invitations",  route: "/candidate/invitations",   heading: "Invitation History" },
    { label: "Documents",    route: "/candidate/documents",     heading: "Document Management" },
    { label: "Skills",       route: "/candidate/skills",        heading: "Skills & Expertise" },
    { label: "Schedule",     route: "/candidate/schedule",      heading: "Work Schedule" },
  ];

  for (const panel of panels) {
    test(`${panel.label} panel loads independently`, async () => {
      const ctx = await authContext(candidate);

      // Navigate directly to the panel route
      await ctx.page.goto(panel.route);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      assertNoReactErrors(ctx.errors);

      // The panel should render its own heading text (exact match to avoid false positives)
      const heading = ctx.page.getByRole('heading', { name: panel.heading, exact: true });
      await expect(heading).toBeVisible({ timeout: 10000 });

      // Verify no content from other panels leaks — heading texts from other
      // panels should NOT appear in the current panel's main content area
      for (const other of panels) {
        if (other.label === panel.label) continue;
        const main = ctx.page.locator("section.workspaceStage").first();
        const inMain = main.getByRole('heading', { name: other.heading, exact: true });
        const inMainCount = await inMain.count();
        expect(inMainCount,
          `${panel.label} should not leak "${other.heading}" heading into its main content`)
          .toBe(0);
      }

      await ctx.close();
    });
  }
});
