/**
 * Fixture discovery script — picks stable representative records from the
 * production-clone database and writes a fixture manifest for use by smoke
 * tests and Playwright suites.
 *
 * Usage: node scripts/fixtures/discover.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=["']?(.+?)["']?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnv();
const prisma = new PrismaClient();

async function firstOrThrow(label, query) {
  const value = await query();
  if (!value) throw new Error(`Missing fixture data: ${label}`);
  return value;
}

async function countOrZero(query) {
  try {
    return await query();
  } catch {
    return 0;
  }
}

async function main() {
  console.log("Discovering fixture records from database...\n");

  // ── Identity fixtures (one per role) ──
  const admin = await firstOrThrow("admin (active, status=10)", () =>
    prisma.admin.findFirst({
      where: { admin_status: 10 },
      select: { admin_id: true, admin_name: true, admin_email: true, admin_status: true },
    }),
  );

  const staff = await firstOrThrow("staff (not deleted)", () =>
    prisma.staff.findFirst({
      where: { deleted: 0 },
      select: { staff_id: true, staff_name: true, staff_email: true },
    }),
  );

  const candidate = await firstOrThrow("candidate (not deleted)", () =>
    prisma.candidate.findFirst({
      where: { deleted: 0 },
      orderBy: { candidate_updated_at: "desc" },
      select: { candidate_id: true, candidate_name: true, candidate_email: true },
    }),
  );

  const companyContact = await firstOrThrow("company contact (allow_access=true)", () =>
    prisma.company_contact.findFirst({
      where: { allow_access: true, contact_uuid: { not: null }, company_id: { not: null } },
      orderBy: { updated_at: "desc" },
      select: {
        contact_uuid: true,
        company_id: true,
        contact: { select: { contact_name: true, contact_email: true } },
      },
    }),
  );

  const inspector = await firstOrThrow("inspector (not deleted)", () =>
    prisma.inspector.findFirst({
      where: { inspector_deleted: 0 },
      select: { inspector_uuid: true, inspector_name: true, inspector_email: true },
    }),
  );

  // ── Domain fixtures (one per key entity) ──
  const staffRequest = await firstOrThrow("request assigned to staff", () =>
    prisma.request.findFirst({
      where: { staff_id: { not: null } },
      orderBy: { request_updated_datetime: "desc" },
      select: { request_uuid: true, staff_id: true, request_position_title: true },
    }),
  );

  const adminRequest = await firstOrThrow("any request", () =>
    prisma.request.findFirst({
      orderBy: { request_updated_datetime: "desc" },
      select: { request_uuid: true, request_position_title: true },
    }),
  );

  const companyRequest = await firstOrThrow("request linked to company contact", () =>
    prisma.company_contact.findFirst({
      where: {
        allow_access: true,
        contact_uuid: { not: null },
        company: { request: { some: {} } },
      },
      orderBy: { updated_at: "desc" },
      select: {
        contact_uuid: true,
        company: {
          select: {
            request: {
              orderBy: { request_updated_datetime: "desc" },
              take: 1,
              select: { request_uuid: true, request_position_title: true },
            },
          },
        },
      },
    }),
  );

  const adminCompany = await firstOrThrow("company (not deleted)", () =>
    prisma.company.findFirst({
      where: { deleted: 0 },
      orderBy: { company_updated_at: "desc" },
      select: { company_id: true, company_name: true },
    }),
  );

  const adminTransfer = await firstOrThrow("transfer (not deleted)", () =>
    prisma.transfer.findFirst({
      where: { deleted: 0 },
      orderBy: { transfer_updated_at: "desc" },
      select: { transfer_id: true },
    }),
  );

  const idRequest = await firstOrThrow("candidate ID request", () =>
    prisma.candidate_id_request.findFirst({
      orderBy: { created_at: "desc" },
      select: { cir_uuid: true },
    }),
  );

  const invitation = await firstOrThrow("candidate invitation", () =>
    prisma.invitation.findFirst({
      where: { candidate_id: { not: null } },
      orderBy: { invitation_created_at: "desc" },
      select: { invitation_uuid: true, candidate_id: true },
    }),
  );

  const workLog = await firstOrThrow("candidate work log", () =>
    prisma.candidate_working_hour.findFirst({
      where: { candidate_id: { not: null } },
      orderBy: { date: "desc" },
      select: { candidate_working_hour_uuid: true, candidate_id: true },
    }),
  );

  // ── Aggregate record counts for key tables ──
  const counts = {
    admin: await countOrZero(() => prisma.admin.count()),
    staff: await countOrZero(() => prisma.staff.count({ where: { deleted: 0 } })),
    candidate: await countOrZero(() => prisma.candidate.count({ where: { deleted: 0 } })),
    company: await countOrZero(() => prisma.company.count({ where: { deleted: 0 } })),
    inspector: await countOrZero(() => prisma.inspector.count({ where: { inspector_deleted: 0 } })),
    request: await countOrZero(() => prisma.request.count()),
    transfer: await countOrZero(() => prisma.transfer.count({ where: { deleted: 0 } })),
    invitation: await countOrZero(() => prisma.invitation.count()),
    invoice: await countOrZero(() => prisma.invoice.count()),
    contact: await countOrZero(() => prisma.contact.count()),
  };

  const manifest = {
    generatedAt: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, "//***:***@") ?? "unknown",
    fixtures: {
      identity: {
        admin: {
          table: "admin",
          id: admin.admin_id,
          name: admin.admin_name,
          email: admin.admin_email,
          status: admin.admin_status,
        },
        staff: {
          table: "staff",
          id: staff.staff_id,
          name: staff.staff_name,
          email: staff.staff_email,
        },
        candidate: {
          table: "candidate",
          id: candidate.candidate_id,
          name: candidate.candidate_name,
          email: candidate.candidate_email,
        },
        company_contact: {
          table: "company_contact",
          contact_uuid: companyContact.contact_uuid,
          company_id: companyContact.company_id,
          name: companyContact.contact.contact_name,
          email: companyContact.contact.contact_email,
        },
        inspector: {
          table: "inspector",
          id: inspector.inspector_uuid,
          name: inspector.inspector_name,
          email: inspector.inspector_email,
        },
      },
      domain: {
        staff_request: {
          request_uuid: staffRequest.request_uuid,
          staff_id: staffRequest.staff_id,
          title: staffRequest.request_position_title,
        },
        admin_request: {
          request_uuid: adminRequest.request_uuid,
          title: adminRequest.request_position_title,
        },
        company_request: {
          request_uuid: companyRequest.company.request[0]?.request_uuid ?? null,
          contact_uuid: companyRequest.contact_uuid,
          title: companyRequest.company.request[0]?.request_position_title ?? null,
        },
        admin_company: {
          company_id: adminCompany.company_id,
          name: adminCompany.company_name,
        },
        admin_transfer: {
          transfer_id: adminTransfer.transfer_id,
        },
        id_request: {
          cir_uuid: idRequest.cir_uuid,
        },
        invitation: {
          invitation_uuid: invitation.invitation_uuid,
          candidate_id: invitation.candidate_id,
        },
        work_log: {
          candidate_working_hour_uuid: workLog.candidate_working_hour_uuid,
          candidate_id: workLog.candidate_id,
        },
      },
    },
    counts,
  };

  const outPath = path.join(ROOT, "data", "fixture-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Fixture manifest written to ${outPath}`);
  console.log(`  Identity records: ${Object.keys(manifest.fixtures.identity).length}`);
  console.log(`  Domain records: ${Object.keys(manifest.fixtures.domain).length}`);
  console.log(`  Table counts: ${Object.keys(manifest.counts).length} tables\n`);

  // Summary
  console.log("Record counts:");
  for (const [table, count] of Object.entries(manifest.counts)) {
    console.log(`  ${table}: ${count}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
