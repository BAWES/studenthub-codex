/**
 * Fixture validation script — validates that the fixture manifest is consistent
 * with the current database state.
 *
 * Usage: node scripts/fixtures/validate.mjs
 *
 * Exits with code 1 if any validation fails, 0 if all pass.
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

let passed = 0;
let failed = 0;
const failures = [];

function ok(label, condition, detail) {
  if (condition) {
    console.log(`\x1b[32m✓ ${label}\x1b[0m`);
    passed++;
  } else {
    console.log(`\x1b[31m✗ ${label}\x1b[0m${detail ? `  ${detail}` : ""}`);
    failed++;
    failures.push({ label, detail });
  }
}

async function main() {
  console.log(`\n\x1b[1mFixture Manifest Validation\x1b[0m\n`);

  // 1. Manifest file exists
  const manifestPath = path.join(ROOT, "data", "fixture-manifest.json");
  ok("fixture-manifest.json exists", fs.existsSync(manifestPath));
  if (!fs.existsSync(manifestPath)) {
    console.log("\n  Run scripts/fixtures/discover.mjs first to generate the manifest.\n");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  ok("manifest has generatedAt", !!manifest.generatedAt);
  ok("manifest has fixtures", !!manifest.fixtures);
  ok("manifest has counts", !!manifest.counts);

  const prisma = new PrismaClient();

  try {
    // 2. Validate identity fixture records still exist
    console.log(`\n\x1b[1m── Identity Fixtures ──\x1b[0m`);
    const { identity } = manifest.fixtures;

    const admin = await prisma.admin.findUnique({ where: { admin_id: identity.admin.id } });
    ok("admin fixture exists", !!admin, `admin_id=${identity.admin.id}`);

    const staff = await prisma.staff.findUnique({ where: { staff_id: identity.staff.id } });
    ok("staff fixture exists", !!staff, `staff_id=${identity.staff.id}`);

    const candidate = await prisma.candidate.findUnique({ where: { candidate_id: identity.candidate.id } });
    ok("candidate fixture exists", !!candidate, `candidate_id=${identity.candidate.id}`);

    const contact = await prisma.company_contact.findFirst({
      where: { contact_uuid: identity.company_contact.contact_uuid },
    });
    ok("company_contact fixture exists", !!contact, `contact_uuid=${identity.company_contact.contact_uuid}`);

    const inspector = await prisma.inspector.findUnique({ where: { inspector_uuid: identity.inspector.id } });
    ok("inspector fixture exists", !!inspector, `inspector_uuid=${identity.inspector.id}`);

    // 3. Validate domain fixture records
    console.log(`\n\x1b[1m── Domain Fixtures ──\x1b[0m`);
    const { domain } = manifest.fixtures;

    const req = await prisma.request.findUnique({ where: { request_uuid: domain.admin_request.request_uuid } });
    ok("admin_request fixture exists", !!req, `request_uuid=${domain.admin_request.request_uuid}`);

    const comp = await prisma.company.findUnique({ where: { company_id: domain.admin_company.company_id } });
    ok("admin_company fixture exists", !!comp, `company_id=${domain.admin_company.company_id}`);

    const tr = await prisma.transfer.findUnique({ where: { transfer_id: domain.admin_transfer.transfer_id } });
    ok("admin_transfer fixture exists", !!tr, `transfer_id=${domain.admin_transfer.transfer_id}`);

    const idr = await prisma.candidate_id_request.findUnique({ where: { cir_uuid: domain.id_request.cir_uuid } });
    ok("id_request fixture exists", !!idr, `cir_uuid=${domain.id_request.cir_uuid}`);

    const inv = await prisma.invitation.findUnique({ where: { invitation_uuid: domain.invitation.invitation_uuid } });
    ok("invitation fixture exists", !!inv, `invitation_uuid=${domain.invitation.invitation_uuid}`);

    const wl = await prisma.candidate_working_hour.findUnique({
      where: { candidate_working_hour_uuid: domain.work_log.candidate_working_hour_uuid },
    });
    ok("work_log fixture exists", !!wl, `candidate_working_hour_uuid=${domain.work_log.candidate_working_hour_uuid}`);

    // 4. Validate record counts against expected thresholds
    console.log(`\n\x1b[1m── Record Count Thresholds ──\x1b[0m`);

    // Define minimum expected counts (these are conservative — sample DB may vary)
    const thresholds = {
      admin: 1,        // at least 1 admin
      staff: 1,        // at least 1 staff
      candidate: 1,    // at least 1 candidate
      company: 1,      // at least 1 company
      inspector: 1,    // at least 1 inspector
      request: 1,      // at least 1 request
      transfer: 0,     // transfers may be 0
      invitation: 0,   // invitations may be 0
      invoice: 0,      // invoices may be 0
      contact: 1,      // at least 1 contact (for company role)
    };

    for (const [table, min] of Object.entries(thresholds)) {
      const actual = await (async () => {
        switch (table) {
          case "admin": return prisma.admin.count();
          case "staff": return prisma.staff.count({ where: { deleted_at: null } });
          case "candidate": return prisma.candidate.count({ where: { deleted: 0 } });
          case "company": return prisma.company.count({ where: { deleted: 0 } });
          case "inspector": return prisma.inspector.count({ where: { inspector_deleted: 0 } });
          case "request": return prisma.request.count();
          case "transfer": return prisma.transfer.count({ where: { deleted: 0 } });
          case "invitation": return prisma.invitation.count();
          case "invoice": return prisma.invoice.count();
          case "contact": return prisma.contact.count();
          default: return 0;
        }
      })();

      ok(
        `${table} count ≥ ${min}`,
        actual >= min,
        `expected ≥${min}, actual=${actual}`,
      );

      // Warn if count doesn't match manifest
      if (manifest.counts[table] !== undefined && manifest.counts[table] !== actual) {
        console.log(`  \x1b[33m⚠ ${table} count changed: manifest=${manifest.counts[table]}, current=${actual}\x1b[0m`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  // Summary
  const total = passed + failed;
  console.log(`\n\x1b[1m${"─".repeat(50)}\x1b[0m`);
  console.log(`\x1b[1mResults: ${passed}/${total} passed\x1b[0m`);

  if (failures.length > 0) {
    console.log(`\n\x1b[31mFailures (${failures.length}):\x1b[0m`);
    for (const f of failures) {
      console.log(`  ✗ ${f.label}${f.detail ? `\n    ${f.detail}` : ""}`);
    }
    process.exit(1);
  }

  console.log(`\n\x1b[32mAll fixture validations passed.\x1b[0m`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
