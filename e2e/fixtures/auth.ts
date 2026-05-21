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

async function firstOrThrow<T>(label: string, query: () => Promise<T | null>): Promise<T> {
  const value = await query();
  if (!value) throw new Error(`Missing fixture data: ${label}`);
  return value;
}

let fixtureCache: Map<string, FixtureUser> | null = null;

export async function getFixtures(): Promise<Map<string, FixtureUser>> {
  if (fixtureCache) return fixtureCache;

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
        select: { candidate_id: true, candidate_name: true, candidate_email: true },
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
        select: { inspector_uuid: true, inspector_name: true, inspector_email: true },
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
