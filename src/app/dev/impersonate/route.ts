import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/modules/auth/session";
import { roles, type Role } from "@/modules/auth/types";

function isRole(value: string | null): value is Role {
  return Boolean(value && roles.includes(value as Role));
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development" || process.env.DEV_IMPERSONATION_ENABLED !== "1") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role");

  if (!isRole(role)) {
    return new Response("Use ?role=admin|staff|candidate|company|inspector", { status: 400 });
  }

  const user = await findUser(role);
  if (!user) {
    return new Response(`No ${role} account found in the local database`, { status: 404 });
  }

  await createSession(user);
  const next = url.searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return NextResponse.redirect(new URL(destination, url));
}

async function findUser(role: Role) {
  if (role === "admin") {
    const user = await prisma.admin.findFirst({
      where: { admin_status: 10 },
      select: { admin_id: true, admin_name: true, admin_email: true }
    });
    return user ? { role, id: String(user.admin_id), name: user.admin_name, email: user.admin_email } : null;
  }

  if (role === "staff") {
    const user = await prisma.staff.findFirst({
      where: {
        deleted: 0,
        staff_status: 10,
        candidate_work_history: { some: { candidate_id: { not: null } } }
      },
      select: { staff_id: true, staff_name: true, staff_email: true }
    });
    return user ? { role, id: String(user.staff_id), name: user.staff_name, email: user.staff_email } : null;
  }

  if (role === "candidate") {
    const user = await prisma.candidate.findFirst({
      where: { deleted: 0, candidate_email: { not: "" } },
      orderBy: { candidate_updated_at: "desc" },
      select: { candidate_id: true, candidate_name: true, candidate_email: true }
    });
    return user ? { role, id: String(user.candidate_id), name: user.candidate_name, email: user.candidate_email } : null;
  }

  if (role === "company") {
    const user = await prisma.contact.findFirst({
      where: { deleted: false, contact_email: { not: "" }, company_contact: { some: { allow_access: true } } },
      select: { contact_uuid: true, contact_name: true, contact_email: true }
    });
    return user ? { role, id: user.contact_uuid, name: user.contact_name, email: user.contact_email ?? "" } : null;
  }

  const user = await prisma.inspector.findFirst({
    where: { inspector_deleted: 0, inspector_email: { not: "" } },
    select: { inspector_uuid: true, inspector_name: true, inspector_email: true }
  });
  return user ? { role, id: user.inspector_uuid, name: user.inspector_name, email: user.inspector_email } : null;
}
