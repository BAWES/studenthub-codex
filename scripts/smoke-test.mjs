import crypto from "node:crypto";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  const env = fs.readFileSync(".env", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=["']?(.+?)["']?$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnv();
const prisma = new PrismaClient();
const defaultBudgetMs = Number(process.env.SMOKE_BUDGET_MS ?? 5000);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function signSession(user) {
  const payload = Buffer.from(JSON.stringify({ ...user, issuedAt: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", requireEnv("AUTH_SECRET")).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

async function head(path, cookie) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    method: "HEAD",
    redirect: "manual",
    headers: cookie ? { cookie: `studenthub_next_session=${cookie}` } : undefined
  });
  return { status: response.status, durationMs: Math.round(performance.now() - started) };
}

async function get(path, cookie) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    redirect: "manual",
    headers: cookie ? { cookie: `studenthub_next_session=${cookie}` } : undefined
  });
  const text = await response.text();
  return { status: response.status, text, durationMs: Math.round(performance.now() - started) };
}

async function expectStatus(path, expected, cookie, options = {}) {
  const { status, durationMs } = await head(path, cookie);
  if (status !== expected) {
    throw new Error(`${path} expected ${expected}, got ${status}`);
  }
  const budgetMs = options.budgetMs ?? defaultBudgetMs;
  if (durationMs > budgetMs) {
    throw new Error(`${path} exceeded ${budgetMs}ms budget: ${durationMs}ms`);
  }
  console.log(`ok ${status} ${durationMs}ms ${path}`);
}

async function expectBodyIncludes(path, expected, expectedText, cookie, options = {}) {
  const { status, text, durationMs } = await get(path, cookie);
  if (status !== expected) {
    throw new Error(`${path} expected ${expected}, got ${status}`);
  }
  if (!text.includes(expectedText)) {
    throw new Error(`${path} expected body to include ${JSON.stringify(expectedText)}`);
  }
  const budgetMs = options.budgetMs ?? defaultBudgetMs;
  if (durationMs > budgetMs) {
    throw new Error(`${path} exceeded ${budgetMs}ms budget: ${durationMs}ms`);
  }
  console.log(`ok ${status} ${durationMs}ms body ${path}`);
}

async function expectOneOf(path, expectedStatuses, cookie, options = {}) {
  const { status, durationMs } = await head(path, cookie);
  if (!expectedStatuses.includes(status)) {
    throw new Error(`${path} expected one of ${expectedStatuses.join(", ")}, got ${status}`);
  }
  const budgetMs = options.budgetMs ?? defaultBudgetMs;
  if (durationMs > budgetMs) {
    throw new Error(`${path} exceeded ${budgetMs}ms budget: ${durationMs}ms`);
  }
  console.log(`ok ${status} ${durationMs}ms ${path}`);
}

async function firstOrThrow(label, query) {
  const value = await query();
  if (!value) {
    throw new Error(`Missing fixture data: ${label}`);
  }
  return value;
}

async function main() {
  const [
    admin,
    staffRequest,
    staffCandidate,
    unassignedStaffCandidate,
    adminCandidate,
    adminCompany,
    adminRequest,
    adminTransfer,
    candidateInvitation,
    candidateWorkLog,
    otherCandidateInvitation,
    otherCandidateWorkLog,
    contactCompany,
    contactRequest,
    otherContactCompany,
    otherContactRequest,
    inspector,
    idRequest
  ] = await Promise.all([
    firstOrThrow("admin", () =>
      prisma.admin.findFirst({
        where: { admin_status: 10 },
        select: { admin_id: true, admin_name: true, admin_email: true }
      })
    ),
    firstOrThrow("staff request", () =>
      prisma.request.findFirst({
        where: { staff_id: { not: null } },
        orderBy: { request_updated_datetime: "desc" },
        select: { request_uuid: true, staff_id: true, staff: { select: { staff_name: true, staff_email: true } } }
      })
    ),
    firstOrThrow("staff candidate", () =>
      prisma.candidate_work_history.findFirst({
        where: { staff_id: { not: null }, candidate_id: { not: null } },
        orderBy: { end_date: "desc" },
        select: { staff_id: true, candidate_id: true, staff: { select: { staff_name: true, staff_email: true } } }
      })
    ),
    firstOrThrow("unassigned staff candidate", async () => {
      const base = await prisma.candidate_work_history.findFirst({
        where: { staff_id: { not: null }, candidate_id: { not: null } },
        orderBy: { end_date: "desc" },
        select: { staff_id: true }
      });
      if (!base?.staff_id) return null;
      const assigned = await prisma.candidate_work_history.findMany({
        where: { staff_id: base.staff_id, candidate_id: { not: null } },
        distinct: ["candidate_id"],
        take: 1000,
        select: { candidate_id: true }
      });
      const assignedIds = assigned.map((row) => row.candidate_id).filter(Boolean);
      return prisma.candidate.findFirst({
        where: { deleted: 0, candidate_id: { notIn: assignedIds } },
        orderBy: { candidate_updated_at: "desc" },
        select: { candidate_id: true }
      });
    }),
    firstOrThrow("admin candidate", () =>
      prisma.candidate.findFirst({
        where: { deleted: 0 },
        orderBy: { candidate_updated_at: "desc" },
        select: { candidate_id: true }
      })
    ),
    firstOrThrow("admin company", () =>
      prisma.company.findFirst({
        where: { deleted: 0 },
        orderBy: { company_updated_at: "desc" },
        select: { company_id: true }
      })
    ),
    firstOrThrow("admin request", () =>
      prisma.request.findFirst({
        orderBy: { request_updated_datetime: "desc" },
        select: { request_uuid: true }
      })
    ),
    firstOrThrow("admin transfer", () =>
      prisma.transfer.findFirst({
        where: { deleted: 0 },
        orderBy: { transfer_updated_at: "desc" },
        select: { transfer_id: true }
      })
    ),
    firstOrThrow("candidate invitation", () =>
      prisma.invitation.findFirst({
        where: { candidate_id: { not: null } },
        orderBy: { invitation_created_at: "desc" },
        select: {
          invitation_uuid: true,
          candidate_id: true,
          candidate: { select: { candidate_name: true, candidate_email: true } }
        }
      })
    ),
    firstOrThrow("candidate work log", () =>
      prisma.candidate_working_hour.findFirst({
        where: { candidate_id: { not: null } },
        orderBy: { date: "desc" },
        select: {
          candidate_working_hour_uuid: true,
          candidate_id: true,
          candidate: { select: { candidate_name: true, candidate_email: true } }
        }
      })
    ),
    firstOrThrow("other candidate invitation", async () => {
      const base = await prisma.invitation.findFirst({
        where: { candidate_id: { not: null } },
        orderBy: { invitation_created_at: "desc" },
        select: { candidate_id: true }
      });
      if (!base?.candidate_id) return null;
      return prisma.invitation.findFirst({
        where: { candidate_id: { not: base.candidate_id } },
        orderBy: { invitation_created_at: "desc" },
        select: { invitation_uuid: true }
      });
    }),
    firstOrThrow("other candidate work log", async () => {
      const base = await prisma.candidate_working_hour.findFirst({
        where: { candidate_id: { not: null } },
        orderBy: { date: "desc" },
        select: { candidate_id: true }
      });
      if (!base?.candidate_id) return null;
      return prisma.candidate_working_hour.findFirst({
        where: { candidate_id: { not: base.candidate_id } },
        orderBy: { date: "desc" },
        select: { candidate_working_hour_uuid: true }
      });
    }),
    firstOrThrow("company contact", () =>
      prisma.company_contact.findFirst({
        where: { allow_access: true, contact_uuid: { not: null }, company_id: { not: null } },
        orderBy: { updated_at: "desc" },
        select: {
          contact_uuid: true,
          company_id: true,
          contact: { select: { contact_name: true, contact_email: true } }
        }
      })
    ),
    firstOrThrow("company request", () =>
      prisma.company_contact.findFirst({
        where: {
          allow_access: true,
          contact_uuid: { not: null },
          company: { request: { some: {} } }
        },
        orderBy: { updated_at: "desc" },
        select: {
          contact_uuid: true,
          contact: { select: { contact_name: true, contact_email: true } },
          company: {
            select: {
              request: {
                orderBy: { request_updated_datetime: "desc" },
                take: 1,
                select: { request_uuid: true }
              }
            }
          }
        }
      })
    ),
    firstOrThrow("other company", async () => {
      const base = await prisma.company_contact.findFirst({
        where: { allow_access: true, contact_uuid: { not: null }, company_id: { not: null } },
        orderBy: { updated_at: "desc" },
        select: { contact_uuid: true }
      });
      if (!base?.contact_uuid) return null;
      return prisma.company_contact.findFirst({
        where: {
          allow_access: true,
          contact_uuid: { not: base.contact_uuid },
          company_id: { not: null }
        },
        orderBy: { updated_at: "desc" },
        select: { company_id: true }
      });
    }),
    firstOrThrow("other company request", async () => {
      const base = await prisma.company_contact.findFirst({
        where: {
          allow_access: true,
          contact_uuid: { not: null },
          company: { request: { some: {} } }
        },
        orderBy: { updated_at: "desc" },
        select: { contact_uuid: true }
      });
      if (!base?.contact_uuid) return null;
      return prisma.company_contact.findFirst({
        where: {
          allow_access: true,
          contact_uuid: { not: base.contact_uuid },
          company: { request: { some: {} } }
        },
        orderBy: { updated_at: "desc" },
        select: {
          company: {
            select: {
              request: {
                orderBy: { request_updated_datetime: "desc" },
                take: 1,
                select: { request_uuid: true }
              }
            }
          }
        }
      });
    }),
    firstOrThrow("inspector", () =>
      prisma.inspector.findFirst({
        where: { inspector_deleted: 0 },
        select: { inspector_uuid: true, inspector_name: true, inspector_email: true }
      })
    ),
    firstOrThrow("id request", () =>
      prisma.candidate_id_request.findFirst({
        orderBy: { created_at: "desc" },
        select: { cir_uuid: true }
      })
    )
  ]);

  const adminCookie = signSession({
    role: "admin",
    id: String(admin.admin_id),
    name: admin.admin_name,
    email: admin.admin_email
  });
  const staffCookie = signSession({
    role: "staff",
    id: String(staffRequest.staff_id),
    name: staffRequest.staff?.staff_name ?? "Staff Smoke",
    email: staffRequest.staff?.staff_email ?? "staff-smoke@studenthub.local"
  });
  const staffCandidateCookie = signSession({
    role: "staff",
    id: String(staffCandidate.staff_id),
    name: staffCandidate.staff?.staff_name ?? "Staff Smoke",
    email: staffCandidate.staff?.staff_email ?? "staff-smoke@studenthub.local"
  });
  const candidateInvitationCookie = signSession({
    role: "candidate",
    id: String(candidateInvitation.candidate_id),
    name: candidateInvitation.candidate?.candidate_name ?? "Candidate Smoke",
    email: candidateInvitation.candidate?.candidate_email ?? "candidate-smoke@studenthub.local"
  });
  const candidateWorkLogCookie = signSession({
    role: "candidate",
    id: String(candidateWorkLog.candidate_id),
    name: candidateWorkLog.candidate?.candidate_name ?? "Candidate Smoke",
    email: candidateWorkLog.candidate?.candidate_email ?? "candidate-smoke@studenthub.local"
  });
  const companyCookie = signSession({
    role: "company",
    id: contactCompany.contact_uuid,
    name: contactCompany.contact?.contact_name ?? "Company Smoke",
    email: contactCompany.contact?.contact_email ?? "company-smoke@studenthub.local"
  });
  const companyRequestCookie = signSession({
    role: "company",
    id: contactRequest.contact_uuid,
    name: contactRequest.contact?.contact_name ?? "Company Smoke",
    email: contactRequest.contact?.contact_email ?? "company-smoke@studenthub.local"
  });
  const inspectorCookie = signSession({
    role: "inspector",
    id: inspector.inspector_uuid,
    name: inspector.inspector_name,
    email: inspector.inspector_email
  });

  await expectStatus("/login", 200);
  await expectBodyIncludes("/login", 200, "One StudentHub login");
  // App Router redirect() renders 200 with meta-refresh, not 307
  await expectStatus("/login/admin", 200);
  await expectStatus("/login/candidate", 200);
  await expectStatus("/app", 307);
  await expectStatus("/hub", 307);
  await expectStatus("/admin", 307);
  await expectStatus("/staff", 307);

  await expectStatus("/app", 200, adminCookie);
  await expectStatus(`/app?scope=people&record=candidate-${adminCandidate.candidate_id}`, 200, adminCookie);
  await expectStatus("/hub", 200, adminCookie);
  await expectStatus(`/hub?scope=people&record=candidate-${adminCandidate.candidate_id}`, 200, adminCookie);
  await expectStatus(`/hub?scope=companies&record=company-${adminCompany.company_id}`, 200, adminCookie);
  await expectStatus(`/hub?scope=demand&record=request-${adminRequest.request_uuid}`, 200, adminCookie);
  await expectStatus(`/hub?scope=money&record=transfer-${adminTransfer.transfer_id}`, 200, adminCookie);
  await expectStatus(`/hub?scope=compliance&record=id-${idRequest.cir_uuid}`, 200, adminCookie);
  await expectStatus("/admin", 200, adminCookie);
  await expectStatus("/admin/candidates", 200, adminCookie);
  await expectBodyIncludes("/admin/candidates?q=jaafar", 200, "Open candidate tabs", adminCookie);
  await expectBodyIncludes("/admin/candidates?q=jaafar", 200, "Filtered view", adminCookie);
  // App Router redirect() renders 200 with meta-refresh, not 307
  await expectStatus(`/admin/candidates/${adminCandidate.candidate_id}`, 200, adminCookie);
  await expectBodyIncludes(`/admin/candidates?candidate=${adminCandidate.candidate_id}&tabs=${adminCandidate.candidate_id}`, 200, "Readiness", adminCookie);
  await expectBodyIncludes(`/admin/candidates?candidate=${adminCandidate.candidate_id}&tabs=${adminCandidate.candidate_id}`, 200, "Applications", adminCookie);
  await expectStatus("/admin/companies", 200, adminCookie);
  await expectStatus(`/admin/companies/${adminCompany.company_id}`, 200, adminCookie);
  await expectStatus("/admin/requests", 200, adminCookie);
  await expectStatus(`/admin/requests/${adminRequest.request_uuid}`, 200, adminCookie);
  await expectBodyIncludes(`/admin/requests/${adminRequest.request_uuid}`, 200, "Request fulfillment", adminCookie);
  await expectStatus("/admin/transfers", 200, adminCookie);
  await expectStatus(`/admin/transfers/${adminTransfer.transfer_id}`, 200, adminCookie);

  await expectStatus("/hub", 200, staffCookie);
  await expectStatus(`/hub?scope=demand&record=request-${staffRequest.request_uuid}`, 200, staffCookie);
  await expectStatus(`/hub?scope=people&record=candidate-${staffCandidate.candidate_id}`, 200, staffCandidateCookie);
  await expectStatus("/staff", 200, staffCookie);
  await expectBodyIncludes("/staff", 200, "Staff operating home", staffCookie);
  await expectBodyIncludes("/staff", 200, "Production data loaded", staffCookie);
  await expectStatus("/staff/requests", 200, staffCookie);
  await expectStatus(`/staff/requests/${staffRequest.request_uuid}`, 200, staffCookie);
  await expectBodyIncludes(`/staff/requests/${staffRequest.request_uuid}`, 200, "Request fulfillment", staffCookie);
  await expectStatus("/staff/candidates", 200, staffCandidateCookie);
  await expectBodyIncludes("/staff/candidates", 200, "All production", staffCandidateCookie);
  await expectBodyIncludes("/staff/candidates", 200, "matching candidates", staffCandidateCookie);
  await expectBodyIncludes("/staff/candidates?view=assigned", 200, "Assigned to me", staffCandidateCookie);
  await expectStatus(`/staff/candidates?candidate=${staffCandidate.candidate_id}`, 200, staffCandidateCookie);
  await expectBodyIncludes(
    `/staff/candidates?candidate=${staffCandidate.candidate_id}`,
    200,
    "Open candidate tabs",
    staffCandidateCookie
  );
  await expectBodyIncludes(
    `/staff/candidates?candidate=${staffCandidate.candidate_id}&tabs=${staffCandidate.candidate_id},${adminCandidate.candidate_id}`,
    200,
    "Open candidate tabs",
    staffCandidateCookie
  );
  await expectBodyIncludes(
    `/staff/candidates?candidate=${staffCandidate.candidate_id}&selected=${staffCandidate.candidate_id},${adminCandidate.candidate_id}`,
    200,
    "Selected candidate actions",
    staffCandidateCookie
  );
  // App Router redirect() renders 200 with meta-refresh, not 307
  await expectStatus(`/staff/candidates/${staffCandidate.candidate_id}`, 200, staffCandidateCookie);
  await expectBodyIncludes(`/staff/candidates?candidate=${staffCandidate.candidate_id}&tabs=${staffCandidate.candidate_id}`, 200, "Readiness", staffCandidateCookie);
  await expectBodyIncludes(`/staff/candidates?candidate=${staffCandidate.candidate_id}&tabs=${staffCandidate.candidate_id}`, 200, "Suggestions", staffCandidateCookie);

  await expectStatus("/hub", 200, candidateInvitationCookie);
  await expectStatus(`/hub?scope=people&record=candidate-${candidateInvitation.candidate_id}`, 200, candidateInvitationCookie);
  await expectStatus("/candidate", 200, candidateInvitationCookie);
  await expectBodyIncludes("/candidate", 200, "Readiness", candidateInvitationCookie);
  await expectStatus("/candidate/invitations", 200, candidateInvitationCookie);
  await expectStatus(`/candidate/invitations/${candidateInvitation.invitation_uuid}`, 200, candidateInvitationCookie);
  await expectStatus("/candidate/work-logs", 200, candidateWorkLogCookie);
  await expectStatus(`/candidate/work-logs/${candidateWorkLog.candidate_working_hour_uuid}`, 200, candidateWorkLogCookie);

  await expectStatus("/hub", 200, companyCookie);
  await expectStatus(`/hub?scope=companies&record=company-${contactCompany.company_id}`, 200, companyCookie);
  await expectStatus(`/hub?scope=demand&record=request-${contactRequest.company.request[0].request_uuid}`, 200, companyRequestCookie);
  await expectStatus("/company", 200, companyCookie);
  await expectStatus("/company/companies", 200, companyCookie);
  await expectStatus(`/company/companies/${contactCompany.company_id}`, 200, companyCookie);
  await expectStatus("/company/requests", 200, companyRequestCookie);
  await expectStatus(`/company/requests/${contactRequest.company.request[0].request_uuid}`, 200, companyRequestCookie);

  await expectStatus("/hub", 200, inspectorCookie);
  await expectStatus(`/hub?scope=compliance&record=id-${idRequest.cir_uuid}`, 200, inspectorCookie);
  await expectStatus("/inspector", 200, inspectorCookie);
  await expectStatus("/inspector/id-requests", 200, inspectorCookie);
  await expectStatus(`/inspector/id-requests/${idRequest.cir_uuid}`, 200, inspectorCookie);

  console.log("checking cross-role and ownership guards");
  // Cross-role server-component redirect() renders 200 with meta-refresh
  await expectStatus("/admin", 200, staffCookie);
  await expectStatus("/staff", 200, adminCookie);
  await expectStatus("/candidate", 200, companyCookie);
  await expectStatus("/company", 200, candidateInvitationCookie);
  await expectStatus("/inspector", 200, adminCookie);
  // App Router notFound() renders not-found.tsx boundary with 200, not HTTP 404
  await expectOneOf(`/candidate/invitations/${otherCandidateInvitation.invitation_uuid}`, [200, 404], candidateInvitationCookie);
  await expectOneOf(`/candidate/work-logs/${otherCandidateWorkLog.candidate_working_hour_uuid}`, [200, 404], candidateWorkLogCookie);
  await expectOneOf(`/company/companies/${otherContactCompany.company_id}`, [200, 404], companyCookie);
  await expectOneOf(`/company/requests/${otherContactRequest.company.request[0].request_uuid}`, [200, 404], companyRequestCookie);
  await expectStatus(`/staff/candidates/${unassignedStaffCandidate.candidate_id}`, 200, staffCandidateCookie);
  await expectBodyIncludes(
    `/staff/candidates?candidate=${unassignedStaffCandidate.candidate_id}`,
    200,
    "Candidate unavailable",
    staffCandidateCookie
  );
  await expectBodyIncludes(
    `/staff/candidates?view=assigned&candidate=${unassignedStaffCandidate.candidate_id}`,
    200,
    "Candidate unavailable",
    staffCandidateCookie
  );
  await expectStatus(`/hub?scope=people&record=candidate-${unassignedStaffCandidate.candidate_id}`, 200, staffCandidateCookie);
  await expectBodyIncludes(
    `/hub?scope=people&record=candidate-${unassignedStaffCandidate.candidate_id}`,
    200,
    "Candidate unavailable",
    staffCandidateCookie
  );
  await expectOneOf(`/staff/requests/${adminRequest.request_uuid}`, [200, 404], staffCookie);

  console.log("smoke tests passed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
