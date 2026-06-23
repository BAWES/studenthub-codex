"use server";

import { redirect } from "next/navigation";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "./session";
import { verifyYiiPassword } from "./password";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ForgotPasswordState = {
  sent?: boolean;
  error?: string;
  email?: string;
};

export type ValidateTokenState = {
  valid?: boolean;
  expired?: boolean;
  error?: string;
  email?: string;
};

export type ResetPasswordState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ---------------------------------------------------------------------------
// Rate limiting — max 3 requests per email per 15 minutes
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min
const RATE_LIMIT_MAX = 3;

async function checkRateLimit(email: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const count = await prisma.passwordResetToken.count({
    where: {
      email,
      createdAt: { gte: since },
    },
  });
  return count < RATE_LIMIT_MAX;
}

// ---------------------------------------------------------------------------
// User lookup across all role tables (mirrors resolveLegacyIdentities)
// ---------------------------------------------------------------------------

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  userType: string;
};

async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const lowerEmail = email.trim().toLowerCase();

  const [candidate, contact, staff, admin, inspector] = await Promise.all([
    prisma.candidate.findFirst({
      where: { candidate_email: lowerEmail, deleted: 0 },
      select: {
        candidate_id: true,
        candidate_email: true,
        candidate_password_hash: true,
      },
    }),
    // Company accounts are contacts with contact_password_hash
    prisma.contact.findFirst({
      where: { contact_email: lowerEmail, deleted: false },
      select: {
        contact_uuid: true,
        contact_name: true,
        contact_email: true,
        contact_password_hash: true,
      },
    }),
    prisma.staff.findFirst({
      where: { staff_email: lowerEmail, deleted: 0, staff_status: 10 },
      select: {
        staff_id: true,
        staff_email: true,
        staff_password_hash: true,
      },
    }),
    prisma.admin.findFirst({
      where: { admin_email: lowerEmail, admin_status: 10 },
      select: {
        admin_id: true,
        admin_email: true,
        admin_password_hash: true,
      },
    }),
    prisma.inspector.findFirst({
      where: { inspector_email: lowerEmail, inspector_deleted: 0 },
      select: {
        inspector_uuid: true,
        inspector_email: true,
        inspector_password_hash: true,
      },
    }),
  ]);

  if (candidate?.candidate_id) {
    return {
      id: String(candidate.candidate_id),
      email: candidate.candidate_email ?? lowerEmail,
      passwordHash: candidate.candidate_password_hash ?? "",
      userType: "candidate",
    };
  }
  if (contact?.contact_uuid) {
    return {
      id: contact.contact_uuid,
      email: contact.contact_email ?? lowerEmail,
      passwordHash: contact.contact_password_hash ?? "",
      userType: "company", // Companies authenticate via contact model
    };
  }
  if (staff?.staff_id) {
    return {
      id: String(staff.staff_id),
      email: staff.staff_email ?? lowerEmail,
      passwordHash: staff.staff_password_hash ?? "",
      userType: "staff",
    };
  }
  if (admin?.admin_id) {
    return {
      id: String(admin.admin_id),
      email: admin.admin_email ?? lowerEmail,
      passwordHash: admin.admin_password_hash ?? "",
      userType: "admin",
    };
  }
  if (inspector?.inspector_uuid) {
    return {
      id: inspector.inspector_uuid,
      email: inspector.inspector_email ?? lowerEmail,
      passwordHash: inspector.inspector_password_hash ?? "",
      userType: "inspector",
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// forgotPasswordAction
// ---------------------------------------------------------------------------

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.trim()) {
    return { error: "Enter your email address.", email: "" };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: "Enter a valid email address.", email: trimmedEmail };
  }

  // Rate-limit check
  const withinLimit = await checkRateLimit(trimmedEmail);
  if (!withinLimit) {
    return {
      error: "Too many requests. Please try again in 15 minutes.",
      email: trimmedEmail,
    };
  }

  // Look up user — anti-enumeration: always return { sent: true }
  const user = await findUserByEmail(trimmedEmail);

  if (user) {
    // Generate cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Store token in DB
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        userType: user.userType,
        email: trimmedEmail,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    // In production: send email via Resend / nodemailer
    // For now: log to console
    console.log(
      `[PasswordReset] Token for ${trimmedEmail} (${user.userType}): ${rawToken}`
    );
    console.log(
      `[PasswordReset] Reset link: http://localhost:3000/reset-password?token=${rawToken}`
    );
  }

  // Always return sent — anti-enumeration
  return { sent: true, email: trimmedEmail };
}

// ---------------------------------------------------------------------------
// validateResetTokenAction
// ---------------------------------------------------------------------------

export async function validateResetTokenAction(
  token: string
): Promise<ValidateTokenState> {
  if (!token || typeof token !== "string") {
    return { error: "Invalid or missing reset link." };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return { error: "Invalid or missing reset link." };
  }

  if (record.usedAt) {
    return { error: "This link has already been used." };
  }

  if (new Date() > record.expiresAt) {
    return { expired: true, email: record.email };
  }

  return { valid: true, email: record.email };
}

// ---------------------------------------------------------------------------
// resetPasswordAction — update the password in the correct table
// ---------------------------------------------------------------------------

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // Validate token
  if (typeof token !== "string" || !token) {
    return { error: "Invalid or missing reset link." };
  }

  // Validate password fields
  if (typeof password !== "string" || !password) {
    return { error: "Enter a new password." };
  }

  if (typeof confirmPassword !== "string" || !confirmPassword) {
    return { error: "Confirm your new password." };
  }

  if (password.length < 8) {
    return {
      fieldErrors: {
        password: ["Password must be at least 8 characters."],
      },
    };
  }

  if (password !== confirmPassword) {
    return {
      fieldErrors: {
        confirmPassword: ["Passwords do not match."],
      },
    };
  }

  // Look up token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return { error: "Invalid or missing reset link." };
  }

  if (record.usedAt) {
    return { error: "This link has already been used." };
  }

  if (new Date() > record.expiresAt) {
    return { error: "This link has expired. Please request a new one." };
  }

  // Hash the new password (bcryptjs, $2b$ prefix compatible with Yii's $2y$)
  const newHash = await bcrypt.hash(password, 10);
  const yiiHash = newHash.startsWith("$2b$")
    ? `$2y$${newHash.slice(4)}`
    : newHash;

  // Update password hash in the appropriate table
  try {
    switch (record.userType) {
      case "candidate":
        await prisma.candidate.update({
          where: { candidate_id: Number(record.userId) },
          data: { candidate_password_hash: yiiHash },
        });
        break;
      case "company":
        // Company accounts use the contact model for auth
        await prisma.contact.update({
          where: { contact_uuid: record.userId },
          data: { contact_password_hash: yiiHash },
        });
        break;
      case "staff":
        await prisma.staff.update({
          where: { staff_id: Number(record.userId) },
          data: { staff_password_hash: yiiHash },
        });
        break;
      case "admin":
        await prisma.admin.update({
          where: { admin_id: Number(record.userId) },
          data: { admin_password_hash: yiiHash },
        });
        break;
      case "inspector":
        await prisma.inspector.update({
          where: { inspector_uuid: record.userId },
          data: { inspector_password_hash: yiiHash },
        });
        break;
      default:
        return { error: "Unknown account type." };
    }

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { success: true };
  } catch (err) {
    console.error("resetPasswordAction error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}