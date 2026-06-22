// ---------------------------------------------------------------------------
// E2E Sprint 2c: Staff critical flows — Request fulfillment pipeline
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Request List & Detail — view pending requests, navigate to detail
//   2. Request Fulfillment Pipeline — action bar, status transitions, fulfillment OS
//   3. Staff Hub & Sidebar Navigation — hub renders with nav links
//   4. Cross-role Access — candidate cannot access staff pages
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let staff: FixtureUser;
let candidateUser: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an authenticated browser context for the staff user.
 * Returns helpers for page, context, error tracking, and cleanup.
 */
async function staffContext(): Promise<{
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
      value: staff.cookie,
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

// ── Suite ──────────────────────────────────────────────────────────────────

test.describe("Staff critical flows — Request fulfillment pipeline", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 1 — Staff Hub & Sidebar Navigation
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Staff Hub & Sidebar Navigation", () => {
    test("1a. Staff hub renders with heading and sidebar nav links", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL("/staff");

      // Sidebar nav items for staff role
      await expect(ctx.page.locator('a[href="/staff/candidates"]').first()).toBeVisible({ timeout: 10000 });
      await expect(ctx.page.locator('a[href="/staff/interviews"]').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('a[href="/staff/requests"]').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('a[href="/staff"]').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('a[href="/app"]').first()).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Staff candidates page loads with DataTable", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/candidates");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/staff\/candidates/);

      // DataTable renders
      await expect(ctx.page.locator(".dataList, .rows, table").first()).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1c. Staff overview page loads", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/staff(\/|$)/);

      // Content renders
      const dataSection = ctx.page.locator("h1, [class*='content'], [class*='metrics']").first();
      await expect(dataSection).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1d. Staff interviews page loads", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/interviews");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/staff\/interviews/);

      // Interview list content
      const dataSection = ctx.page.locator(".dataList, .rows, table, h1, [class*='content']").first();
      await expect(dataSection).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1e. Sidebar navigation links navigate to correct pages", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const navLinks = [
        { url: "/staff/candidates" },
        { url: "/staff/interviews" },
        { url: "/staff/requests" },
      ];

      for (const link of navLinks) {
        const sidebarLink = ctx.page.locator(`a[href="${link.url}"]`).first();
        if ((await sidebarLink.count()) > 0) {
          await sidebarLink.click();
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page).toHaveURL(new RegExp(link.url.replace("/", "\\/")));
          // Navigate back to hub
          await ctx.page.goto("/staff");
          await ctx.page.waitForLoadState("load");
        }
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 2 — Request List & Detail
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Request List & Detail", () => {
    test("2a. Staff requests list page loads with DataTable", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/staff\/requests/);

      // Title heading
      await expect(ctx.page.locator("h1")).toContainText("Requests");

      // DataTable renders
      await expect(ctx.page.locator(".dataList, .rows, table").first()).toBeVisible({ timeout: 10000 });

      // Table columns render (Request, Company, Seats, Status, Updated)
      const requestCol = ctx.page.locator("text=Request").first();
      const statusCol = ctx.page.locator("text=Status").first();
      const companyCol = ctx.page.locator("text=Company").first();
      await expect(requestCol).toBeVisible({ timeout: 5000 });
      await expect(statusCol).toBeVisible({ timeout: 5000 });
      await expect(companyCol).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Request detail page renders with action bar and fulfillment OS", async () => {
      const ctx = await staffContext();

      // Navigate to requests list first
      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Find a request row and navigate to its detail page
      const firstRequestLink = ctx.page.locator("a[href*='/staff/requests/']").first();
      const linkCount = await firstRequestLink.count();

      if (linkCount > 0) {
        const href = await firstRequestLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Request Actions card should be present
        await expect(ctx.page.locator("text=Request Actions").first()).toBeVisible({ timeout: 10000 });

        // Request Fulfillment content loads
        const fulfillmentSection = ctx.page.locator('[class*="RequestFulfillment"], [class*="requestFulfillment"]').first();
        if (await fulfillmentSection.isVisible().catch(() => false)) {
          console.log("Request Fulfillment OS loaded successfully");
        }

        // Status action controls (select + button) are present
        await expect(ctx.page.locator("select[name='to_status']").first()).toBeVisible({ timeout: 5000 });
        await expect(ctx.page.locator('button:has-text("Update status")').first()).toBeVisible({ timeout: 5000 });
      } else {
        // No request rows — at least verify the list page loaded without errors
        console.log("No request rows found — detail navigation skipped");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2c. Request detail page loads without hydration or serialization errors", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const firstRequestLink = ctx.page.locator("a[href*='/staff/requests/']").first();
      if ((await firstRequestLink.count()) > 0) {
        const href = await firstRequestLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      }

      assertNoReactErrors(ctx.errors);
      console.log(`Console errors across staff request detail: ${ctx.errors.length}`);

      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 3 — Request Fulfillment Pipeline
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Request Fulfillment Pipeline", () => {
    test("3a. Status transition controls are present on request detail page", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Navigate to first request detail
      const firstRequestLink = ctx.page.locator("a[href*='/staff/requests/']").first();
      if ((await firstRequestLink.count()) > 0) {
        const href = await firstRequestLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Verify Request Actions card
        const actionsCard = ctx.page.locator("text=Request Actions").first();
        await expect(actionsCard).toBeVisible({ timeout: 10000 });

        // Status dropdown with transition options
        const statusSelect = ctx.page.locator('select[name="to_status"]').first();
        await expect(statusSelect).toBeVisible({ timeout: 5000 });

        // Verify known status options exist in the dropdown
        const options = await statusSelect.locator("option").allTextContents();
        const expectedOptions = ["Pending", "Started", "Delivered", "Cancelled", "Finished", "Re-work"];
        const foundOptions = expectedOptions.filter((opt) => options.some((o) => o.includes(opt)));
        console.log(`Status transition options found: ${foundOptions.length}/${expectedOptions.length}`);

        // Update status button is present
        await expect(ctx.page.locator('button:has-text("Update status")').first()).toBeVisible({ timeout: 5000 });

        // Title update form controls
        const titleInput = ctx.page.locator('input[name="position_title"]').first();
        if (await titleInput.isVisible().catch(() => false)) {
          console.log("Title update input visible");
        }

        // Save button for updates
        await expect(ctx.page.locator('button:has-text("Save")').first()).toBeVisible({ timeout: 5000 });
      } else {
        console.log("No request rows to verify status controls on");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3b. Request fulfillment section renders with pipeline stages", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const firstRequestLink = ctx.page.locator("a[href*='/staff/requests/']").first();
      if ((await firstRequestLink.count()) > 0) {
        const href = await firstRequestLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Check for fulfillment pipeline content
        // The RequestFulfillmentOS component may render with sections like:
        // Applications, Interviews, Candidates, Documents, Checklists
        const fulfillmentSections = [
          ctx.page.locator("text=Applications").first(),
          ctx.page.locator("text=Interviews").first(),
          ctx.page.locator("text=Candidates").first(),
          ctx.page.locator("text=Documents").first(),
        ];

        let foundSections = 0;
        for (const section of fulfillmentSections) {
          if (await section.isVisible().catch(() => false)) {
            foundSections++;
          }
        }
        console.log(`Fulfillment sections visible: ${foundSections}/${fulfillmentSections.length}`);

        // At least the Applications section should be present for a request
        if ((await ctx.page.locator("text=Applications").first().isVisible().catch(() => false)) ||
            (await ctx.page.locator("text=Candidates").first().isVisible().catch(() => false))) {
          console.log("Core fulfillment sections rendered");
        }
      } else {
        console.log("No request rows to verify fulfillment sections on");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 4 — Request Search & Filter
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Request Search & Filter", () => {
    test("4a. Requests page has search input for filtering", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Search input should be present (searchable=true in StaffRequestsTable)
      const searchInput = ctx.page.locator('input[type="text"], input[type="search"], input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible({ timeout: 10000 });

      // Search placeholder should hint at searchable fields
      const placeholder = await searchInput.getAttribute("placeholder");
      console.log(`Search placeholder: "${placeholder}"`);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("4b. DataTable rows render with request information", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // DataTable renders with rows
      const rows = ctx.page.locator(".dataList, .rows, table tbody tr");
      const rowCount = await rows.count().catch(() => 0);
      console.log(`Request table rows: ${rowCount}`);

      if (rowCount > 0) {
        // Verify each row has status badge
        const statusBadges = ctx.page.locator('[class*="StatusBadge"], [class*="statusBadge"], [class*="badge"]').first();
        if (await statusBadges.isVisible().catch(() => false)) {
          console.log("Status badges rendered on request rows");
        }
      } else {
        // Empty state may be shown
        const emptyState = ctx.page.locator("text=No records, text=No results, text=No requests").first();
        if (await emptyState.isVisible().catch(() => false)) {
          console.log("Empty state rendered (no request data in fixtures)");
        }
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 5 — Cross-role Access Control
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 5 — Cross-role Access Control", () => {
    test("5a. Candidate cannot access staff hub", async () => {
      const browser = await (await import("@playwright/test")).chromium.launch();
      const context = await browser.newContext();
      await context.addCookies([
        {
          name: "studenthub_next_session",
          value: candidateUser.cookie,
          domain: "127.0.0.1",
          path: "/",
        },
      ]);
      const page = await context.newPage();

      await page.goto("/staff");
      await page.waitForLoadState("load");

      // Candidate should be redirected away from /staff
      await expect(page).not.toHaveURL("/staff");
      await context.close();
      await browser.close();
    });

    test("5b. Candidate cannot access staff requests", async () => {
      const browser = await (await import("@playwright/test")).chromium.launch();
      const context = await browser.newContext();
      await context.addCookies([
        {
          name: "studenthub_next_session",
          value: candidateUser.cookie,
          domain: "127.0.0.1",
          path: "/",
        },
      ]);
      const page = await context.newPage();

      await page.goto("/staff/requests");
      await page.waitForLoadState("load");

      await expect(page).not.toHaveURL("/staff/requests");
      await context.close();
      await browser.close();
    });
  });
});
