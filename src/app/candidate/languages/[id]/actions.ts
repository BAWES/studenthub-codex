"use server";

// ---------------------------------------------------------------------------
// Candidate Language [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Self-contained actions using Prisma directly with Zod validation.
//
// Actions:
//   - getLanguage    — fetch a single language entry by ID
//   - updateLanguage — update a language entry (language + proficiency)
//   - deleteLanguage — soft-delete a language entry
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getLanguageSchema,
  updateLanguageSchema,
  deleteLanguageSchema,
} from "./schemas";
import type {
  LanguageDetailResponse,
  LanguageItem,
  UpdateLanguageInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// getLanguage
// ---------------------------------------------------------------------------

/**
 * Get a single language entry by ID.
 * Only the owning candidate can view their own languages.
 */
export async function getLanguage(
  languageId: number,
): Promise<LanguageItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getLanguageSchema.safeParse({ languageId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid language ID");
  }

  const row = await prisma.candidate_language.findFirst({
    where: {
      candidate_language_id: parsed.data.languageId,
      candidate_id: candidateId,
      deleted: 0,
    },
  });

  return row;
}

// ---------------------------------------------------------------------------
// updateLanguage
// ---------------------------------------------------------------------------

/**
 * Update a language entry (language name + proficiency).
 * Verifies ownership before mutating.
 */
export async function updateLanguage(
  input: UpdateLanguageInput,
): Promise<LanguageDetailResponse> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateLanguageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify ownership
  const existing = await prisma.candidate_language.findFirst({
    where: {
      candidate_language_id: parsed.data.languageId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_language_id: true },
  });

  if (!existing) {
    return { data: null, error: "Language entry not found or access denied" };
  }

  const updated = await prisma.candidate_language.update({
    where: { candidate_language_id: parsed.data.languageId },
    data: {
      language: parsed.data.language,
      proficiency: parsed.data.proficiency,
    },
  });

  revalidatePath("/candidate/languages");
  revalidatePath(`/candidate/languages/${parsed.data.languageId}`);

  return { data: updated as unknown as LanguageItem, error: null };
}

// ---------------------------------------------------------------------------
// deleteLanguage
// ---------------------------------------------------------------------------

/**
 * Soft-delete a language entry by setting deleted = 1.
 * Only the owning candidate can delete their own entries.
 */
export async function deleteLanguage(
  languageId: number,
): Promise<LanguageDetailResponse> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = deleteLanguageSchema.safeParse({ languageId });
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify ownership
  const existing = await prisma.candidate_language.findFirst({
    where: {
      candidate_language_id: parsed.data.languageId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_language_id: true },
  });

  if (!existing) {
    return { data: null, error: "Language entry not found or access denied" };
  }

  await prisma.candidate_language.update({
    where: { candidate_language_id: parsed.data.languageId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/languages");

  return { data: null, error: null };
}
