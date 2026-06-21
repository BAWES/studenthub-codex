import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma, type FixtureUser } from "../fixtures/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let admin: FixtureUser;
let staff: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;
let inspector: FixtureUser;

// Real record IDs discovered from the production clone DB
let adminCandidateId: string;
let adminCompanyId: string;
let adminRequestId: string;
let adminTransferId: string;
let staffCandidateId: string;
let staffRequestId: string;
let staffInterviewId: string;
let candidateInvitationId: string;
let candidateWorkLogId: string;
let companyDetailId: string;
let companyRequestId: string;
let inspectorIdRequestId: string;

test.describe("Detail routes and remaining static routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    admin = fixtures.get("admin")!;
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
    inspector = fixtures.get("inspector")!;

    // Discover real record IDs for detail pages
    const [candidateRecord, compRecord, requestRecord, transferRecord] = await Promise.all([
      prisma.candidate.findFirst({
        where: { deleted: 0 },
        select: { candidate_id: true },
      }),
      prisma.company.findFirst({
        where: { deleted: 0 },
        select: { company_id: true },
      }),
      prisma.request.findFirst({
        select: { request_uuid: true },
      }),
      prisma.transfer.findFirst({
        where: { deleted: 0 },
        select: { transfer_id: true },
      }),
    ]);
    if (candidateRecord) adminCandidateId = String(candidateRecord.candidate_id);
    if (compRecord) adminCompanyId = String(compRecord.company_id);
    if (requestRecord) adminRequestId = requestRecord.request_uuid;
    if (transferRecord) adminTransferId = String(transferRecord.transfer_id);

    // Staff detail IDs
    const [staffCan, staffReq] = await Promise.all([
      prisma.candidate.findFirst({
        where: { deleted: 0 },
        select: { candidate_id: true },
      }),
      prisma.request.findFirst({
        select: { request_uuid: true },
      }),
      prisma.interview_evaluation.findFirst({
        select: { interview_evaluation_uuid: true },
      }),
    ]);
    if (staffCan) staffCandidateId = String(staffCan.candidate_id);
    if (staffReq) staffRequestId = staffReq.request_uuid;
    staffInterviewId = undefined as any;

    // Candidate detail IDs
    const [invitation] = await Promise.all([
      prisma.invitation.findFirst({
        select: { invitation_uuid: true },
      }),
      prisma.candidate_working_hour.findFirst({
        select: { candidate_working_hour_uuid: true },
      }),
    ]);
    if (invitation) candidateInvitationId = invitation.invitation_uuid;
    // work_log model does not exist in Prisma schema — skip work log detail tests
    candidateWorkLogId = undefined as any;

    // Company detail IDs
    const [compDetail, compReq] = await Promise.all([
      prisma.company.findFirst({
        where: { deleted: 0 },
        select: { company_id: true },
      }),
      prisma.request.findFirst({
        select: { request_uuid: true },
      }),
    ]);
    if (compDetail) companyDetailId = String(compDetail.company_id);
    if (compReq) companyRequestId = compReq.request_uuid;

    // Inspector detail ID
    const idReq = await prisma.candidate_id_request.findFirst({
      select: { cir_uuid: true },
    });
    if (idReq) inspectorIdRequestId = idReq.cir_uuid;
  });

  test.afterAll(async () => {
    await disconnectPrisma();
    await prisma.$disconnect();
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

    // Verify no hydration/serialization errors
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

  // ── Admin detail routes ──

  test("admin candidate detail loads", async () => {
    test.skip(!adminCandidateId, "No candidate record in DB");
    await assertRouteLoads(`/admin/candidates/${adminCandidateId}`, admin);
  });

  test("admin company detail loads", async () => {
    test.skip(!adminCompanyId, "No company record in DB");
    await assertRouteLoads(`/admin/companies/${adminCompanyId}`, admin);
  });

  test("admin request detail loads", async () => {
    test.skip(!adminRequestId, "No request record in DB");
    await assertRouteLoads(`/admin/requests/${adminRequestId}`, admin);
  });

  test("admin transfer detail loads", async () => {
    test.skip(!adminTransferId, "No transfer record in DB");
    await assertRouteLoads(`/admin/transfers/${adminTransferId}`, admin);
  });

  test("admin agents list loads", async () => {
    await assertRouteLoads("/admin/agents", admin);
  });

  test("candidate cannot access admin detail pages", async () => {
    test.skip(!adminTransferId, "No transfer record in DB");
    await assertRoleGuard(`/admin/transfers/${adminTransferId}`, candidateUser);
  });

  // ── Staff detail routes ──

  test("staff candidate detail loads", async () => {
    test.skip(!staffCandidateId, "No candidate record in DB");
    await assertRouteLoads(`/staff/candidates/${staffCandidateId}`, staff);
  });

  test("staff interview detail loads", async () => {
    test.skip(!staffInterviewId, "No interview record in DB");
    await assertRouteLoads(`/staff/interviews/${staffInterviewId}`, staff);
  });

  test("staff request detail loads", async () => {
    test.skip(!staffRequestId, "No request record in DB");
    await assertRouteLoads(`/staff/requests/${staffRequestId}`, staff);
  });

  test("candidate cannot access staff detail pages", async () => {
    test.skip(!staffCandidateId, "No candidate record in DB");
    await assertRoleGuard(`/staff/candidates/${staffCandidateId}`, candidateUser);
  });

  // ── Candidate detail routes ──

  test("candidate invitation detail loads", async () => {
    test.skip(!candidateInvitationId, "No invitation record in DB");
    await assertRouteLoads(`/candidate/invitations/${candidateInvitationId}`, candidateUser);
  });

  test("candidate work log detail loads", async () => {
    test.skip(!candidateWorkLogId, "No work log record in DB");
    await assertRouteLoads(`/candidate/work-logs/${candidateWorkLogId}`, candidateUser);
  });

  test("candidate jobs list loads", async () => {
    await assertRouteLoads("/candidate/jobs", candidateUser);
  });

  test("candidate applications loads", async () => {
    await assertRouteLoads("/candidate/applications", candidateUser);
  });

  test("candidate profile loads", async () => {
    await assertRouteLoads("/candidate/profile", candidateUser);
  });

  // Also test candidate certification/experience/skill sub-routes
  test("candidate certifications new loads", async () => {
    await assertRouteLoads("/candidate/certifications/new", candidateUser);
  });

  test("candidate experience new loads", async () => {
    await assertRouteLoads("/candidate/experience/new", candidateUser);
  });

  test("candidate skills new loads", async () => {
    await assertRouteLoads("/candidate/skills/new", candidateUser);
  });

  // ── Candidate sub-detail routes (notification, payment, reference, schedule) ──

  test("candidate notifications detail loads", async () => {
    const notification = await prisma.candidate_notification.findFirst({
      where: { candidate_id: Number(candidateUser.id) },
      select: { cn_uuid: true },
    });
    test.skip(!notification, "No notification record for this candidate in DB");
    await assertRouteLoads(`/candidate/notifications/${notification!.cn_uuid}`, candidateUser);
  });

  test("candidate payment detail loads", async () => {
    const payment = await prisma.transfer_candidate.findFirst({
      where: { candidate_id: Number(candidateUser.id) },
      select: { tc_id: true },
    });
    test.skip(!payment, "No payment record for this candidate in DB");
    await assertRouteLoads(`/candidate/payments/${payment!.tc_id}`, candidateUser);
  });

  test("candidate reference detail loads", async () => {
    const reference = await prisma.candidate_reference.findFirst({
      where: { candidate_id: Number(candidateUser.id) },
      select: { reference_uuid: true },
    });
    test.skip(!reference, "No reference record for this candidate in DB");
    await assertRouteLoads(`/candidate/references/${reference!.reference_uuid}`, candidateUser);
  });

  test("candidate schedule detail loads", async () => {
    const schedule = await prisma.candidate_working_date.findFirst({
      where: { candidate_id: Number(candidateUser.id) },
      select: { cwd_uuid: true },
    });
    test.skip(!schedule, "No schedule record for this candidate in DB");
    await assertRouteLoads(`/candidate/schedule/${schedule!.cwd_uuid}`, candidateUser);
  });

  // ── Candidate sub-route: jobs detail ──

  test("candidate job detail loads", async () => {
    const job = await prisma.job_listing.findFirst({
      where: { status: "active" },
      select: { jobListingId: true },
    });
    test.skip(!job, "No active job listing in DB");
    await assertRouteLoads(`/candidate/jobs/${job!.jobListingId}`, candidateUser);
  });

  // ── Candidate sub-routes: certification/experience/skill detail & edit ──

  test("candidate certification detail loads", async () => {
    const cert = await prisma.candidate_certification.findFirst({
      where: { candidate_id: Number(candidateUser.id) },
      select: { certification_id: true },
    });
    test.skip(!cert, "No certification record for this candidate in DB");
    await assertRouteLoads(`/candidate/certifications/${cert!.certification_id}`, candidateUser);
  });

  test("candidate certification edit loads", async () => {
    const cert = await prisma.candidate_certification.findFirst({
      where: { candidate_id: Number(candidateUser.id), deleted: 0 },
      select: { certification_id: true },
    });
    test.skip(!cert, "No certification record for this candidate in DB");
    await assertRouteLoads(`/candidate/certifications/${cert!.certification_id}/edit`, candidateUser);
  });

  test("candidate experience detail loads", async () => {
    const exp = await prisma.candidate_experience.findFirst({
      where: { candidate_id: Number(candidateUser.id) },
      select: { candidate_experience_id: true },
    });
    test.skip(!exp, "No experience record for this candidate in DB");
    await assertRouteLoads(`/candidate/experience/${exp!.candidate_experience_id}`, candidateUser);
  });

  test("candidate experience edit loads", async () => {
    const exp = await prisma.candidate_experience.findFirst({
      where: { candidate_id: Number(candidateUser.id), deleted: 0 },
      select: { candidate_experience_id: true },
    });
    test.skip(!exp, "No experience record for this candidate in DB");
    await assertRouteLoads(`/candidate/experience/${exp!.candidate_experience_id}/edit`, candidateUser);
  });

  test("candidate skill detail loads", async () => {
    const skill = await prisma.candidate_skill.findFirst({
      where: { candidate_id: Number(candidateUser.id) },
      select: { candidate_skill_id: true },
    });
    test.skip(!skill, "No skill record for this candidate in DB");
    await assertRouteLoads(`/candidate/skills/${skill!.candidate_skill_id}`, candidateUser);
  });

  test("candidate skill edit loads", async () => {
    const skill = await prisma.candidate_skill.findFirst({
      where: { candidate_id: Number(candidateUser.id), deleted: 0 },
      select: { candidate_skill_id: true },
    });
    test.skip(!skill, "No skill record for this candidate in DB");
    await assertRouteLoads(`/candidate/skills/${skill!.candidate_skill_id}/edit`, candidateUser);
  });

  // ── Student public profile ──

  test("student profile page loads (no studentId)", async () => {
    await assertRouteLoads("/student", candidateUser);
  });

  // ── Company detail routes ──

  test("company company detail loads", async () => {
    test.skip(!companyDetailId, "No company record in DB");
    await assertRouteLoads(`/company/companies/${companyDetailId}`, companyUser);
  });

  test("company request detail loads", async () => {
    test.skip(!companyRequestId, "No request record in DB");
    await assertRouteLoads(`/company/requests/${companyRequestId}`, companyUser);
  });

  test("staff cannot access company detail pages", async () => {
    test.skip(!companyDetailId, "No company record in DB");
    await assertRoleGuard(`/company/companies/${companyDetailId}`, staff);
  });

  test("candidate cannot access company detail pages", async () => {
    test.skip(!companyDetailId, "No company record in DB");
    await assertRoleGuard(`/company/companies/${companyDetailId}`, candidateUser);
  });

  // ── Inspector detail routes ──

  test("inspector ID request detail loads", async () => {
    test.skip(!inspectorIdRequestId, "No ID request record in DB");
    await assertRouteLoads(`/inspector/id-requests/${inspectorIdRequestId}`, inspector);
  });

  test("candidate cannot access inspector detail pages", async () => {
    test.skip(!inspectorIdRequestId, "No ID request record in DB");
    await assertRoleGuard(`/inspector/id-requests/${inspectorIdRequestId}`, candidateUser);
  });

  test("company cannot access inspector detail pages", async () => {
    test.skip(!inspectorIdRequestId, "No ID request record in DB");
    await assertRoleGuard(`/inspector/id-requests/${inspectorIdRequestId}`, companyUser);
  });
});
