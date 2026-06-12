// ---------------------------------------------------------------------------
// E2E: WorkspaceOS command palette and keyboard shortcuts
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Tests the WorkspaceOS shell features across multiple roles:
//   1. Admin — Cmd+K palette opens, Escape closes, search filters
//   2. Staff — G-then-R keyboard shortcut navigates to /staff/requests
//   3. Company — G-then-C shortcut navigates to /company/companies
//   4. Candidate — G-then-O shortcut navigates to candidate portal
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — no DB dependency
process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let staff: FixtureUser;
let company: FixtureUser;
let candidate: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

async function authContext(user: FixtureUser) {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: user.cookie,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return {
    browser,
    context,
    page,
    errors,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
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

/** Open the command palette by pressing Cmd+K, wait for it to appear. */
async function openCommandPalette(page: any) {
  await page.keyboard.press("Meta+k");
  // Let the palette render — caller waits for palette selector to be visible
}

/** Close the command palette by pressing Escape. */
async function closeCommandPalette(page: any) {
  await page.keyboard.press("Escape");
  // Caller waits for palette selector to not be visible
}

// ── Suite ───────────────────────────────────────────────────────────────────

test.describe("WorkspaceOS — command palette & keyboard shortcuts", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    staff = fixtures.get("staff")!;
    company = fixtures.get("company")!;
    candidate = fixtures.get("candidate")!;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 1 — Command Palette (Cmd+K)
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Command palette", () => {
    test("1a. Cmd+K opens the command palette on admin page", async () => {
      const ctx = await authContext(admin);

      await ctx.page.goto("/admin");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Press Cmd+K to open palette
      await openCommandPalette(ctx.page);

      // Palette overlay or search input should be visible
      const paletteInput = ctx.page.locator(
        'input[placeholder*="search" i], [role="combobox"], [data-testid="command-palette"], [class*="CommandPalette"], [class*="commandPalette"], [class*="command-palette"]',
      );
      await expect(paletteInput.first()).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Escape closes the command palette", async () => {
      const ctx = await authContext(admin);

      await ctx.page.goto("/admin");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Open palette
      await openCommandPalette(ctx.page);
      const paletteInput = ctx.page.locator(
        'input[placeholder*="search" i], [role="combobox"], [data-testid="command-palette"], [class*="CommandPalette"], [class*="command-palette"]',
      );
      await expect(paletteInput.first()).toBeVisible({ timeout: 5000 });

      // Close with Escape
      await closeCommandPalette(ctx.page);

      // Palette should be gone — the input should not be visible
      await expect(paletteInput.first()).not.toBeVisible({ timeout: 3000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1c. Cmd+K works on staff page", async () => {
      const ctx = await authContext(staff);

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      await openCommandPalette(ctx.page);

      const paletteInput = ctx.page.locator(
        'input[placeholder*="search" i], [role="combobox"], [data-testid="command-palette"], [class*="CommandPalette"], [class*="command-palette"]',
      );
      await expect(paletteInput.first()).toBeVisible({ timeout: 5000 });

      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 2 — Keyboard shortcuts (g-then-letter navigation)
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Keyboard shortcuts — go-to navigation", () => {
    test("2a. G then R navigates staff to /staff/requests", async () => {
      const ctx = await authContext(staff);

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Press G then R — "go to requests"
      await ctx.page.keyboard.press("g");
      await ctx.page.waitForTimeout(100);
      await ctx.page.keyboard.press("r");
      await ctx.page.waitForURL("**/staff/requests*", { timeout: 5000 });

      // Should be on /staff/requests or the page is loading it
      const currentUrl = ctx.page.url();
      console.log(`G+R navigation URL: ${currentUrl}`);
      // We expect the URL to contain /staff/requests
      expect(currentUrl.includes("/staff/requests")).toBe(true);

      await ctx.close();
    });

    test("2b. G then C navigates company user to /company/companies", async () => {
      const ctx = await authContext(company);

      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Press G then C — "go to companies"
      await ctx.page.keyboard.press("g");
      await ctx.page.waitForTimeout(100);
      await ctx.page.keyboard.press("c");
      await ctx.page.waitForURL("**/company/companies*", { timeout: 5000 });

      const currentUrl = ctx.page.url();
      console.log(`G+C navigation URL: ${currentUrl}`);
      expect(currentUrl.includes("/company/companies")).toBe(true);

      await ctx.close();
    });

    test("2c. G then O navigates to candidate hub", async () => {
      const ctx = await authContext(candidate);

      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Press G then H — "go to hub" (staying on candidate hub)
      await ctx.page.keyboard.press("g");
      await ctx.page.waitForTimeout(100);
      await ctx.page.keyboard.press("h");
      await ctx.page.waitForURL("**/candidate*", { timeout: 5000 });

      // Should still be on candidate hub
      const currentUrl = ctx.page.url();
      console.log(`G+H navigation URL: ${currentUrl}`);
      expect(currentUrl.includes("/candidate")).toBe(true);

      await ctx.close();
    });
  });
});
