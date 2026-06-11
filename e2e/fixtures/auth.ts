import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export interface SessionUser {
  role: string;
  id: string;
  name: string;
  email: string;
  issuedAt: number;
}

export function signSession(user: Omit<SessionUser, "issuedAt">): string {
  const payload = Buffer.from(
    JSON.stringify({ ...user, issuedAt: Date.now() }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", requireEnv("AUTH_SECRET"))
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export interface FixtureUser {
  role: string;
  id: string;
  name: string;
  email: string;
  cookie: string;
}

// ── Seed data support ────────────────────────────────────────────────────
// E2E tests can use deterministic seed data (from prisma/seed-test-fixtures.ts)
// instead of reading from the live production DB.
// The seed uses well-known test emails at the @test.studenthub.ai domain.

const TEST_EMAIL_DOMAIN = "test.studenthub.ai";

interface SeedLookup {
  role: string;
  email: string;
}

const SEED_USERS: SeedLookup[] = [
  { role: "admin", email: `admin@${TEST_EMAIL_DOMAIN}` },
  { role: "staff", email: `staff@${TEST_EMAIL_DOMAIN}` },
  { role: "candidate", email: `candidate@${TEST_EMAIL_DOMAIN}` },
  { role: "company", email: `company@${TEST_EMAIL_DOMAIN}` },
  { role: "inspector", email: `inspector@${TEST_EMAIL_DOMAIN}` },
];

/**
 * Try to find seed test users in the database.
 * Returns a map of FixtureUser keyed by role, or null if no seed data found.
 */
async function trySeedFixtures(): Promise<Map<string, FixtureUser> | null> {
  const forceSeed = process.env.FORCE_SEED_FIXTURES === "true";

  const [seedAdmin, seedStaff, seedCandidate, seedContact, seedInspector] =
    await Promise.all([
      prisma.admin.findFirst({ where: { admin_email: SEED_USERS[0].email } }),
      prisma.staff.findFirst({ where: { staff_email: SEED_USERS[1].email } }),
      prisma.candidate.findFirst({
        where: { candidate_email: SEED_USERS[2].email },
      }),
      prisma.contact.findFirst({
        where: { contact_email: SEED_USERS[3].email },
      }),
      prisma.inspector.findFirst({
        where: { inspector_email: SEED_USERS[4].email },
      }),
    ]);

  // If NO seed users exist and we're not forced, return null to use live DB
  if (
    !seedAdmin &&
    !seedStaff &&
    !seedCandidate &&
    !seedContact &&
    !seedInspector &&
    !forceSeed
  ) {
    return null;
  }

  // Otherwise use what we found — throw if anything is missing
  if (!seedAdmin) throw new Error("Missing seed fixture: admin");
  if (!seedStaff) throw new Error("Missing seed fixture: staff");
  if (!seedCandidate) throw new Error("Missing seed fixture: candidate");
  if (!seedContact)
    throw new Error("Missing seed fixture: company contact");
  if (!seedInspector) throw new Error("Missing seed fixture: inspector");

  // Verify company_contact link exists for the company user
  const companyContact = await prisma.company_contact.findFirst({
    where: { contact_uuid: seedContact.contact_uuid, allow_access: true },
  });
  if (!companyContact)
    throw new Error(
      "Missing seed fixture: company_contact with allow_access=true"
    );

  return new Map([
    [
      "admin",
      {
        role: "admin",
        id: String(seedAdmin.admin_id),
        name: seedAdmin.admin_name,
        email: seedAdmin.admin_email,
        cookie: signSession({
          role: "admin",
          id: String(seedAdmin.admin_id),
          name: seedAdmin.admin_name,
          email: seedAdmin.admin_email,
        }),
      },
    ],
    [
      "staff",
      {
        role: "staff",
        id: String(seedStaff.staff_id),
        name: seedStaff.staff_name,
        email: seedStaff.staff_email,
        cookie: signSession({
          role: "staff",
          id: String(seedStaff.staff_id),
          name: seedStaff.staff_name,
          email: seedStaff.staff_email,
        }),
      },
    ],
    [
      "candidate",
      {
        role: "candidate",
        id: String(seedCandidate.candidate_id),
        name: seedCandidate.candidate_name,
        email: seedCandidate.candidate_email,
        cookie: signSession({
          role: "candidate",
          id: String(seedCandidate.candidate_id),
          name: seedCandidate.candidate_name,
          email: seedCandidate.candidate_email,
        }),
      },
    ],
    [
      "company",
      {
        role: "company",
        id: seedContact.contact_uuid,
        name: seedContact.contact_name,
        email: seedContact.contact_email ?? SEED_USERS[3].email,
        cookie: signSession({
          role: "company",
          id: seedContact.contact_uuid,
          name: seedContact.contact_name,
          email: seedContact.contact_email ?? SEED_USERS[3].email,
        }),
      },
    ],
    [
      "inspector",
      {
        role: "inspector",
        id: seedInspector.inspector_uuid,
        name: seedInspector.inspector_name,
        email: seedInspector.inspector_email,
        cookie: signSession({
          role: "inspector",
          id: seedInspector.inspector_uuid,
          name: seedInspector.inspector_name,
          email: seedInspector.inspector_email,
        }),
      },
    ],
  ]);
}

// ── Live DB fallback (original behavior) ─────────────────────────────────

async function firstOrThrow<T>(
  label: string,
  query: () => Promise<T | null>
): Promise<T> {
  const value = await query();
  if (!value) throw new Error(`Missing fixture data: ${label}`);
  return value;
}

let fixtureCache: Map<string, FixtureUser> | null = null;

export async function getFixtures(): Promise<Map<string, FixtureUser>> {
  if (fixtureCache) return fixtureCache;

  // Try seed fixtures first
  const seedFixtures = await trySeedFixtures();
  if (seedFixtures) {
    fixtureCache = seedFixtures;
    return fixtureCache;
  }

  // Fall back to live production DB
  const [admin, staff, candidate, company, inspector] = await Promise.all([
    firstOrThrow("admin", () =>
      prisma.admin.findFirst({
        where: { admin_status: 10 },
        select: { admin_id: true, admin_name: true, admin_email: true },
      }),
    ),
    firstOrThrow("staff", () =>
      prisma.staff.findFirst({
        where: { deleted: 0 },
        select: { staff_id: true, staff_name: true, staff_email: true },
      }),
    ),
    firstOrThrow("candidate", () =>
      prisma.candidate.findFirst({
        where: { deleted: 0 },
        orderBy: { candidate_updated_at: "desc" },
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_email: true,
        },
      }),
    ),
    firstOrThrow("company contact", () =>
      prisma.company_contact.findFirst({
        where: { allow_access: true, contact_uuid: { not: null } },
        select: {
          contact_uuid: true,
          contact: { select: { contact_name: true, contact_email: true } },
        },
      }),
    ),
    firstOrThrow("inspector", () =>
      prisma.inspector.findFirst({
        where: { inspector_deleted: 0 },
        select: {
          inspector_uuid: true,
          inspector_name: true,
          inspector_email: true,
        },
      }),
    ),
  ]);

  fixtureCache = new Map([
    [
      "admin",
      {
        role: "admin",
        id: String(admin.admin_id),
        name: admin.admin_name,
        email: admin.admin_email,
        cookie: signSession({
          role: "admin",
          id: String(admin.admin_id),
          name: admin.admin_name,
          email: admin.admin_email,
        }),
      },
    ],
    [
      "staff",
      {
        role: "staff",
        id: String(staff.staff_id),
        name: staff.staff_name,
        email: staff.staff_email,
        cookie: signSession({
          role: "staff",
          id: String(staff.staff_id),
          name: staff.staff_name,
          email: staff.staff_email,
        }),
      },
    ],
    [
      "candidate",
      {
        role: "candidate",
        id: String(candidate.candidate_id),
        name: candidate.candidate_name,
        email: candidate.candidate_email,
        cookie: signSession({
          role: "candidate",
          id: String(candidate.candidate_id),
          name: candidate.candidate_name,
          email: candidate.candidate_email,
        }),
      },
    ],
    [
      "company",
      {
        role: "company",
        id: company.contact_uuid,
        name: company.contact.contact_name,
        email: company.contact.contact_email,
        cookie: signSession({
          role: "company",
          id: company.contact_uuid,
          name: company.contact.contact_name,
          email: company.contact.contact_email,
        }),
      },
    ],
    [
      "inspector",
      {
        role: "inspector",
        id: inspector.inspector_uuid,
        name: inspector.inspector_name,
        email: inspector.inspector_email,
        cookie: signSession({
          role: "inspector",
          id: inspector.inspector_uuid,
          name: inspector.inspector_name,
          email: inspector.inspector_email,
        }),
      },
    ],
  ]);

  return fixtureCache;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
