// ---------------------------------------------------------------------------
// Seed script for E2E test fixture data.
//
// Creates deterministic test users for all 5 roles (admin, staff, candidate,
// company, inspector) with known email addresses and a common test password.
//
// The E2E auth fixture (e2e/fixtures/auth.ts) has built-in support for these
// seed users via trySeedFixtures() -- it queries by the same email addresses.
//
// IMPORTANT: Fixed IDs match e2e/fixtures/users.ts so mock fixtures align
// with seed data. This is safe because in CI the DB is empty from prisma db push.
//
// Usage:
//   npx tsx prisma/seed-test-fixtures.ts
//
// Safe to run multiple times — users are upserted by unique columns.
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TEST_PASSWORD = "TestPass123!";
const TEST_EMAIL_DOMAIN = "test.studenthub.ai";

// Deterministic IDs matching e2e/fixtures/users.ts
const FIXED_IDS = {
  admin: 29,
  staff: 168,
  candidate: 53519,
  companyContactUuid: "00000000-0000-0000-0000-000000000001",
  contactUuid: "00000000-0000-0000-0000-000000000002",
  inspectorUuid: "00000000-0000-0000-0000-000000000004",
} as const;

const USERS = {
  admin: {
    email: `admin@${TEST_EMAIL_DOMAIN}`,
    name: "Test Admin",
  },
  staff: {
    email: `staff@${TEST_EMAIL_DOMAIN}`,
    name: "Test Staff",
  },
  candidate: {
    email: `candidate@${TEST_EMAIL_DOMAIN}`,
    name: "Test Candidate",
    nameAr: "مستخدم اختبار",
  },
  company: {
    email: `company@${TEST_EMAIL_DOMAIN}`,
    name: "Test Company User",
  },
  inspector: {
    email: `inspector@${TEST_EMAIL_DOMAIN}`,
    name: "Test Inspector",
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AUTH_KEY = "00000000000000000000000000000001";

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding E2E test fixtures...");

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  // ── Admin ───────────────────────────────────────────────────────────────
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
        admin_auth_key: AUTH_KEY,
        admin_status: 10,
        admin_updated_at: new Date(),
      },
    });
    console.log(`    Updated admin id=${existingAdmin.admin_id}`);
  } else {
    await prisma.admin.create({
      data: {
        admin_id: FIXED_IDS.admin,
        admin_name: USERS.admin.name,
        admin_email: USERS.admin.email,
        admin_password_hash: passwordHash,
        admin_auth_key: AUTH_KEY,
        admin_status: 10,
        admin_created_at: new Date(),
        admin_updated_at: new Date(),
      },
    });
    console.log(`    Created admin id=${FIXED_IDS.admin}`);
  }

  // ── Staff ───────────────────────────────────────────────────────────────
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
        staff_auth_key: AUTH_KEY,
        staff_status: 10,
        deleted: 0,
        staff_updated_at: new Date(),
      },
    });
    console.log(`    Updated staff id=${existingStaff.staff_id}`);
  } else {
    await prisma.staff.create({
      data: {
        staff_id: FIXED_IDS.staff,
        staff_name: USERS.staff.name,
        staff_email: USERS.staff.email,
        staff_password_hash: passwordHash,
        staff_auth_key: AUTH_KEY,
        staff_role: true,
        staff_status: 10,
        deleted: 0,
        staff_created_at: new Date(),
        staff_updated_at: new Date(),
        staff_hourly_rate: 1.6,
      },
    });
    console.log(`    Created staff id=${FIXED_IDS.staff}`);
  }

  // ── Candidate ───────────────────────────────────────────────────────────
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
        candidate_auth_key: AUTH_KEY,
        candidate_status: 10,
        approved: 1,
        deleted: 0,
        candidate_updated_at: new Date(),
      },
    });
    console.log(`    Updated candidate id=${existingCandidate.candidate_id}`);
  } else {
    await prisma.candidate.create({
      data: {
        candidate_id: FIXED_IDS.candidate,
        candidate_name: USERS.candidate.name,
        candidate_name_ar: USERS.candidate.nameAr,
        candidate_email: USERS.candidate.email,
        candidate_password_hash: passwordHash,
        candidate_auth_key: AUTH_KEY,
        candidate_status: 10,
        approved: 1,
        candidate_committed: true,
        deleted: 0,
        candidate_created_at: new Date(),
        candidate_updated_at: new Date(),
      },
    });
    console.log(`    Created candidate id=${FIXED_IDS.candidate}`);
  }

  // ── Company + Contact + CompanyContact ───────────────────────────────────
  console.log("  Creating company (contact + company + company_contact)...");

  // Step 1: Company
  const existingCompany = await prisma.company.findFirst({
    where: { company_email: USERS.company.email },
  });
  if (existingCompany) {
    await prisma.company.update({
      where: { company_id: existingCompany.company_id },
      data: {
        company_name: "Test Company",
        company_updated_at: new Date(),
      },
    });
    console.log(`    Updated company id=${existingCompany.company_id}`);
  } else {
    await prisma.company.create({
      data: {
        company_name: "Test Company",
        company_email: USERS.company.email,
        company_followup: true,
        company_approved_to_hire: true,
        company_created_at: new Date(),
        company_updated_at: new Date(),
        deleted: 0,
      },
    });
    console.log("    Created company");
  }

  // Step 2: Contact
  const existingContact = await prisma.contact.findFirst({
    where: { contact_email: USERS.company.email },
  });
  if (existingContact) {
    await prisma.contact.update({
      where: { contact_uuid: existingContact.contact_uuid },
      data: {
        contact_name: USERS.company.name,
        contact_password_hash: passwordHash,
        contact_auth_key: AUTH_KEY,
        contact_status: 10,
        deleted: false,
        contact_updated_at: new Date(),
      },
    });
    console.log(`    Updated contact uuid=${existingContact.contact_uuid}`);
  } else {
    await prisma.contact.create({
      data: {
        contact_uuid: FIXED_IDS.contactUuid,
        contact_name: USERS.company.name,
        contact_email: USERS.company.email,
        contact_password_hash: passwordHash,
        contact_auth_key: AUTH_KEY,
        contact_status: 10,
        deleted: false,
        contact_created_at: new Date(),
        contact_updated_at: new Date(),
      },
    });
    console.log(`    Created contact uuid=${FIXED_IDS.contactUuid}`);
  }

  // Step 3: Company_contact link with allow_access=true
  const freshCompany = await prisma.company.findFirstOrThrow({
    where: { company_email: USERS.company.email },
  });
  const freshContact = await prisma.contact.findFirstOrThrow({
    where: { contact_email: USERS.company.email },
  });

  const existingLink = await prisma.company_contact.findFirst({
    where: { contact_uuid: freshContact.contact_uuid, company_id: freshCompany.company_id },
  });
  if (existingLink) {
    await prisma.company_contact.update({
      where: { company_contact_uuid: existingLink.company_contact_uuid },
      data: { allow_access: true, updated_at: new Date() },
    });
    console.log(`    Updated company_contact uuid=${existingLink.company_contact_uuid}`);
  } else {
    await prisma.company_contact.create({
      data: {
        company_contact_uuid: FIXED_IDS.companyContactUuid,
        contact_uuid: freshContact.contact_uuid,
        company_id: freshCompany.company_id,
        allow_access: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log(`    Created company_contact uuid=${FIXED_IDS.companyContactUuid}`);
  }

  // ── Inspector ───────────────────────────────────────────────────────────
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
        inspector_auth_key: AUTH_KEY,
        inspector_status: 10,
        inspector_deleted: 0,
        inspector_updated_at: new Date(),
      },
    });
    console.log(`    Updated inspector uuid=${existingInspector.inspector_uuid}`);
  } else {
    await prisma.inspector.create({
      data: {
        inspector_uuid: FIXED_IDS.inspectorUuid,
        inspector_name: USERS.inspector.name,
        inspector_email: USERS.inspector.email,
        inspector_password_hash: passwordHash,
        inspector_auth_key: AUTH_KEY,
        inspector_status: 10,
        inspector_deleted: 0,
        inspector_created_at: new Date(),
        inspector_updated_at: new Date(),
      },
    });
    console.log(`    Created inspector uuid=${FIXED_IDS.inspectorUuid}`);
  }

  // ── Job Listing ─────────────────────────────────────────────────────────
  console.log("  Creating job listing for E2E tests...");
  const seedCompany = await prisma.company.findFirstOrThrow({
    where: { company_email: USERS.company.email },
  });
  const existingJob = await prisma.job_listing.findFirst({
    where: { employerId: seedCompany.company_id, title: "E2E Test - Retail Associate" },
  });
  if (existingJob) {
    await prisma.job_listing.update({
      where: { jobListingId: existingJob.jobListingId },
      data: {
        title: "E2E Test - Retail Associate",
        description: "E2E test job listing for automated testing. Not a real position.",
        requirements: "Must pass E2E tests",
        location: "Kuwait City",
        employmentType: "Full-time",
        salaryRange: "300-500 KWD/month",
        status: "active",
        updatedAt: new Date(),
      },
    });
    console.log(`    Updated job listing id=${existingJob.jobListingId}`);
  } else {
    await prisma.job_listing.create({
      data: {
        employerId: seedCompany.company_id,
        title: "E2E Test - Retail Associate",
        description: "E2E test job listing for automated testing. Not a real position.",
        requirements: "Must pass E2E tests",
        location: "Kuwait City",
        employmentType: "Full-time",
        salaryRange: "300-500 KWD/month",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("    Created job listing");
  }

  console.log("Done seeding E2E test fixtures.");
  console.log(`Test password for all users: ${TEST_PASSWORD}`);
  console.log(`Emails: ${Object.values(USERS).map((u) => u.email).join(", ")}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
