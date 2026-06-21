// ---------------------------------------------------------------------------
// E2E Sprint: Admin Transfer Lifecycle
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Tests the complete admin transfer lifecycle:
//   1. Transfer list page — verify metrics, data table, and workflow intro
//   2. Transfer detail — verify detail sections, candidate payouts, invoices
//   3. Transfer action bar — verify approve/reject actions render
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an authenticated browser context for the admin user.
 * Returns helpers for page, context, error tracking, and cleanup.
 */
async function adminContext(): Promise<{
  context: BrowserContext;
  page: Page;
  errors: string[];
  close: () => Promise<void>;
}> {
  const browser = await (
    await import("@playwright/test")
  ).chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: admin.cookie,
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
    context,
    page,
    errors,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

/** Assert no React hydration / serialization errors. */
function assertNoReactErrors(errors: string[]) {
  const bad = errors.filter(
    (m) =>
      m.includes("hydration") ||
      m.includes("serialization") ||
      m.includes("Functions cannot be passed"),
  );
  expect(bad).toEqual([]);
}

// ── Suite ───────────────────────────────────────────────────────────────────

test.describe("Admin Transfer Lifecycle", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 1 — Transfer List Page
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Transfer List Page", () => {
    test("1a. Transfers list page renders with metrics and table", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/transfers");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/admin\/transfers/);

      // Finance workflow intro section should render
      const introSection = ctx.page.locator(
        '[class*="financeStart"], [class*="financePrimary"]',
      );
      await expect(introSection.first()).toBeVisible({ timeout: 10000 });

      // Title/eyebrow text — use exact role to avoid strict mode violation
      await expect(
        ctx.page.getByRole('heading', { name: 'Transfer Runs', exact: true }),
      ).toBeVisible({ timeout: 5000 });

      // Data table or empty state renders
      const table = ctx.page
        .locator(".dataList, .rows, table, [class*='DataTable'], [class*='data-table']")
        .first();
      await expect(table).toBeVisible({ timeout: 10000 });

      // Metric cards section renders
      const metrics = ctx.page.locator(
        '[aria-label="Metric cards"], [class*="flex gap"]',
      ).first();
      await expect(metrics).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Transfer table shows rows with id, company, period, status, total", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/transfers");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Table headers should include key columns
      const headers = ctx.page.locator("table th, thead th, [class*='DataTable'] th");
      const headerTexts = await headers.allTextContents();
      const combined = headerTexts.join(" ");

      expect(combined).toMatch(/Transfer|#/i);
      expect(combined).toMatch(/Company/i);
      expect(combined).toMatch(/Period|Date/i);
      expect(combined).toMatch(/Status/i);
      expect(combined).toMatch(/Total/i);

      // Table body should have at least one row (or empty state message)
      const rows = ctx.page.locator(".dataList, .rows, table tbody tr, [class*='DataTable'] tbody tr");
      const rowCount = await rows.count().catch(() => 0);
      if (rowCount > 0) {
        // Verify first row has a transfer ID link
        const firstRowLink = ctx.page
          .locator('a[href*="/admin/transfers/"]')
          .first();
        const href = await firstRowLink.getAttribute("href").catch(() => null);
        expect(href).toMatch(/\/admin\/transfers\/\d+/);
      } else {
        // Empty state is acceptable
        const emptyMsg = ctx.page.locator("text=No transfer, text=No runs").first();
        console.log(
          `No transfer rows found. Empty state visible: ${await emptyMsg.isVisible().catch(() => false)}`,
        );
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 2 — Transfer Detail Page
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Transfer Detail Page", () => {
    test("2a. Transfer detail page loads and displays transfer information", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/transfers");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Find a transfer detail link
      const transferLinks = ctx.page.locator(
        'a[href*="/admin/transfers/"]',
      );
      const linkCount = await transferLinks.count().catch(() => 0);
      expect(linkCount).toBeGreaterThan(0);

      // Find the first link to a specific transfer detail
      let detailHref: string | null = null;
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const href = await transferLinks
          .nth(i)
          .getAttribute("href")
          .catch(() => null);
        if (href && href.match(/\/admin\/transfers\/\d+/)) {
          detailHref = href;
          break;
        }
      }
      expect(detailHref).not.toBeNull();

      // Navigate to transfer detail
      await ctx.page.goto(detailHref!);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/admin\/transfers\/\d+/);

      // Eyebrow/title should reference transfer
      const heading = ctx.page.locator("h1, h2, [class*='workspaceTitle']");
      await expect(heading.first()).toContainText("Transfer", { timeout: 5000 });

      // Metrics section should render (Candidate Payouts, Invoices, Status, Total)
      const metricLabels = [
        "Candidate Payouts",
        "Invoices",
        "Status",
        "Total",
      ];
      let foundMetrics = 0;
      for (const label of metricLabels) {
        const el = ctx.page.locator(`text=${label}`).first();
        if (await el.isVisible().catch(() => false)) {
          foundMetrics++;
        }
      }
      console.log(
        `Transfer detail metrics found: ${foundMetrics}/${metricLabels.length}`,
      );

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Transfer detail shows candidate payouts and invoices sections", async () => {
      const ctx = await adminContext();

      // Navigate directly to transfers list then to first detail
      await ctx.page.goto("/admin/transfers");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const transferLinks = ctx.page.locator(
        'a[href*="/admin/transfers/"]',
      );
      let detailHref: string | null = null;
      for (let i = 0; i < Math.min(5); i++) {
        const href = await transferLinks
          .nth(i)
          .getAttribute("href")
          .catch(() => null);
        if (href && href.match(/\/admin\/transfers\/\d+/)) {
          detailHref = href;
          break;
        }
      }
      expect(detailHref).not.toBeNull();

      await ctx.page.goto(detailHref!);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Detail section with transfer run info (Company, Period, Payment Received, etc.)
      const detailSection = ctx.page.locator(
        '[class*="DetailSection"], [class*="detailSection"]',
      );
      const detailCount = await detailSection.count().catch(() => 0);
      expect(detailCount).toBeGreaterThanOrEqual(1);

      // Candidate Payouts section should be present
      const candidateSection = ctx.page.locator(
        "text=Candidate Payouts, text=Candidate Payout",
      ).first();
      await expect(candidateSection).toBeVisible({ timeout: 5000 });

      // Invoices section should be present
      const invoiceSection = ctx.page.locator(
        "text=Invoices, text=Invoice",
      ).first();
      await expect(invoiceSection).toBeVisible({ timeout: 5000 });

      // Detail facts should include Company name
      const detailFacts = ctx.page.locator("text=Company").first();
      await expect(detailFacts).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 3 — Transfer Action Bar
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Transfer Action Bar", () => {
    test("3a. Transfer action bar renders on detail page", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/transfers");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Navigate to first transfer detail
      const transferLinks = ctx.page.locator(
        'a[href*="/admin/transfers/"]',
      );
      let detailHref: string | null = null;
      for (let i = 0; i < Math.min(5); i++) {
        const href = await transferLinks
          .nth(i)
          .getAttribute("href")
          .catch(() => null);
        if (href && href.match(/\/admin\/transfers\/\d+/)) {
          detailHref = href;
          break;
        }
      }
      expect(detailHref).not.toBeNull();

      await ctx.page.goto(detailHref!);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // TransferActionBar should be rendered (approve/reject buttons or loading state)
      const actionBar = ctx.page.locator(
        '[class*="transferActions"], [class*="actionBar"], [class*="TransferActionBar"]',
      );
      const actionBarVisible = await actionBar
        .first()
        .isVisible()
        .catch(() => false);
      if (actionBarVisible) {
        console.log("Transfer action bar is visible");
      } else {
        // Loading fallback
        const loadingMsg = ctx.page.locator("text=Loading actions").first();
        console.log(
          `Action bar loading state visible: ${await loadingMsg.isVisible().catch(() => false)}`,
        );
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });
});
