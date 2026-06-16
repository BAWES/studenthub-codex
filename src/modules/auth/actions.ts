"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { resolveLegacyIdentities } from "./service";
import { clearPendingAccounts, clearSession, createPendingAccounts, createSession, getPendingAccounts, getSession } from "./session";
import { verifyYiiPassword } from "./password";
import { roleDefaultRoute } from "./types";
import type { LoginState } from "./types";

import {
  loginStateSchema,
  verifySessionResultSchema,
  changePasswordStateSchema,
  switchRoleSchema,
  impersonationUserSchema,
} from "./schemas";
import type { ChangePasswordState, ImpersonationUser } from "./schemas";

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    const result = {
      error: "Enter your email and password.",
      email: typeof email === "string" ? email : ""
    };
    const outputParsed = loginStateSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/auth] loginAction output validation failed:", outputParsed.error.issues);
    }
    return result;
  }

  const accounts = await resolveLegacyIdentities(email, password);
  if (!accounts.length) {
    await clearPendingAccounts();
    const result = { error: "The credentials did not match any active StudentHub account.", email };
    const outputParsed = loginStateSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/auth] loginAction output validation failed:", outputParsed.error.issues);
    }
    return result;
  }

  if (accounts.length === 1) {
    const { accountKey: _accountKey, label: _label, ...user } = accounts[0];
    await createSession(user);
    redirect(roleDefaultRoute(user.role));
  }

  await createPendingAccounts(accounts);
  const result = {
    email,
    accounts: accounts.map((account) => ({
      accountKey: account.accountKey,
      role: account.role,
      label: account.label,
      name: account.name,
      email: account.email
    }))
  };
  const outputParsed = loginStateSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/auth] loginAction output validation failed:", outputParsed.error.issues);
  }
  return result;
}

export async function chooseAccountAction(formData: FormData) {
  const accountKey = formData.get("accountKey");
  if (typeof accountKey !== "string") {
    redirect("/login?error=account");
  }

  const accounts = await getPendingAccounts();
  const account = accounts.find((item) => item.accountKey === accountKey);
  if (!account) {
    await clearPendingAccounts();
    redirect("/login?error=expired");
  }

  const { accountKey: _accountKey, label: _label, ...user } = account;
  // Include all pending roles so the session knows the user can switch
  const allRoles = accounts.map((a) => a.role);
  await createSession({ ...user, roles: allRoles.length > 1 ? allRoles : undefined });
  redirect(roleDefaultRoute(user.role));
}

export async function verifySession() {
  try {
    const session = await getSession();
    if (!session) {
      const result = { authenticated: false as const, user: null };
      const outputParsed = verifySessionResultSchema.safeParse(result);
      if (!outputParsed.success) {
        console.error("[modules/auth] verifySession output validation failed:", outputParsed.error.issues);
      }
      return result;
    }
    const result = {
      authenticated: true as const,
      user: {
        role: session.role,
        roles: session.roles,
        id: session.id,
        name: session.name,
        email: session.email,
        issuedAt: session.issuedAt,
      },
    };
    const outputParsed = verifySessionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/auth] verifySession output validation failed:", outputParsed.error.issues);
    }
    return result;
  } catch {
    const result = { authenticated: false as const, user: null };
    const outputParsed = verifySessionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/auth] verifySession output validation failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

/**
 * Switch the active role for a multi-role user without re-login.
 * The user must have the target role in their `roles` array.
 * Updates the session cookie with the new active role and redirects.
 */
export async function switchRoleAction(formData: FormData) {
  const targetRole = formData.get("targetRole");
  const parsed = switchRoleSchema.safeParse({ targetRole });
  if (!parsed.success) {
    redirect("/login?error=invalid-role");
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userRoles = session.roles ?? [session.role];
  if (!userRoles.includes(parsed.data.targetRole)) {
    redirect("/login?error=role-denied");
  }

  const { issuedAt: _issuedAt, ...sessionData } = session;
  await createSession({
    ...sessionData,
    role: parsed.data.targetRole,
    roles: userRoles,
  });
  redirect(roleDefaultRoute(parsed.data.targetRole));
}

// ---------------------------------------------------------------------------
// changePassword — candidate self-service password change
// ---------------------------------------------------------------------------

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(5, "New password must be at least 5 characters"),
    confirmPassword: z
      .string({ required_error: "Please confirm your new password" })
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  function validateAndReturn(state: ChangePasswordState): ChangePasswordState {
    const outputParsed = changePasswordStateSchema.safeParse(state);
    if (!outputParsed.success) {
      console.error("[modules/auth] changePassword output validation failed:", outputParsed.error.issues);
    }
    return state;
  }

  try {
    const session = await getSession();
    if (!session) {
      return validateAndReturn({ error: "You must be logged in to change your password." });
    }

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      return validateAndReturn({ fieldErrors });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Look up the candidate by session ID
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: Number(session.id) },
      select: { candidate_id: true, candidate_password_hash: true },
    });

    if (!candidate) {
      return validateAndReturn({ error: "Candidate account not found." });
    }

    // Verify current password against stored hash
    const isValid = await verifyYiiPassword(
      currentPassword,
      candidate.candidate_password_hash
    );

    if (!isValid) {
      return validateAndReturn({ error: "Current password is incorrect." });
    }

    // Hash the new password (bcryptjs, $2b$ prefix compatible with Yii's $2y$)
    const newHash = await bcrypt.hash(newPassword, 10);
    // Normalize to Yii-compatible $2y$ prefix
    const yiiHash = newHash.startsWith("$2b$")
      ? `$2y$${newHash.slice(4)}`
      : newHash;

    await prisma.candidate.update({
      where: { candidate_id: candidate.candidate_id },
      data: { candidate_password_hash: yiiHash },
    });

    return validateAndReturn({ success: true });
  } catch (err) {
    console.error("changePassword error:", err);
    return validateAndReturn({ error: "An unexpected error occurred. Please try again." });
  }
}

// ---------------------------------------------------------------------------
// Dev Impersonation — NODE_ENV=development only
// ---------------------------------------------------------------------------

/**
 * Look up a user by role for dev impersonation.
 * Maps to GET /dev/impersonate?role=admin|staff|candidate|company|inspector
 *
 * GUARDED: Only works in development with DEV_IMPERSONATION_ENABLED=1.
 * Never call this in production — use requireCapability instead.
 */
export async function findUserForImpersonation(
  role: ImpersonationUser["role"],
): Promise<ImpersonationUser | null> {
  const parsed = impersonationUserSchema.shape.role.safeParse(role);
  if (!parsed.success) return null;

  switch (role) {
    case "admin": {
      const user = await prisma.admin.findFirst({
        where: { admin_status: 10 },
        select: { admin_id: true, admin_name: true, admin_email: true },
      });
      return user
        ? { role, id: String(user.admin_id), name: user.admin_name ?? "", email: user.admin_email }
        : null;
    }

    case "staff": {
      const user = await prisma.staff.findFirst({
        where: {
          deleted: 0,
          staff_status: 10,
          candidate_work_history: { some: { candidate_id: { not: null } } },
        },
        select: { staff_id: true, staff_name: true, staff_email: true },
      });
      return user
        ? { role, id: String(user.staff_id), name: user.staff_name ?? "", email: user.staff_email }
        : null;
    }

    case "candidate": {
      const user = await prisma.candidate.findFirst({
        where: { deleted: 0, candidate_email: { not: "" } },
        orderBy: { candidate_updated_at: "desc" },
        select: { candidate_id: true, candidate_name: true, candidate_email: true },
      });
      return user
        ? { role, id: String(user.candidate_id), name: user.candidate_name ?? "", email: user.candidate_email }
        : null;
    }

    case "company": {
      const user = await prisma.contact.findFirst({
        where: { deleted: false, contact_email: { not: "" }, company_contact: { some: { allow_access: true } } },
        select: { contact_uuid: true, contact_name: true, contact_email: true },
      });
      return user
        ? { role, id: user.contact_uuid, name: user.contact_name ?? "", email: user.contact_email ?? "" }
        : null;
    }

    case "inspector": {
      const user = await prisma.inspector.findFirst({
        where: { inspector_deleted: 0, inspector_email: { not: "" } },
        select: { inspector_uuid: true, inspector_name: true, inspector_email: true },
      });
      return user
        ? { role, id: user.inspector_uuid, name: user.inspector_name ?? "", email: user.inspector_email }
        : null;
    }

    default:
      return null;
  }
}
