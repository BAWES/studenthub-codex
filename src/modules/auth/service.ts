import { prisma } from "@/lib/prisma";
import { verifyYiiPassword } from "./password";
import type { Role, SessionUser } from "./types";

type AuthResult =
  | {
      ok: true;
      user: Omit<SessionUser, "issuedAt">;
    }
  | {
      ok: false;
      message: string;
    };

export async function authenticate(role: Role, email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  if (role === "admin") {
    const user = await prisma.admin.findFirst({
      where: { admin_email: normalizedEmail, admin_status: 10 },
      select: { admin_id: true, admin_name: true, admin_email: true, admin_password_hash: true }
    });

    if (user && (await verifyYiiPassword(password, user.admin_password_hash))) {
      return {
        ok: true,
        user: { role, id: String(user.admin_id), name: user.admin_name, email: user.admin_email }
      };
    }
  }

  if (role === "staff") {
    const user = await prisma.staff.findFirst({
      where: { staff_email: normalizedEmail, deleted: 0, staff_status: 10 },
      select: { staff_id: true, staff_name: true, staff_email: true, staff_password_hash: true }
    });

    if (user && (await verifyYiiPassword(password, user.staff_password_hash))) {
      return {
        ok: true,
        user: { role, id: String(user.staff_id), name: user.staff_name, email: user.staff_email }
      };
    }
  }

  if (role === "candidate") {
    const user = await prisma.candidate.findFirst({
      where: { candidate_email: normalizedEmail, deleted: 0 },
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
        candidate_password_hash: true
      }
    });

    if (user && (await verifyYiiPassword(password, user.candidate_password_hash))) {
      return {
        ok: true,
        user: { role, id: String(user.candidate_id), name: user.candidate_name, email: user.candidate_email }
      };
    }
  }

  if (role === "company") {
    const user = await prisma.contact.findFirst({
      where: { contact_email: normalizedEmail, deleted: false },
      select: {
        contact_uuid: true,
        contact_name: true,
        contact_email: true,
        contact_password_hash: true
      }
    });

    if (user && (await verifyYiiPassword(password, user.contact_password_hash))) {
      return {
        ok: true,
        user: { role, id: user.contact_uuid, name: user.contact_name, email: user.contact_email ?? normalizedEmail }
      };
    }
  }

  if (role === "inspector") {
    const user = await prisma.inspector.findFirst({
      where: { inspector_email: normalizedEmail, inspector_deleted: 0 },
      select: {
        inspector_uuid: true,
        inspector_name: true,
        inspector_email: true,
        inspector_password_hash: true
      }
    });

    if (user && (await verifyYiiPassword(password, user.inspector_password_hash))) {
      return {
        ok: true,
        user: { role, id: user.inspector_uuid, name: user.inspector_name, email: user.inspector_email }
      };
    }
  }

  return { ok: false, message: "The credentials did not match this workspace." };
}
