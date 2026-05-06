import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { enrichSessionUser, hasCapability } from "./capabilities";
import type { Capability, Role, SessionUser } from "./types";
import type { VerifiedLegacyAccount } from "./service";

const cookieName = "studenthub_next_session";
const pendingAccountCookieName = "studenthub_pending_accounts";
const maxAge = 60 * 60 * 24 * 7;
const pendingMaxAge = 60 * 10;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is required");
  }
  return value;
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encodeSession(user: SessionUser) {
  const payload = base64Url(JSON.stringify(enrichSessionUser(user)));
  return `${payload}.${sign(payload)}`;
}

function decodeSession(value: string | undefined): SessionUser | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expectedSignature = sign(payload);
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
    if (!parsed.role || !parsed.id || !parsed.email) return null;
    return enrichSessionUser(parsed);
  } catch {
    return null;
  }
}

export async function createSession(user: Omit<SessionUser, "issuedAt">) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, encodeSession({ ...user, issuedAt: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
  cookieStore.delete(pendingAccountCookieName);
}

export async function getSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(cookieName)?.value);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
  cookieStore.delete(pendingAccountCookieName);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.role !== role) redirect(`/hub?required=${role}`);
  return session;
}

export async function requireCapability(capability: Capability) {
  const session = await requireSession();
  if (!hasCapability(session, capability)) redirect("/hub?required=access");
  return session;
}

export async function requireRoleCapability(role: Role, capability: Capability) {
  const session = await requireRole(role);
  if (!hasCapability(session, capability)) redirect("/hub?required=access");
  return session;
}

export async function createPendingAccounts(accounts: VerifiedLegacyAccount[]) {
  const cookieStore = await cookies();
  cookieStore.set(pendingAccountCookieName, encodeSession({ role: "admin", id: "pending", name: "Pending", email: "pending@studenthub.local", issuedAt: Date.now(), accounts } as SessionUser & { accounts: VerifiedLegacyAccount[] }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: pendingMaxAge
  });
}

export async function getPendingAccounts() {
  const cookieStore = await cookies();
  const pending = decodeSession(cookieStore.get(pendingAccountCookieName)?.value) as (SessionUser & {
    accounts?: VerifiedLegacyAccount[];
  }) | null;
  return pending?.accounts ?? [];
}

export async function clearPendingAccounts() {
  const cookieStore = await cookies();
  cookieStore.delete(pendingAccountCookieName);
}
