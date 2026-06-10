"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
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
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_language row to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.candidate_language.findFirst>>,
): LanguageItem | null {
  if (!row) return null;
  return {
    candidate_language_id: row.candidate_language_id,
    language: row.language,
    proficiency: row.proficiency,
    candidate_language_created_at: row.candidate_language_created_at,
  };
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List language records for the current candidate (paginated).
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
  const skip = (page - 1) * limit;

  const rows = await prisma.candidate_language.findMany({
    where: {
      candidate_id: Number(session.id),
      deleted: 0,
    },
    orderBy: [{ candidate_language_created_at: "desc" }, { candidate_language_id: "desc" }],
    skip,
    take: limit,
  });

  return rows.map((r) => toItem(r)!);
}

/**
 * Create a new language record for the current candidate.
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

  const created = await prisma.candidate_language.create({
    data: {
      candidate_id: Number(session.id),
      language,
      proficiency,
    },
  });

  revalidatePath("/candidate/languages");

  return { success: true, languageId: created.candidate_language_id };
}
