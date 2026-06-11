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

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return {
      error: "Enter your email and password.",
      email: typeof email === "string" ? email : ""
    };
  }

  const accounts = await resolveLegacyIdentities(email, password);
  if (!accounts.length) {
    await clearPendingAccounts();
    return { error: "The credentials did not match any active StudentHub account.", email };
  }

  if (accounts.length === 1) {
    const { accountKey: _accountKey, label: _label, ...user } = accounts[0];
    await createSession(user);
    redirect(roleDefaultRoute(user.role));
  }

  await createPendingAccounts(accounts);
  return {
    email,
    accounts: accounts.map((account) => ({
      accountKey: account.accountKey,
      role: account.role,
      label: account.label,
      name: account.name,
      email: account.email
    }))
  };
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
  await createSession(user);
  redirect(roleDefaultRoute(user.role));
}

export async function verifySession() {
  try {
    const session = await getSession();
    if (!session) {
      return { authenticated: false as const, user: null };
    }
    return {
      authenticated: true as const,
      user: {
        role: session.role,
        id: session.id,
        name: session.name,
        email: session.email,
        issuedAt: session.issuedAt,
      },
    };
  } catch {
    return { authenticated: false as const, user: null };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// changePassword — candidate self-service password change
// ---------------------------------------------------------------------------

export type ChangePasswordState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

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
  try {
    const session = await getSession();
    if (!session) {
      return { error: "You must be logged in to change your password." };
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
      return { fieldErrors };
    }

    const { currentPassword, newPassword } = parsed.data;

    // Look up the candidate by session ID
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: Number(session.id) },
      select: { candidate_id: true, candidate_password_hash: true },
    });

    if (!candidate) {
      return { error: "Candidate account not found." };
    }

    // Verify current password against stored hash
    const isValid = await verifyYiiPassword(
      currentPassword,
      candidate.candidate_password_hash
    );

    if (!isValid) {
      return { error: "Current password is incorrect." };
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

    return { success: true };
  } catch (err) {
    console.error("changePassword error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
