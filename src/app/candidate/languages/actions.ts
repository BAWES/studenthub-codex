"use server";

// ---------------------------------------------------------------------------
// Candidate Languages — server actions for the list/create page
// ---------------------------------------------------------------------------
// Provides language listing and creation for the /candidate/languages page.
// Delegates all data access to modules/candidates/languages.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listLanguages as moduleListLanguages,
  createLanguage as moduleCreateLanguage,
} from "@/modules/candidates/languages/actions";
import {
  listLanguagesSchema,
  createLanguageSchema,
} from "./schemas";
import type {
  ListLanguagesInput,
  CreateLanguageInput,
  LanguageItem,
  LanguageActionResult,
} from "./schemas";

// Re-export types for client components
export type { LanguageActionResult, LanguageItem };

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List language records for the current candidate (paginated).
 * Delegates to modules/candidates/languages with the session's candidate ID.
 */
export async function listCandidateLanguages(
  input: ListLanguagesInput = {},
): Promise<LanguageItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listLanguagesSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid languages list params",
    );
  }

  const { page, limit } = parsed.data;

  return moduleListLanguages({
    candidateId: Number(session.id),
    page,
    limit,
  });
}

/**
 * Create a new language record for the current candidate.
 * Delegates to modules/candidates/languages with the session's candidate ID.
 */
export async function createCandidateLanguage(
  data: CreateLanguageInput,
): Promise<LanguageActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createLanguageSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { language, proficiency } = parsed.data;

  const result = await moduleCreateLanguage({
    candidateId: Number(session.id),
    language,
    proficiency,
  });

  revalidatePath("/candidate/languages");

  return result;
}
