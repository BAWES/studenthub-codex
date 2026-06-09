"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/modules/auth/session";
import type { Role } from "@/modules/auth/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RegisterState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const signupRoles = ["candidate", "company"] as const;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Enter your full name.")
      .max(255, "Name is too long."),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    password: z
      .string({ required_error: "Password is required" })
      .min(5, "Password must be at least 5 characters."),
    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password."),
    role: z.enum(signupRoles, {
      required_error: "Select whether you want to work or hire.",
      invalid_type_error: "Select whether you want to work or hire.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hashPassword(password: string): string {
  const hash = bcrypt.hashSync(password, 10);
  // Normalize $2b$ → $2y$ prefix for Yii2 compatibility
  return hash.startsWith("$2b$") ? `$2y$${hash.slice(4)}` : hash;
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      role: formData.get("role"),
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

    const { name, email, password, role } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = hashPassword(password);
    const now = new Date();

    // Check for duplicate email across both signup-eligible tables
    const [existingCandidate, existingContact] = await Promise.all([
      prisma.candidate.findFirst({
        where: { candidate_email: normalizedEmail, deleted: 0 },
        select: { candidate_id: true },
      }),
      prisma.contact.findFirst({
        where: { contact_email: normalizedEmail, deleted: false },
        select: { contact_uuid: true },
      }),
    ]);

    if (existingCandidate || existingContact) {
      return { error: "An account with this email already exists. Try signing in." };
    }

    if (role === "candidate") {
      const created = await prisma.candidate.create({
        data: {
          candidate_name: name.trim(),
          candidate_name_ar: name.trim(),
          candidate_email: normalizedEmail,
          candidate_password_hash: passwordHash,
          approved: 0, // Requires admin approval before becoming active
          candidate_status: 10, // Active status
          candidate_created_at: now,
          candidate_updated_at: now,
          candidate_language_pref: "en",
          currency_code: "KWD",
          deleted: 0,
          candidate_committed: true,
          is_incomplete_profile: true, // Marked incomplete — will prompt profile setup
        },
      });

      await createSession({
        role: "candidate" as Role,
        id: String(created.candidate_id),
        name: created.candidate_name,
        email: created.candidate_email,
      });

      redirect("/candidate");
    }

    if (role === "company") {
      const contactUuid = crypto.randomUUID();

      const created = await prisma.contact.create({
        data: {
          contact_uuid: contactUuid,
          contact_name: name.trim(),
          contact_email: normalizedEmail,
          contact_password_hash: passwordHash,
          contact_status: 10, // Active
          contact_created_at: now,
          contact_updated_at: now,
        },
      });

      await createSession({
        role: "company" as Role,
        id: created.contact_uuid,
        name: created.contact_name,
        email: created.contact_email ?? normalizedEmail,
      });

      redirect("/company");
    }

    return { error: "Invalid role selected." };
  } catch (err) {
    console.error("registerAction error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
