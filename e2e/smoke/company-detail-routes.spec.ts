// ---------------------------------------------------------------------------
// E2E Smoke: Company detail routes
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies company detail pages (contacts, stores, notes, workspace, companies)
// load without React hydration/serialization errors.
// Uses real IDs from the fixture / production DB for meaningful URL lookups.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;

// Real IDs from production DB — detail pages resolve correctly
const CONTACT_UUID = "comp_cont_19132155-6093-11eb-bbc9-02b31902a3f6";
const STORE_ID = "1";
const NOTE_UUID = "note_00061850-4d30-11ed-b0cc-0af11b562340";
const COMPANY_ID = "1";

test.describe("Company detail routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
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

  test("company contact detail page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/company/contacts/${CONTACT_UUID}`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes(CONTACT_UUID)) {
      console.log(`Company contact detail page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /company/contacts/${CONTACT_UUID} to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company store detail page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/company/stores/${STORE_ID}`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes(STORE_ID)) {
      console.log(`Company store detail page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /company/stores/${STORE_ID} to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company note detail page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/company/notes/${NOTE_UUID}`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes(NOTE_UUID)) {
      console.log(`Company note detail page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /company/notes/${NOTE_UUID} to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company workspace detail page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/company/workspace/${COMPANY_ID}`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes(COMPANY_ID)) {
      console.log(`Company workspace detail page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /company/workspace/${COMPANY_ID} to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company company detail page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/company/companies/${COMPANY_ID}`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes(COMPANY_ID)) {
      console.log(`Company company detail page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /company/companies/${COMPANY_ID} to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
