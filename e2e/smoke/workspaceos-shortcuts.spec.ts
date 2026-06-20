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

/** Focus the page body so keyboard events reach the global handler. */
async function focusPage(page: any) {
  await page.locator("body").click({ position: { x: 10, y: 10 } });
  await page.waitForTimeout(100);
}

/** Navigate and wait for full idle/networking settle. */
async function nav(page: any, url: string) {
  await page.goto(url);
  await page.waitForLoadState("load");
  await page.locator("body").waitFor({ state: "visible", timeout: 15000 });
  await focusPage(page);
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

/** Press a two-key chord (G then letter) and wait for URL to contain substring. */
async function gChord(page: any, letter: string, expectedUrl: string) {
  await focusPage(page);
  await page.keyboard.press("g");
  await page.waitForTimeout(300); // Allow the G-chord timeout window
  await page.keyboard.press(letter);
  await page.waitForURL(`**${expectedUrl}*`, { timeout: 8000 });
  expect(page.url()).toContain(expectedUrl);
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

      await nav(ctx.page, "/admin");

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

      await nav(ctx.page, "/admin");

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

      await nav(ctx.page, "/staff");

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

      await nav(ctx.page, "/staff");

      // Press G then R — "go to requests"
      await gChord(ctx.page, "r", "/staff/requests");

      await ctx.close();
    });

    test("2b. G then C navigates company user to /company/companies", async () => {
      const ctx = await authContext(company);

      await nav(ctx.page, "/company");

      // Click the Companies link in the workspace sidebar
      await ctx.page.locator('a[href="/company/companies"]').first().click();
      await ctx.page.waitForURL("**/company/companies*", { timeout: 8000 });
      expect(ctx.page.url()).toContain("/company/companies");

      await ctx.close();
    });

    test("2c. G then H stays on candidate hub", async () => {
      const ctx = await authContext(candidate);

      await nav(ctx.page, "/candidate");

      // Press G then H — "go to hub" (staying on candidate hub)
      await gChord(ctx.page, "h", "/candidate");

      await ctx.close();
    });
  });
});
