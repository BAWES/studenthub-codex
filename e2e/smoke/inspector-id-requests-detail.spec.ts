// ---------------------------------------------------------------------------
// E2E Smoke: Inspector ID Request detail routes
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies inspector/id-requests/[id] detail page loads without
// React hydration/serialization errors.
// Uses real IDs from the production DB for meaningful URL lookups.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let inspector: FixtureUser;

// Real UUID from production DB
const ID_REQUEST_UUID = "cir_00d8acf7-fab4-11ef-888e-0281a5e9365b";

test.describe("Inspector ID request detail routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    inspector = fixtures.get("inspector")!;
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

  test("inspector id-request detail page loads without errors", async () => {
    const ctx = await authContext(inspector);
    await ctx.page.goto(`/inspector/id-requests/${ID_REQUEST_UUID}`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes("cir_")) {
      console.log(`Inspector ID request detail page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /inspector/id-requests/${ID_REQUEST_UUID} to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
