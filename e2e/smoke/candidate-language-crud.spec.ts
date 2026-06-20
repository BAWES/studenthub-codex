import { test, expect } from "@playwright/test";
import { getFixtures } from "../fixtures/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe("Candidate language CRUD", () => {
  test.describe.configure({ mode: "serial" });

  const mobileViewport = { width: 390, height: 844 };

  let candidateCookie: string;
  let candidateId: number;
  let languageIdToRemove: number | null = null;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    const candidate = fixtures.get("candidate")!;
    candidateCookie = candidate.cookie;
    candidateId = Number(candidate.id);

    // Clean up leftovers from earlier runs
    await prisma.candidate_language.updateMany({
      where: { candidate_id: candidateId, language: "E2E Test Lang" },
      data: { deleted: 1 },
    });
  });

  test("displays Languages section and add form on edit profile page", async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: candidateCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/edit");

    await expect(page.locator('h2:has-text("Languages")')).toBeVisible({
      timeout: 15000,
    });

    // Form controls
    await expect(page.locator('select[name="language"]')).toBeVisible();
    await expect(page.locator('select[name="proficiency"]')).toBeVisible();
    await expect(
      page.locator('button:has-text("Add language")'),
    ).toBeVisible();

    await context.close();
  });

  test("shows 'No languages added yet.' when list is empty", async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: candidateCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/edit");

    // Either "No languages added yet." or the editable list exists
    const hasAnyLanguages = await page
      .locator(".editableList li")
      .count()
      .then((c) => c > 0);
    const hasEmptyNotice = await page
      .locator('text="No languages added yet."')
      .isVisible()
      .catch(() => false);

    expect(hasAnyLanguages || hasEmptyNotice).toBe(true);

    await context.close();
  });

  test("adds a language and sees it appear in the list", async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: candidateCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/edit");

    await expect(page.locator('h2:has-text("Languages")')).toBeVisible({
      timeout: 15000,
    });

    // Select language
    await page.selectOption('select[name="language"]', "E2E Test Lang");
    // Select proficiency
    await page.selectOption('select[name="proficiency"]', "native");

    // Submit
    await page.locator('button:has-text("Add language")').click();

    // Wait for toast or list update
    await expect(
      page.locator('text="Language added"').or(page.locator(".editableList")),
    ).toBeVisible({ timeout: 10000 });

    // The new language should appear in the list
    const listItem = page.locator(".editableList li", {
      hasText: "E2E Test Lang",
    });
    await expect(listItem).toBeVisible({ timeout: 10000 });

    // Proficiency badge
    await expect(listItem.locator(".proficiencyBadge")).toHaveText("native");

    await context.close();
  });

  test("removes a language and sees it disappear", async ({ browser }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: candidateCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/edit");

    await expect(page.locator('h2:has-text("Languages")')).toBeVisible({
      timeout: 15000,
    });

    // Verify the language exists from the previous test
    const listItem = page.locator(".editableList li", {
      hasText: "E2E Test Lang",
    });
    await expect(listItem).toBeVisible({ timeout: 10000 });

    // Click Remove
    await listItem.locator('button:has-text("Remove")').click();

    // Toast or item gone
    await expect(
      page
        .locator('text="Language removed"')
        .or(page.locator(".editableList li", { hasText: "E2E Test Lang" })),
    ).toBeVisible({ timeout: 10000 });

    // The item should be gone (or the empty notice appears)
    const gone = await page
      .locator(".editableList li", { hasText: "E2E Test Lang" })
      .isHidden()
      .catch(() => true);
    const emptyNotice = await page
      .locator('text="No languages added yet."')
      .isVisible()
      .catch(() => false);

    expect(gone || emptyNotice).toBe(true);

    await context.close();
  });

  test("admin/staff cannot access candidate edit page", async ({
    browser,
  }) => {
    const fixtures = await getFixtures();
    const staff = fixtures.get("staff")!;

    const context = await browser.newContext({ viewport: mobileViewport });
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: staff.cookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/edit");

    // Should redirect away from candidate edit
    await expect(page).not.toHaveURL("/candidate/edit");

    await context.close();
  });
});
