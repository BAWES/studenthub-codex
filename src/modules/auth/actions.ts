"use server";

import { redirect } from "next/navigation";
import { resolveLegacyIdentities } from "./service";
import {
  clearPendingAccounts,
  clearSession,
  createPendingAccounts,
  createSession,
  getPendingAccounts,
  getSession,
} from "./session";
import type { LoginState } from "./types";
import type { ChangePasswordState } from "./schemas";

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
    redirect("/app");
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
  redirect("/app");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// switchRoleAction — switch the active role for multi-role users
// ---------------------------------------------------------------------------

export async function switchRoleAction(formData: FormData) {
  const targetRole = formData.get("targetRole");
  const sessionUser = await getSession();
  if (sessionUser) {
    await createSession({ ...sessionUser, role: targetRole });
  }
  redirect("/app");
}

// ---------------------------------------------------------------------------
// changePassword — change the authenticated user's password
// ---------------------------------------------------------------------------

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { error: "All fields are required." };
  }

  if (newPassword.length < 5) {
    return { error: "New password must be at least 5 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { fieldErrors: { confirmPassword: ["Passwords do not match"] } };
  }

  if (currentPassword === newPassword) {
    return { fieldErrors: { newPassword: ["New password must be different from current password"] } };
  }

  // In production this would call a password update service.
  return { success: true };
}

// ---------------------------------------------------------------------------
// verifySession — retrieve the current session state
// ---------------------------------------------------------------------------

export async function verifySession() {
  const user = await getSession();
  if (user) {
    return { authenticated: true as const, user };
  }
  return { authenticated: false as const, user: null as null };
}
