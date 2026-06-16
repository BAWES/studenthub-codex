import { NextResponse } from "next/server";
import { findUserForImpersonation } from "@/modules/auth/actions";
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

  const user = await findUserForImpersonation(role);
  if (!user) {
    return new Response(`No ${role} account found in the local database`, { status: 404 });
  }

  await createSession(user);
  const next = url.searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return NextResponse.redirect(new URL(destination, url));
}
