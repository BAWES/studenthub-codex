import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let company: FixtureUser;
let staff: FixtureUser;
let candidateUser: FixtureUser;
let jobId: string | null = null;
let applicationId: string | null = null;

test.describe("Employer detail routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;

    // Try to discover a job listing from the seed DB (used in CI).
    // No DB dependency for auth — only for the dynamic job ID.
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const job = await prisma.job_listing.findFirst({
        where: { status: "active" },
        select: { jobListingId: true },
      });
      if (job) jobId = String(job.jobListingId);

      // Try to discover a job application from the seed DB.
      const app = await prisma.job_listing_application.findFirst({
        select: { id: true },
      });
      if (app) applicationId = String(app.id);
      await prisma.$disconnect();
    } catch {
      // No DB available — tests requiring jobId will skip gracefully
    }
  });

  async function assertRouteLoads(route: string, fixtureUser: FixtureUser) {
    const consoleMessages: string[] = [];
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: fixtureUser.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleMessages.push(msg.text());
    });
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    const errors = consoleMessages.filter(
      (m) => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"),
    );
    expect(errors).toEqual([]);
    await bContext.close();
    await browser.close();
  }

  async function assertRoleGuard(route: string, wrongRole: FixtureUser) {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: wrongRole.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto(route);
    await expect(page).not.toHaveURL(route);
    await bContext.close();
    await browser.close();
  }

  test("employer job detail loads", async () => {
    test.skip(!jobId, "No job listing record in DB");
    await assertRouteLoads(`/employer/jobs/${jobId}`, company);
  });

  test("employer job applications loads", async () => {
    test.skip(!jobId, "No job listing record in DB");
    await assertRouteLoads(`/employer/jobs/${jobId}/applications`, company);
  });

  test("staff cannot access employer job detail", async () => {
    test.skip(!jobId, "No job listing record in DB");
    await assertRoleGuard(`/employer/jobs/${jobId}`, staff);
  });

  test("candidate cannot access employer job detail", async () => {
    test.skip(!jobId, "No job listing record in DB");
    await assertRoleGuard(`/employer/jobs/${jobId}`, candidateUser);
  });

  test("employer application detail loads", async () => {
    test.skip(!applicationId, "No job application record in DB");
    await assertRouteLoads(`/employer/applications/${applicationId}`, company);
  });

  test("staff cannot access employer application detail", async () => {
    test.skip(!applicationId, "No job application record in DB");
    await assertRoleGuard(`/employer/applications/${applicationId}`, staff);
  });

  test("candidate cannot access employer application detail", async () => {
    test.skip(!applicationId, "No job application record in DB");
    await assertRoleGuard(`/employer/applications/${applicationId}`, candidateUser);
  });
});
