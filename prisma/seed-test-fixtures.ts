/**
 * Seed script for E2E test fixture data.
 *
 * Creates deterministic test users for all 5 roles (admin, staff, candidate,
 * company, inspector) with known email addresses and a common test password.
 *
 * Usage:
 *   npx tsx prisma/seed-test-fixtures.ts
 *
 * Safe to run multiple times — users are upserted by email.
 * Only runs when SEED_TEST_FIXTURES=true to prevent accidental seeding
 * on production data.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TEST_PASSWORD = "test-password-2024!";
const TEST_EMAIL_DOMAIN = "test.studenthub.ai";

const USERS = {
  admin: {
    role: "admin" as const,
    email: `admin@${TEST_EMAIL_DOMAIN}`,
    name: "Test Admin",
  },
  staff: {
    role: "staff" as const,
    email: `staff@${TEST_EMAIL_DOMAIN}`,
    name: "Test Staff",
  },
  candidate: {
    role: "candidate" as const,
    email: `candidate@${TEST_EMAIL_DOMAIN}`,
    name: "Test Candidate",
    nameAr: "مرشح اختبار",
  },
  company: {
    role: "company" as const,
    email: `company@${TEST_EMAIL_DOMAIN}`,
    name: "Test Company Contact",
  },
  inspector: {
    role: "inspector" as const,
    email: `inspector@${TEST_EMAIL_DOMAIN}`,
    name: "Test Inspector",
  },
} as const;

// Fixed UUIDs so they're reproducible
const FIXED_UUIDS = {
  companyContactUuid: "00000000-0000-0000-0000-000000000001",
  contactUuid: "00000000-0000-0000-0000-000000000002",
  companyUuid: "00000000-0000-0000-0000-000000000003",  // Not really uuid, company uses auto-increment id
  inspectorUuid: "00000000-0000-0000-0000-000000000004",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateAuthKey(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Seeding E2E test fixture data...\n");

  const passwordHash = await hashPassword(TEST_PASSWORD);

  // ── Admin ──
  console.log("  Creating admin...");
  const existingAdmin = await prisma.admin.findFirst({
    where: { admin_email: USERS.admin.email },
  });

  if (existingAdmin) {
    await prisma.admin.update({
      where: { admin_id: existingAdmin.admin_id },
      data: {
        admin_name: USERS.admin.name,
        admin_password_hash: passwordHash,
        admin_auth_key: generateAuthKey(),
        admin_status: 10,
        admin_updated_at: new Date(),
      },
    });
    console.log(`    Updated admin id=${existingAdmin.admin_id}`);
  } else {
    const admin = await prisma.admin.create({
      data: {
        admin_name: USERS.admin.name,
        admin_email: USERS.admin.email,
        admin_password_hash: passwordHash,
        admin_auth_key: generateAuthKey(),
        admin_status: 10,
        admin_created_at: new Date(),
        admin_updated_at: new Date(),
      },
    });
    console.log(`    Created admin id=${admin.admin_id}`);
  }

  // ── Staff ──
  console.log("  Creating staff...");
  const existingStaff = await prisma.staff.findFirst({
    where: { staff_email: USERS.staff.email },
  });

  if (existingStaff) {
    await prisma.staff.update({
      where: { staff_id: existingStaff.staff_id },
      data: {
        staff_name: USERS.staff.name,
        staff_password_hash: passwordHash,
        staff_auth_key: generateAuthKey(),
        staff_status: 10,
        deleted: 0,
        staff_updated_at: new Date(),
      },
    });
    console.log(`    Updated staff id=${existingStaff.staff_id}`);
  } else {
    const staff = await prisma.staff.create({
      data: {
        staff_name: USERS.staff.name,
        staff_email: USERS.staff.email,
        staff_password_hash: passwordHash,
        staff_auth_key: generateAuthKey(),
        staff_status: 10,
        deleted: 0,
        staff_created_at: new Date(),
        staff_updated_at: new Date(),
      },
    });
    console.log(`    Created staff id=${staff.staff_id}`);
  }

  // ── Candidate ──
  console.log("  Creating candidate...");
  const existingCandidate = await prisma.candidate.findFirst({
    where: { candidate_email: USERS.candidate.email },
  });

  if (existingCandidate) {
    await prisma.candidate.update({
      where: { candidate_id: existingCandidate.candidate_id },
      data: {
        candidate_name: USERS.candidate.name,
        candidate_name_ar: USERS.candidate.nameAr,
        candidate_password_hash: passwordHash,
        candidate_auth_key: generateAuthKey(),
        candidate_status: 10,
        approved: 1,
        deleted: 0,
        candidate_updated_at: new Date(),
      },
    });
    console.log(`    Updated candidate id=${existingCandidate.candidate_id}`);
  } else {
    const candidate = await prisma.candidate.create({
      data: {
        candidate_name: USERS.candidate.name,
        candidate_name_ar: USERS.candidate.nameAr,
        candidate_email: USERS.candidate.email,
        candidate_password_hash: passwordHash,
        candidate_auth_key: generateAuthKey(),
        candidate_status: 10,
        approved: 1,
        deleted: 0,
        candidate_committed: true,
        candidate_created_at: new Date(),
        candidate_updated_at: new Date(),
      },
    });
    console.log(`    Created candidate id=${candidate.candidate_id}`);
  }

  // ── Company (contact + company + company_contact chain) ──
  console.log("  Creating company (contact + company + company_contact)...");

  // Step 1: Create the company
  const existingCompany = await prisma.company.findFirst({
    where: { company_email: USERS.company.email },
  });

  const companyId = existingCompany?.company_id ?? null;
  if (!companyId) {
    const company = await prisma.company.create({
      data: {
        company_name: "Test Company Ltd",
        company_email: USERS.company.email,
        company_created_at: new Date(),
        company_updated_at: new Date(),
        deleted: 0,
        company_approved_to_hire: true,
      },
    });
    console.log(`    Created company id=${company.company_id}`);
  } else {
    console.log(`    Company already exists id=${companyId}`);
  }

  // Step 2: Create the contact
  const existingContact = await prisma.contact.findFirst({
    where: { contact_email: USERS.company.email },
  });

  if (existingContact) {
    await prisma.contact.update({
      where: { contact_uuid: existingContact.contact_uuid },
      data: {
        contact_name: USERS.company.name,
        contact_password_hash: passwordHash,
        contact_auth_key: generateAuthKey(),
        contact_status: 10,
        deleted: false,
        contact_updated_at: new Date(),
      },
    });
    console.log(`    Updated contact uuid=${existingContact.contact_uuid}`);
  } else {
    const contact = await prisma.contact.create({
      data: {
        contact_uuid: FIXED_UUIDS.contactUuid,
        contact_name: USERS.company.name,
        contact_email: USERS.company.email,
        contact_password_hash: passwordHash,
        contact_auth_key: generateAuthKey(),
        contact_status: 10,
        deleted: false,
        contact_created_at: new Date(),
        contact_updated_at: new Date(),
      },
    });
    console.log(`    Created contact uuid=${contact.contact_uuid}`);
  }

  // Step 3: Link contact to company via company_contact
  // Find our company again (need id after possible create)
  const freshCompany = await prisma.company.findFirstOrThrow({
    where: { company_email: USERS.company.email },
  });
  const freshContact = await prisma.contact.findFirstOrThrow({
    where: { contact_email: USERS.company.email },
  });

  const existingCompanyContact = await prisma.company_contact.findFirst({
    where: { contact_uuid: freshContact.contact_uuid, company_id: freshCompany.company_id },
  });

  if (existingCompanyContact) {
    await prisma.company_contact.update({
      where: { company_contact_uuid: existingCompanyContact.company_contact_uuid },
      data: {
        allow_access: true,
        updated_at: new Date(),
      },
    });
    console.log(`    Updated company_contact uuid=${existingCompanyContact.company_contact_uuid}`);
  } else {
    await prisma.company_contact.create({
      data: {
        company_contact_uuid: FIXED_UUIDS.companyContactUuid,
        contact_uuid: freshContact.contact_uuid,
        company_id: freshCompany.company_id,
        allow_access: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log(`    Created company_contact uuid=${FIXED_UUIDS.companyContactUuid}`);
  }

  // ── Inspector ──
  console.log("  Creating inspector...");
  const existingInspector = await prisma.inspector.findFirst({
    where: { inspector_email: USERS.inspector.email },
  });

  if (existingInspector) {
    await prisma.inspector.update({
      where: { inspector_uuid: existingInspector.inspector_uuid },
      data: {
        inspector_name: USERS.inspector.name,
        inspector_password_hash: passwordHash,
        inspector_auth_key: generateAuthKey(),
        inspector_status: 10,
        inspector_deleted: 0,
        inspector_updated_at: new Date(),
      },
    });
    console.log(`    Updated inspector uuid=${existingInspector.inspector_uuid}`);
  } else {
    await prisma.inspector.create({
      data: {
        inspector_uuid: FIXED_UUIDS.inspectorUuid,
        inspector_name: USERS.inspector.name,
        inspector_email: USERS.inspector.email,
        inspector_password_hash: passwordHash,
        inspector_auth_key: generateAuthKey(),
        inspector_status: 10,
        inspector_deleted: 0,
        inspector_created_at: new Date(),
        inspector_updated_at: new Date(),
      },
    });
    console.log(`    Created inspector uuid=${FIXED_UUIDS.inspectorUuid}`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`Test password for all users: ${TEST_PASSWORD}`);
  console.log(
    `Emails: ${Object.values(USERS).map((u) => u.email).join(", ")}`
  );
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
