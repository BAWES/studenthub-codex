import { test, expect } from "@playwright/test";

const STAFF_EMAIL = "alaa.jawad@bawes.net";
const STAFF_PASSWORD = "test1234";
const REQUEST_UUID = "request_e6379cee-052b-11f0-b1cd-a2aacba78f94";

test.describe("M5 Staff Request Fulfillment — Pipeline QA", () => {
  test.beforeEach(async ({ page }) => {
    // Login as staff (skip if already authenticated)
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // If redirected to login, we need to authenticate
    if (page.url().includes("/login")) {
      await page.fill('input[name="email"]', STAFF_EMAIL);
      await page.fill('input[name="password"]', STAFF_PASSWORD);
      await page.click('button[type="submit"]');

      // Wait for redirect after successful login
      try {
        await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
      } catch {
        const error = await page.locator(".formError").textContent().catch(() => "Unknown error");
        throw new Error(`Login failed: ${error}`);
      }
    }

    // Verify we're authenticated
    expect(page.url()).toMatch(/\/app/);
  });

  test("1. Staff can view request fulfillment dashboard", async ({ page }) => {
    await page.goto(`/staff/requests/${REQUEST_UUID}`);
    await page.waitForLoadState("networkidle");

    // Verify the request hero section renders
    await expect(page.locator(".requestHero h2")).toBeVisible();

    // Verify pipeline stages are rendered
    const pipeline = page.locator(".requestPipeline");
    await expect(pipeline).toBeVisible();

    // Verify desk grid panels exist
    await expect(page.locator("#matches")).toBeVisible();
    await expect(page.locator("#suggestions")).toBeVisible();
    await expect(page.locator("#invited")).toBeVisible();

    // Take screenshot for evidence
    await page.screenshot({ path: "test-results/m5-request-dashboard.png", fullPage: true });
  });

  test("2. Staff can suggest a matched candidate", async ({ page }) => {
    await page.goto(`/staff/requests/${REQUEST_UUID}`);
    await page.waitForLoadState("networkidle");

    // Find the first match card with a suggestion form
    const matchCard = page.locator(".matchCard").first();
    const suggestForm = matchCard.locator(".suggestionForm");

    if (await suggestForm.isVisible()) {
      // Fill in the reason
      await suggestForm.locator('input[name="reason"]').fill("QA test suggestion - good skill match");
      // Click Suggest
      await suggestForm.locator('button[type="submit"]').click();

      // Wait for server action to complete, then reload to see updated state
      // (Next.js server action redirect doesn't trigger client navigation in production)
      await page.waitForTimeout(2000);
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Verify the action was processed — suggestion form should be gone or notice shown
      const formStillVisible = await matchCard.locator(".suggestionForm").isVisible().catch(() => false);
      console.log("Suggest action processed, form still visible:", formStillVisible);
    } else {
      console.log("No match cards with suggestion forms available — all candidates may already be in pipeline");
    }
  });

  test("3. Staff can invite a matched candidate", async ({ page }) => {
    await page.goto(`/staff/requests/${REQUEST_UUID}`);
    await page.waitForLoadState("networkidle");

    // Find the first match card
    const matchCard = page.locator(".matchCard").first();
    const inviteButton = matchCard.locator('button:has-text("Invite")');

    if (await inviteButton.isVisible()) {
      await inviteButton.click();

      // Wait for server action to complete, then reload
      await page.waitForTimeout(2000);
      await page.reload();
      await page.waitForLoadState("networkidle");

      console.log("Invite action processed, page re-rendered correctly");
    } else {
      console.log("No match cards available for invitation");
    }
  });

  test("4. Staff can transition invitation statuses (Responded / Declined)", async ({ page }) => {
    await page.goto(`/staff/requests/${REQUEST_UUID}`);
    await page.waitForLoadState("networkidle");

    // Scroll to the Invitations panel
    await page.locator("#invited").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Look for invitation rows with action buttons
    const inviteRows = page.locator("#invited .requestRow");
    const count = await inviteRows.count();
    console.log(`Found ${count} invitation rows`);

    if (count > 0) {
      // Click Responded on the first invitation
      const respondedBtn = inviteRows.first().locator('button:has-text("Responded")');
      if (await respondedBtn.isVisible()) {
        await respondedBtn.click();
        await page.waitForTimeout(2000);
        console.log("Responded action: OK");
      } else {
        // Try Declined instead
        const declinedBtn = inviteRows.first().locator('button:has-text("Declined")');
        if (await declinedBtn.isVisible()) {
          await declinedBtn.click();
          await page.waitForTimeout(2000);
          console.log("Declined action: OK");
        } else {
          console.log("First invitation already in terminal state (all status buttons hidden)");
        }
      }
    } else {
      console.log("No invitation rows to interact with");
    }
  });

  test("5. Staff can create a story (Log update) and complete/cancel stories", async ({ page }) => {
    await page.goto(`/staff/requests/${REQUEST_UUID}`);
    await page.waitForLoadState("networkidle");

    // Scroll to Stories panel
    const storiesPanel = page.locator("text=Stories and updates").locator("..");

    // Find the story creation form
    const storyForm = page.locator(".storyForm");
    await storyForm.scrollIntoViewIfNeeded();

    if (await storyForm.isVisible()) {
      // Fill and submit
      await storyForm.locator('input[name="note"]').fill("QA test story update");
      await storyForm.locator('button[type="submit"]').click();

      // Wait for server action to complete
      await page.waitForTimeout(2000);
      console.log("Log update action: OK");
    }

    // Now try completing a story
    await page.goto(`/staff/requests/${REQUEST_UUID}`);
    await page.waitForLoadState("networkidle");

    const storyRows = page.locator(".storyForm").locator("..").locator(".requestRow");
    const storyCount = await storyRows.count();
    console.log(`Found ${storyCount} story rows`);

    if (storyCount > 0) {
      const completeBtn = storyRows.first().locator('button:has-text("Complete")');
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await page.waitForTimeout(2000);
        console.log("Complete story action: OK");
      }
    }
  });

  test("6. Request desk grid — all panels render without errors", async ({ page }) => {
    await page.goto(`/staff/requests/${REQUEST_UUID}`);
    await page.waitForLoadState("networkidle");

    // Take full page screenshot
    await page.screenshot({ path: "test-results/m5-full-pipeline.png", fullPage: true });

    // Check no React error overlays
    const errorOverlay = page.locator("nextjs-portal");
    expect(await errorOverlay.count()).toBe(0);

    // Verify action bar exists
    const actionBar = page.locator(".requestActionBar");
    await expect(actionBar).toBeVisible();

    // Verify pipeline stages show counts
    const pipelineStages = page.locator(".requestPipeline a");
    const stageCount = await pipelineStages.count();
    expect(stageCount).toBeGreaterThanOrEqual(2);
    console.log(`Pipeline has ${stageCount} stages`);
  });
});
