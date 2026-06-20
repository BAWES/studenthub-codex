"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
import {
  listLanguagesSchema,
  getLanguageSchema,
  createLanguageSchema,
  updateLanguageSchema,
  deleteLanguageSchema,
  languageItemSchema,
  languageActionResultSchema,
  languageDetailResponseSchema,
  type ListLanguagesParams,
  type GetLanguageParams,
  type CreateLanguageParams,
  type UpdateLanguageParams,
  type DeleteLanguageParams,
  type LanguageItem,
  type LanguageActionResult,
  type LanguageDetailResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/languages] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List language entries for a candidate (paginated).
 * Requires candidate.read.own capability.
 */
export async function listLanguages(
  params: ListLanguagesParams = {},
): Promise<LanguageItem[]> {
  await requireCapability("candidate.read.own");

  const parsed = listLanguagesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { candidateId, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: { candidate_id?: number; deleted: number } = { deleted: 0 };
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const rows = await prisma.candidate_language.findMany({
    where,
    orderBy: [
      { candidate_language_created_at: "desc" },
      { candidate_language_id: "desc" },
    ],
    skip,
    take: limit,
  });

  const items: LanguageItem[] = rows.map((r) => ({
    candidate_language_id: r.candidate_language_id,
    language: r.language,
    proficiency: r.proficiency,
    candidate_language_created_at: r.candidate_language_created_at,
  }));

  // Output validation
  const arrSchema = z.array(languageItemSchema);
  const outputParsed = arrSchema.safeParse(items);
  if (!outputParsed.success) {
    logOutputError("listLanguages", outputParsed.error.issues);
  }

  return items;
}

/**
 * Get a single language entry by ID.
 * Scoped to the authenticated candidate.
 * Requires candidate.read.own capability.
 */
export async function getLanguage(
  params: GetLanguageParams,
): Promise<LanguageItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getLanguageSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid language ID");
  }

  const { candidateId, languageId } = parsed.data;

  const row = await prisma.candidate_language.findFirst({
    where: {
      candidate_language_id: languageId,
      candidate_id: candidateId,
      deleted: 0,
    },
  });

  if (!row) return null;

  const result: LanguageItem = {
    candidate_language_id: row.candidate_language_id,
    language: row.language,
    proficiency: row.proficiency,
    candidate_language_created_at: row.candidate_language_created_at,
  };

  const outputParsed = languageItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getLanguage", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new language entry for a candidate.
 * Requires candidate.read.own capability.
 */
export async function createLanguage(
  params: CreateLanguageParams,
): Promise<LanguageActionResult> {
  await requireCapability("candidate.read.own");

  const parsed = createLanguageSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { candidateId, language, proficiency } = parsed.data;

  const created = await prisma.candidate_language.create({
    data: {
      candidate_id: candidateId,
      language,
      proficiency,
    },
  });

  revalidatePath("/candidate/languages");

  const result: LanguageActionResult = {
    success: true,
    languageId: created.candidate_language_id,
  };

  const outputParsed = languageActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createLanguage", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing language entry.
 * Verifies ownership via candidateId before updating.
 * Requires candidate.read.own capability.
 */
export async function updateLanguage(
  params: UpdateLanguageParams,
): Promise<LanguageDetailResponse> {
  await requireCapability("candidate.read.own");

  const parsed = updateLanguageSchema.safeParse(params);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { candidateId, languageId, language, proficiency } = parsed.data;

  // Verify ownership
  const existing = await prisma.candidate_language.findFirst({
    where: {
      candidate_language_id: languageId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_language_id: true },
  });

  if (!existing) {
    return { data: null, error: "Language entry not found or access denied" };
  }

  const updated = await prisma.candidate_language.update({
    where: { candidate_language_id: languageId },
    data: { language, proficiency },
  });

  revalidatePath("/candidate/languages");
  revalidatePath(`/candidate/languages/${languageId}`);

  const item: LanguageItem = {
    candidate_language_id: updated.candidate_language_id,
    language: updated.language,
    proficiency: updated.proficiency,
    candidate_language_created_at: updated.candidate_language_created_at,
  };

  const result: LanguageDetailResponse = { data: item, error: null };

  const outputParsed = languageDetailResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateLanguage", outputParsed.error.issues);
  }

  return result;
}

/**
 * Soft-delete a language entry by setting deleted = 1.
 * Verifies ownership via candidateId before deleting.
 * Requires candidate.read.own capability.
 */
export async function deleteLanguage(
  params: DeleteLanguageParams,
): Promise<LanguageDetailResponse> {
  await requireCapability("candidate.read.own");

  const parsed = deleteLanguageSchema.safeParse(params);
  if (!parsed.success) {
    return {
      data: null,
      error: "Invalid language ID",
    };
  }

  const { candidateId, languageId } = parsed.data;

  // Verify ownership
  const existing = await prisma.candidate_language.findFirst({
    where: {
      candidate_language_id: languageId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_language_id: true },
  });

  if (!existing) {
    return { data: null, error: "Language entry not found or access denied" };
  }

  await prisma.candidate_language.update({
    where: { candidate_language_id: languageId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/languages");

  const result: LanguageDetailResponse = { data: null, error: null };

  const outputParsed = languageDetailResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteLanguage", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Route-level wrappers (for /candidate/languages route)
// ---------------------------------------------------------------------------

/** Input schema for listCandidateLanguages — no candidateId (extracted from session). */
const listCandidateLanguagesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

type ListCandidateLanguagesInput = z.input<typeof listCandidateLanguagesSchema>;

/** Input schema for createCandidateLanguage — no candidateId (extracted from session). */
const createCandidateLanguageSchema = z.object({
  language: z
    .string()
    .min(1, "Language name is required")
    .max(128, "Language name must be 128 characters or fewer")
    .transform((v) => v.trim()),
  proficiency: z
    .string()
    .min(1, "Proficiency level is required")
    .max(32, "Proficiency must be 32 characters or fewer")
    .transform((v) => v.trim()),
});

type CreateCandidateLanguageInput = z.input<typeof createCandidateLanguageSchema>;

/**
 * List language records for the current candidate (paginated).
 * Extracts candidateId from session and delegates to listLanguages.
 */
export async function listCandidateLanguages(
  input: ListCandidateLanguagesInput = {},
): Promise<LanguageItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const { page, limit } = listCandidateLanguagesSchema.parse(input);

  const result = await listLanguages({
    candidateId: Number(session.id),
    page,
    limit,
  });

  // Validate output shape
  const arrSchema = z.array(languageItemSchema);
  const outputParsed = arrSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateLanguages", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new language record for the current candidate.
 * Extracts candidateId from session and delegates to createLanguage.
 */
export async function createCandidateLanguage(
  data: CreateCandidateLanguageInput,
): Promise<LanguageActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = createCandidateLanguageSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { language, proficiency } = parsed.data;

  const result = await createLanguage({
    candidateId: Number(session.id),
    language,
    proficiency,
  });

  revalidatePath("/candidate/languages");

  return result;
}

// ---------------------------------------------------------------------------
// [id] route wrappers (for /candidate/languages/[id])
// ---------------------------------------------------------------------------

/** Input schema for getLanguageEntry. */
const getLanguageEntrySchema = z.object({
  languageId: z.coerce.number().int().positive("Language ID is required"),
});

/** Input schema for updateLanguageEntry. */
const updateLanguageEntrySchema = z.object({
  languageId: z.coerce.number().int().positive("Language ID is required"),
  language: z
    .string()
    .min(1, "Language is required")
    .max(128, "Language must be 128 characters or fewer")
    .transform((v) => v.trim()),
  proficiency: z.string().min(1, "Proficiency level is required"),
});

type UpdateLanguageEntryInput = z.input<typeof updateLanguageEntrySchema>;

type LanguageEntryResponse =
  | { data: LanguageItem; error: null }
  | { data: null; error: string | null };

/**
 * Get a single language entry by ID.
 * Extracts candidateId from session and delegates to getLanguage.
 */
export async function getLanguageEntry(
  languageId: number,
): Promise<LanguageItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getLanguageEntrySchema.safeParse({ languageId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid language ID");
  }

  const result = await getLanguage({
    candidateId: Number(session.id),
    languageId: parsed.data.languageId,
  });

  // Validate output shape
  const outputParsed = languageItemSchema.nullable().safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getLanguageEntry", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update a language entry.
 * Extracts candidateId from session and delegates to updateLanguage.
 */
export async function updateLanguageEntry(
  input: UpdateLanguageEntryInput,
): Promise<LanguageEntryResponse> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateLanguageEntrySchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const result = await updateLanguage({
    candidateId: Number(session.id),
    languageId: parsed.data.languageId,
    language: parsed.data.language,
    proficiency: parsed.data.proficiency,
  });

  // Validate output shape
  const outputParsed = languageDetailResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateLanguageEntry", outputParsed.error.issues);
  }

  return result;
}

/**
 * Delete a language entry by ID.
 * Extracts candidateId from session and delegates to deleteLanguage.
 */
export async function deleteLanguageEntry(
  languageId: number,
): Promise<LanguageEntryResponse> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = getLanguageEntrySchema.safeParse({ languageId });
  if (!parsed.success) {
    return {
      data: null,
      error: "Invalid language ID",
    };
  }

  const result = await deleteLanguage({
    candidateId: Number(session.id),
    languageId: parsed.data.languageId,
  });

  // Validate output shape
  const outputParsed = languageDetailResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteLanguageEntry", outputParsed.error.issues);
  }

  return result;
}
