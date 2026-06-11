"use server";

// ---------------------------------------------------------------------------
// Candidate Language [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/candidates/languages for
// viewing, editing, and deleting a single language entry.
//
// Actions:
//   - getLanguage    — fetch a single language entry by ID
//   - updateLanguage — update a language entry (language + proficiency)
//   - deleteLanguage — soft-delete a language entry
// ---------------------------------------------------------------------------

import { requireRoleCapability } from "@/modules/auth/session";
import {
  getLanguage as moduleGetLanguage,
  updateLanguage as moduleUpdateLanguage,
  deleteLanguage as moduleDeleteLanguage,
} from "@/modules/candidates/languages/actions";
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
 * Delegates to modules/candidates/languages.
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

  return moduleGetLanguage({ candidateId, languageId: parsed.data.languageId });
}

// ---------------------------------------------------------------------------
// updateLanguage
// ---------------------------------------------------------------------------

/**
 * Update a language entry (language name + proficiency).
 * Verifies ownership before mutating.
 * Delegates to modules/candidates/languages.
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

  return moduleUpdateLanguage({
    candidateId,
    languageId: parsed.data.languageId,
    language: parsed.data.language,
    proficiency: parsed.data.proficiency,
  });
}

// ---------------------------------------------------------------------------
// deleteLanguage
// ---------------------------------------------------------------------------

/**
 * Soft-delete a language entry by setting deleted = 1.
 * Only the owning candidate can delete their own entries.
 * Delegates to modules/candidates/languages.
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
      error: "Invalid language ID",
    };
  }

  return moduleDeleteLanguage({
    candidateId,
    languageId: parsed.data.languageId,
  });
}
