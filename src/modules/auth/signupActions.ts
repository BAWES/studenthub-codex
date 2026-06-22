"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "./signupSchema";
import type { SignupState } from "./signupSchema";
import { createSession } from "./session";

async function makeAuthKey(): Promise<string> {
  return crypto.randomBytes(16).toString("hex");
}

async function makeContactUUID(): Promise<string> {
  return `c${crypto.randomUUID().replace(/-/g, "").slice(0, 59)}`;
}

async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, 10);
  return hash.startsWith("$2b$") ? `$2y$${hash.slice(4)}` : hash;
}

// ---------------------------------------------------------------------------
// signupAction — create a new account and redirect to the right workspace
// ---------------------------------------------------------------------------

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  try {
    const parsed = signupSchema.safeParse({
      role: formData.get("role"),
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      return {
        fieldErrors,
        role: (formData.get("role") as string) ?? undefined,
        email: (formData.get("email") as string) ?? undefined,
      };
    }

    const { role, name, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);
    const authKey = await makeAuthKey();
    const now = new Date();

    if (role === "worker") {
      // Check if email already exists as a candidate
      const existingCandidate = await prisma.candidate.findFirst({
        where: { candidate_email: normalizedEmail, deleted: 0 },
        select: { candidate_id: true },
      });

      if (existingCandidate) {
        return {
          error: "An account with this email already exists. Try signing in instead.",
          role,
          email,
        };
      }

      const candidate = await prisma.candidate.create({
        data: {
          candidate_name: name.trim(),
          candidate_name_ar: name.trim(),
          candidate_email: normalizedEmail,
          candidate_password_hash: passwordHash,
          candidate_auth_key: authKey,
          candidate_status: 10,
          approved: 10,
          candidate_created_at: now,
          candidate_updated_at: now,
        },
      });

      await createSession({
        role: "candidate",
        id: String(candidate.candidate_id),
        name: candidate.candidate_name,
        email: candidate.candidate_email,
      });

      redirect("/candidate");
    }

    // Employer role
    // Check if email already exists as a contact
    const existingContact = await prisma.contact.findFirst({
      where: { contact_email: normalizedEmail, deleted: false },
      select: { contact_uuid: true },
    });

    if (existingContact) {
      return {
        error: "An account with this email already exists. Try signing in instead.",
        role,
        email,
      };
    }

    const contact = await prisma.contact.create({
      data: {
        contact_uuid: await makeContactUUID(),
        contact_name: name.trim(),
        contact_email: normalizedEmail,
        contact_password_hash: passwordHash,
        contact_auth_key: authKey,
        contact_status: 10,
        contact_created_at: now,
        contact_updated_at: now,
      },
    });

    await createSession({
      role: "company",
      id: contact.contact_uuid,
      name: contact.contact_name,
      email: contact.contact_email ?? normalizedEmail,
    });

    redirect("/company");
  } catch (err) {
    console.error("signupAction error:", err);
    return {
      error: "An unexpected error occurred. Please try again.",
      role: (formData.get("role") as string) ?? undefined,
      email: (formData.get("email") as string) ?? undefined,
    };
  }
}
