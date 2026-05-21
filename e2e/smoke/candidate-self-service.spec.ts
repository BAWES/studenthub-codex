import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma } from "../fixtures/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await disconnectPrisma();
  await prisma.$disconnect();
});

test.describe("Candidate self-service — mobile smoke", () => {
  test.describe.configure({ mode: "serial" });

  const iphoneViewport = { width: 390, height: 844 };

  let candidateCookie: string;
  let candidateId: string;
  let candidateName: string;
  let ownInvitationUuid: string | null = null;
  let ownWorkLogUuid: string | null = null;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    const candidate = fixtures.get("candidate")!;
    candidateCookie = candidate.cookie;
    candidateId = candidate.id;
    candidateName = candidate.name;

    const [inv, wl] = await Promise.all([
      prisma.invitation.findFirst({
        where: { candidate_id: Number(candidateId) },
        select: { invitation_uuid: true },
      }),
      prisma.candidate_working_hour.findFirst({
        where: { candidate_id: Number(candidateId) },
        select: { candidate_working_hour_uuid: true },
      }),
    ]);
    ownInvitationUuid = inv?.invitation_uuid ?? null;
    ownWorkLogUuid = wl?.candidate_working_hour_uuid ?? null;
  });

  // ── Profile page ──

  test("profile page loads with readiness score and missing fields", async ({ browser }) => {
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate");

    // Readiness section
    await expect(page.locator('text="Readiness"')).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".candidateReadinessScore strong")).toBeVisible();
    await expect(page.locator(".candidateReadinessItems")).toBeVisible();

    // All four section action links visible on profile
    const actions = page.locator(".candidateProfileActions");
    await expect(actions.getByRole("link", { name: "Edit profile" })).toBeVisible();
    await expect(actions.getByRole("link", { name: "Invitations" })).toBeVisible();
    await expect(actions.getByRole("link", { name: "Work logs" })).toBeVisible();
    await expect(actions.getByRole("link", { name: "Payments" })).toBeVisible();

    await context.close();
  });

  test("profile page shows candidate avatar, name, and status", async ({ browser }) => {
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate");

    await expect(page.locator(".candidateAvatar")).toBeVisible();
    await expect(page.locator(".candidateProfileTitle h2")).toBeVisible();
    await expect(page.locator(".candidateStatusLine")).toBeVisible();

    // Fact grid is present
    await expect(page.locator(".candidateFactGrid")).toBeVisible();

    await context.close();
  });

  // ── Invitations ──

  test("invitations list loads with Invitation History heading", async ({ browser }) => {
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/invitations");

    await expect(page).toHaveURL("/candidate/invitations");
    await expect(page.locator('text="Invitation History"')).toBeVisible({ timeout: 15000 });

    await context.close();
  });

  test("invitation detail loads with respond form or response status", async ({ browser }) => {
    if (!ownInvitationUuid) {
      test.skip();
      return;
    }
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto(`/candidate/invitations/${ownInvitationUuid}`);

    // Either the respond form or the "already responded" message should be visible
    await expect(
      page.locator('text="Respond to Invitation"').or(page.locator('text="Response"'))
    ).toBeVisible({ timeout: 15000 });

    // Invitation brief panel
    await expect(page.locator('text="Invitation Brief"')).toBeVisible();

    await context.close();
  });

  // ── Work logs ──

  test("work logs list loads with Work Log History heading", async ({ browser }) => {
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/work-logs");

    await expect(page).toHaveURL("/candidate/work-logs");
    await expect(page.locator('text="Work Log History"')).toBeVisible({ timeout: 15000 });

    await context.close();
  });

  test("work log detail loads with appeal form and shift record", async ({ browser }) => {
    if (!ownWorkLogUuid) {
      test.skip();
      return;
    }
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto(`/candidate/work-logs/${ownWorkLogUuid}`);

    // Appeal form or shift record facts should be visible
    await expect(
      page.locator('text="Appeal this Work Log"').or(page.locator('text="Shift Record"'))
    ).toBeVisible({ timeout: 15000 });

    await context.close();
  });

  // ── Payments ──

  test("payments page loads with Transfer & Payment History heading", async ({ browser }) => {
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/payments");

    await expect(page).toHaveURL("/candidate/payments");
    await expect(page.locator('text="Transfer & Payment History"')).toBeVisible({ timeout: 15000 });

    await context.close();
  });

  // ── Edit profile ──

  test("edit profile page loads with form fields", async ({ browser }) => {
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate/edit");

    await expect(page).toHaveURL("/candidate/edit");
    await expect(page.locator('text="Update your candidate profile"')).toBeVisible({ timeout: 15000 });
    // Key form inputs present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();

    await context.close();
  });

  // ── Navigation: all four sections reachable in 1 tap from profile ──

  test("all four sections reachable from profile in 1 tap each", async ({ browser }) => {
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();

    const sections: { name: string; urlFragment: string }[] = [
      { name: "Edit profile", urlFragment: "/candidate/edit" },
      { name: "Invitations", urlFragment: "/candidate/invitations" },
      { name: "Work logs", urlFragment: "/candidate/work-logs" },
      { name: "Payments", urlFragment: "/candidate/payments" },
    ];

    for (const section of sections) {
      await page.goto("/candidate");
      await page.waitForSelector('text="Readiness"', { timeout: 15000 });
      const link = page.locator(".candidateProfileActions").getByRole("link", { name: section.name });
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(new RegExp(section.urlFragment.replace("/", "\\/")));
    }

    await context.close();
  });

  // ── Auth / access control ──

  test("unauthenticated mobile access redirects to login", async ({ page }) => {
    await page.setViewportSize(iphoneViewport);
    const paths = [
      "/candidate",
      "/candidate/invitations",
      "/candidate/work-logs",
      "/candidate/payments",
      "/candidate/edit",
    ];
    for (const path of paths) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("candidate cannot access another candidate's invitation", async ({ browser }) => {
    const other = await prisma.candidate.findFirst({
      where: { candidate_id: { not: Number(candidateId) }, deleted: 0 },
      select: { candidate_id: true },
    });
    if (!other) {
      test.skip();
      return;
    }
    const otherInv = await prisma.invitation.findFirst({
      where: { candidate_id: other.candidate_id },
      select: { invitation_uuid: true },
    });
    if (!otherInv) {
      test.skip();
      return;
    }

    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: candidateCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto(`/candidate/invitations/${otherInv.invitation_uuid}`);

    // Should NOT show invitation detail content — ownership is enforced server-side
    await expect(page.locator('text="Respond to Invitation"')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="Invitation Brief"')).not.toBeVisible({ timeout: 5000 });

    await context.close();
  });

  test("non-candidate role cannot access candidate portal", async ({ browser }) => {
    const fixtures = getFixtures();
    // Use a different role's cookie
    const staff = (await fixtures).get("staff")!;
    const context = await browser.newContext({ viewport: iphoneViewport });
    await context.addCookies([
      { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/candidate");
    await expect(page).not.toHaveURL("/candidate");
    await context.close();
  });
});
