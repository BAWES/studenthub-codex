import { prisma } from "@/lib/prisma";
import { verifyYiiPassword } from "./password";
import type { Role, SessionUser } from "./types";

export type VerifiedLegacyAccount = Omit<SessionUser, "issuedAt"> & {
  accountKey: string;
  label: string;
};

type AuthResult =
  | {
      ok: true;
      user: Omit<SessionUser, "issuedAt">;
    }
  | {
      ok: false;
      message: string;
    };

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  company: "Company",
  candidate: "Candidate",
  inspector: "Inspector"
};

function verifiedAccount(user: Omit<SessionUser, "issuedAt">): VerifiedLegacyAccount {
  return {
    ...user,
    accountKey: `${user.role}:${user.id}`,
    label: roleLabels[user.role]
  };
}

export async function resolveLegacyIdentities(email: string, password: string): Promise<VerifiedLegacyAccount[]> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return [];

  const [admin, staff, candidate, contact, inspector] = await prisma.$transaction([
    prisma.admin.findFirst({
      where: { admin_email: normalizedEmail, admin_status: 10 },
      select: { admin_id: true, admin_name: true, admin_email: true, admin_password_hash: true }
    }),
    prisma.staff.findFirst({
      where: { staff_email: normalizedEmail, deleted: 0, staff_status: 10 },
      select: { staff_id: true, staff_name: true, staff_email: true, staff_password_hash: true }
    }),
    prisma.candidate.findFirst({
      where: { candidate_email: normalizedEmail, deleted: 0 },
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
        candidate_password_hash: true
      }
    }),
    prisma.contact.findFirst({
      where: { contact_email: normalizedEmail, deleted: false },
      select: {
        contact_uuid: true,
        contact_name: true,
        contact_email: true,
        contact_password_hash: true
      }
    }),
    prisma.inspector.findFirst({
      where: { inspector_email: normalizedEmail, inspector_deleted: 0 },
      select: {
        inspector_uuid: true,
        inspector_name: true,
        inspector_email: true,
        inspector_password_hash: true
      }
    })
  ]);

  const accounts: VerifiedLegacyAccount[] = [];

  if (admin && (await verifyYiiPassword(password, admin.admin_password_hash))) {
    accounts.push(
      verifiedAccount({ role: "admin", id: String(admin.admin_id), name: admin.admin_name, email: admin.admin_email })
    );
  }

  if (staff && (await verifyYiiPassword(password, staff.staff_password_hash))) {
    accounts.push(
      verifiedAccount({ role: "staff", id: String(staff.staff_id), name: staff.staff_name, email: staff.staff_email })
    );
  }

  if (candidate && (await verifyYiiPassword(password, candidate.candidate_password_hash))) {
    accounts.push(
      verifiedAccount({
        role: "candidate",
        id: String(candidate.candidate_id),
        name: candidate.candidate_name,
        email: candidate.candidate_email
      })
    );
  }

  if (contact && (await verifyYiiPassword(password, contact.contact_password_hash))) {
    accounts.push(
      verifiedAccount({
        role: "company",
        id: contact.contact_uuid,
        name: contact.contact_name,
        email: contact.contact_email ?? normalizedEmail
      })
    );
  }

  if (inspector && (await verifyYiiPassword(password, inspector.inspector_password_hash))) {
    accounts.push(
      verifiedAccount({
        role: "inspector",
        id: inspector.inspector_uuid,
        name: inspector.inspector_name,
        email: inspector.inspector_email
      })
    );
  }

  return accounts;
}

export async function authenticate(role: Role, email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  const verified = await resolveLegacyIdentities(email, password);
  const account = verified.find((item) => item.role === role);
  if (account) {
    const { accountKey: _accountKey, label: _label, ...user } = account;
    return { ok: true, user };
  }

  return { ok: false, message: "The credentials did not match this workspace." };
}
