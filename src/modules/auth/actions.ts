"use server";

import { redirect } from "next/navigation";
import { authenticate } from "./service";
import { clearSession, createSession } from "./session";
import type { LoginState } from "./types";
import { isRole } from "./types";

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const role = formData.get("role");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!isRole(role) || typeof email !== "string" || typeof password !== "string") {
    return {
      error: "Choose a workspace and enter your credentials.",
      email: typeof email === "string" ? email : "",
      role: isRole(role) ? role : "admin"
    };
  }

  const result = await authenticate(role, email, password);
  if (!result.ok) {
    return { error: result.message, email, role };
  }

  await createSession(result.user);
  redirect(`/${result.user.role}`);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
