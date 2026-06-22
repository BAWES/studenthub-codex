"use server";

import { redirect } from "next/navigation";
import { resolveLegacyIdentities } from "./service";
import { clearSession, createSession } from "./session";
import type { LoginState, Role, Capability } from "./types";

/** Role priority for singular experience — auto-select highest privilege. */
const ROLE_PRIORITY: Record<string, number> = {
  admin: 5,
  staff: 4,
  company: 3,
  inspector: 2,
  candidate: 1,
};

function pickBestAccount(accounts: {
  role: Role;
  accountKey: string;
  label: string;
  name: string;
  email: string;
  id: string;
  legacyType?: Role;
  capabilities?: string[];
}[]) {
  return accounts.sort((a, b) => (ROLE_PRIORITY[b.role] ?? 0) - (ROLE_PRIORITY[a.role] ?? 0))[0];
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return {
      error: "Enter your email and password.",
      email: typeof email === "string" ? email : "",
    };
  }

  const accounts = await resolveLegacyIdentities(email, password);
  if (!accounts.length) {
    return { error: "The credentials did not match any active StudentHub account.", email };
  }

  const best = pickBestAccount(accounts);
  const { accountKey: _accountKey, label: _label, ...user } = best;
  await createSession({
    role: user.role,
    id: user.id,
    name: user.name,
    email: user.email,
    capabilities: user.capabilities as Capability[] | undefined,
    legacyType: user.legacyType,
  });
  redirect("/app");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
