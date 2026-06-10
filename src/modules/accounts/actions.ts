"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listAccountsSchema,
  getAccountSchema,
  type ListAccountsParams,
  type GetAccountParams,
  type AccountListItem,
  type AccountDetail,
  type ListAccountsResult,
  listCandidateSkillsSchema,
  updateEmailSchema,
  updateBankAccountSchema,
  changePasswordSchema,
  type ListCandidateSkillsParams,
  type UpdateEmailParams,
  type UpdateBankAccountParams,
  type ChangePasswordParams,
  type CandidateSkillItem,
  type SkillListResult,
  type AccountActionResult,
  type UpdateBankResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List accounts (admin users) with pagination and optional search/status filter.
 * Mirrors the legacy Yii2 AccountController::actionList pattern.
 */
export async function listAccounts(
  params: ListAccountsParams = {},
): Promise<ListAccountsResult> {
  await requireCapability("admin.read");

  const parsed = listAccountsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, search, status } = parsed.data;

  const where: Record<string, unknown> = {};
  if (status !== undefined) where.admin_status = status;
  if (status === undefined) where.admin_status = 10; // default: active only

  if (search) {
    where.OR = [
      { admin_name: { contains: search } },
      { admin_email: { contains: search } },
    ];
  }

  const [accounts, total] = await Promise.all([
    prisma.admin.findMany({
      where: where as any,
      orderBy: { admin_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        admin_id: true,
        admin_name: true,
        admin_email: true,
        admin_status: true,
        admin_created_at: true,
      },
    }),
    prisma.admin.count({ where: where as any }),
  ]);

  return {
    accounts: accounts as AccountListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single account by ID. Returns null if not found.
 * Mirrors the legacy Yii2 AccountController::actionGet pattern.
 */
export async function getAccount(
  params: GetAccountParams,
): Promise<AccountDetail | null> {
  await requireCapability("admin.read");

  const parsed = getAccountSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid account ID");
  }

  const { id } = parsed.data;

  const account = await prisma.admin.findFirst({
    where: { admin_id: id },
    select: {
      admin_id: true,
      admin_name: true,
      admin_email: true,
      admin_status: true,
      admin_limited_access: true,
      admin_created_at: true,
      admin_updated_at: true,
    },
  });

  return account as AccountDetail | null;
}

// ---------------------------------------------------------------------------
// Candidate-facing server actions
// ---------------------------------------------------------------------------

/**
 * List skills for the current candidate.
 * Mirrors the legacy Yii2 AccountController::actionUpdateSkills read flow.
 * Requires candidate.read.own capability.
 */
export async function listCandidateSkills(
  params: ListCandidateSkillsParams = {},
): Promise<SkillListResult> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listCandidateSkillsSchema.safeParse(params);
  if (parsed.success && parsed.data.candidateId !== undefined) {
    // Allow explicit override for admin/staff use cases
  }

  const skills = await prisma.candidate_skill.findMany({
    where: {
      candidate_id: candidateId,
      deleted: 0,
    },
    orderBy: { candidate_skill_created_at: "desc" },
    select: {
      candidate_skill_id: true,
      skill: true,
      candidate_skill_created_at: true,
    },
  });

  return {
    skills: skills.map((s) => ({
      candidate_skill_id: s.candidate_skill_id,
      skill: s.skill,
      candidate_skill_created_at: s.candidate_skill_created_at ?? null,
    })),
  };
}

/**
 * Update the candidate's email address.
 * Stores the new email in candidate_new_email to require verification.
 * Mirrors the legacy Yii2 AccountController::actionUpdateEmail.
 * Requires candidate.profile.edit capability.
 */
export async function updateEmail(
  params: UpdateEmailParams,
): Promise<AccountActionResult> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateEmailSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  const { email } = parsed.data;

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
    });

    if (!candidate) {
      return { operation: "error", message: "Candidate not found" };
    }

    if (
      email === candidate.candidate_email ||
      email === candidate.candidate_new_email
    ) {
      return {
        operation: "error",
        message: "New email address is the same as current email",
      };
    }

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { candidate_new_email: email },
    });

    return {
      operation: "success",
      message:
        "Account info updated successfully. Please check email to verify the new address.",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update email",
    };
  }
}

/**
 * Update the candidate's bank account details.
 * Mirrors the legacy Yii2 AccountController::actionUpdateBankDetail.
 * Requires candidate.profile.edit capability.
 */
export async function updateBankAccount(
  params: UpdateBankAccountParams,
): Promise<UpdateBankResult> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateBankAccountSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid bank details",
    };
  }

  const { benefName, iban } = parsed.data;

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
    });

    if (!candidate) {
      return { operation: "error", message: "Candidate not found" };
    }

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: {
        bank_account_name: benefName,
        candidate_iban: iban,
      },
    });

    return {
      operation: "success",
      message: "Bank details updated successfully",
      bankName: benefName,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update bank details",
    };
  }
}

/**
 * Change the candidate's password.
 * Verifies the old password, then updates to the new one.
 * Mirrors the legacy Yii2 AccountController::actionChangePassword.
 * Requires candidate.write capability.
 */
export async function changePassword(
  params: ChangePasswordParams,
): Promise<AccountActionResult> {
  const session = await requireCapability("candidate.write");
  const candidateId = Number(session.id);

  const parsed = changePasswordSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid password data",
    };
  }

  const { oldPassword, newPassword } = parsed.data;

  if (oldPassword === newPassword) {
    return {
      operation: "error",
      message: "New password cannot be the same as the current password",
    };
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
    });

    if (!candidate) {
      return { operation: "error", message: "Candidate not found" };
    }

    if (!candidate.candidate_password_hash) {
      return { operation: "error", message: "No password set for this account" };
    }

    const valid = await bcrypt.compare(
      oldPassword,
      candidate.candidate_password_hash,
    );
    if (!valid) {
      return { operation: "error", message: "Current password is incorrect" };
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { candidate_password_hash: newHash },
    });

    return {
      operation: "success",
      message: "Password changed successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to change password",
    };
  }
}
