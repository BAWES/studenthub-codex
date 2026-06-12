"use server";

import { redirect } from "next/navigation";
import { resolveLegacyIdentities } from "./service";
import { clearPendingAccounts, clearSession, createPendingAccounts, createSession, getPendingAccounts, requireSession } from "./session";
import type { LoginState, Role } from "./types";

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
    await createSession({ ...user, roles: [{ role: user.role as Role, id: user.id }] });
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
  const roles = accounts.map((a) => ({ role: a.role as Role, id: a.id }));
  await createSession({ ...user, roles });
  redirect("/app");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function switchRoleAction(targetRole: Role) {
  const session = await requireSession();
  const account = (session.roles ?? []).find((r: { role: Role; id: string }) => r.role === targetRole);
  if (!account) throw new Error("Unauthorized role switch");

  await createSession({
    role: targetRole,
    id: account.id,
    name: session.name,
    email: session.email,
    roles: session.roles
  });
  redirect("/app");
}
