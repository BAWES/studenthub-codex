"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Admin CandidatesController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/CandidateController.php
//
// Actions:
//   - listCandidates    — paginated list of candidates with search by name/email
//   - getCandidate      — single candidate detail with associated info
//   - searchCandidates  — search candidates by name or email with pagination
//   - createCandidate   — create a new candidate with password hash
//   - updateCandidate   — partial update of candidate fields
//   - deleteCandidate   — soft-delete (set deleted=1)
// ---------------------------------------------------------------------------

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCandidatesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  status: z.coerce.number().int().optional(),
  storeId: z.coerce.number().int().positive().optional(),
});

export const getCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export const searchCandidatesSchema = z.object({
  q: z.string().trim().min(1, "Search query is required").max(100),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  nameAr: z.string().max(255).optional().default(""),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().max(20).optional().default(""),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  bankId: z.coerce.number().int().positive().optional(),
  bankAccountName: z.string().max(100).optional().default(""),
  iban: z.string().max(100).optional().default(""),
  civilId: z.string().max(255).optional().default(""),
  objective: z.string().max(255).optional().default(""),
  intro: z.string().optional().default(""),
  address: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  gender: z.coerce.number().int().min(0).max(2).optional(),
  hourlyRate: z.coerce.number().positive().optional(),
});

export const updateCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  name: z.string().min(1).max(255).optional(),
  nameAr: z.string().max(255).optional(),
  email: z.string().email("Invalid email").max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  countryId: z.coerce.number().int().positive().optional().nullable(),
  universityId: z.coerce.number().int().positive().optional().nullable(),
  bankId: z.coerce.number().int().positive().optional().nullable(),
  bankAccountName: z.string().max(100).optional().nullable(),
  iban: z.string().max(100).optional().nullable(),
  civilId: z.string().max(255).optional().nullable(),
  objective: z.string().max(255).optional().nullable(),
  intro: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.coerce.number().int().min(0).max(2).optional().nullable(),
  hourlyRate: z.coerce.number().positive().optional().nullable(),
  status: z.coerce.number().int().optional(),
});

export const deleteCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidatesInput = z.input<typeof listCandidatesSchema>;
export type GetCandidateInput = z.input<typeof getCandidateSchema>;
export type SearchCandidatesInput = z.input<typeof searchCandidatesSchema>;
export type CreateCandidateInput = z.input<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.input<typeof updateCandidateSchema>;
export type DeleteCandidateInput = z.input<typeof deleteCandidateSchema>;

export type CreateCandidateResult = { success: true; candidateId: number } | { success: false; error: string };

export type UpdateCandidateResult = { success: true; candidateId: number } | { success: false; error: string };

export type DeleteCandidateResult = { success: true; candidateId: number } | { success: false; error: string };

export type CandidateRow = {
  candidate_id: number;
  name: string;
  name_ar: string;
  email: string;
  phone: string | null;
  status: number;
  store_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CandidateDetail = {
  candidate: {
    candidate_id: number;
    candidate_name: string;
    candidate_name_ar: string;
    candidate_email: string;
    candidate_phone: string | null;
    candidate_status: number;
    candidate_gender: number | null;
    candidate_birth_date: string | null;
    candidate_hourly_rate: number | null;
    currency_code: string | null;
    candidate_created_at: string | null;
    candidate_updated_at: string | null;
    store: { store_name: string | null } | null;
    country: { country_name_en: string | null } | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
};

// ---------------------------------------------------------------------------
// listCandidates
// ---------------------------------------------------------------------------

/**
 * List candidates with pagination and optional filters.
 */
export async function listCandidates(
  input: ListCandidatesInput = {},
): Promise<{
  items: CandidateRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("candidate.read");

  const parsed = listCandidatesSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, q, status, storeId } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
  if (status !== undefined) where.candidate_status = status;
  if (storeId !== undefined) where.store_id = storeId;
  if (q && q.trim().length > 0) {
    where.OR = [
      { candidate_name: { contains: q.trim() } },
      { candidate_email: { contains: q.trim() } },
    ];
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where: where as any,
      orderBy: { candidate_updated_at: "desc" },
      skip,
      take: limit,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_name_ar: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        candidate_created_at: true,
        candidate_updated_at: true,
        store: { select: { store_name: true } },
      },
    }),
    prisma.candidate.count({ where: where as any }),
  ]);

  return {
    items: candidates.map((c): CandidateRow => ({
      candidate_id: c.candidate_id,
      name: c.candidate_name,
      name_ar: c.candidate_name_ar,
      email: c.candidate_email,
      phone: c.candidate_phone ?? null,
      status: c.candidate_status,
      store_name: c.store?.store_name ?? null,
      created_at: c.candidate_created_at?.toISOString() ?? null,
      updated_at: c.candidate_updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getCandidate
// ---------------------------------------------------------------------------

/**
 * Get a single candidate by ID with full detail.
 */
export async function getCandidate(
  candidateId: number,
): Promise<CandidateDetail> {
  await requireCapability("candidate.read");

  const parsed = getCandidateSchema.safeParse({ candidateId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: parsed.data.candidateId, deleted: 0 },
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_name_ar: true,
      candidate_email: true,
      candidate_phone: true,
      candidate_status: true,
      candidate_gender: true,
      candidate_birth_date: true,
      candidate_hourly_rate: true,
      currency_code: true,
      candidate_created_at: true,
      candidate_updated_at: true,
      store: { select: { store_name: true } },
      country: { select: { country_name_en: true } },
    },
  });

  if (!candidate) {
    return { candidate: null, metrics: [] };
  }

  const c = candidate as any;

  return {
    candidate: {
      candidate_id: c.candidate_id,
      candidate_name: c.candidate_name,
      candidate_name_ar: c.candidate_name_ar,
      candidate_email: c.candidate_email,
      candidate_phone: c.candidate_phone ?? null,
      candidate_status: c.candidate_status,
      candidate_gender: c.candidate_gender ?? null,
      candidate_birth_date: c.candidate_birth_date?.toISOString() ?? null,
      candidate_hourly_rate: c.candidate_hourly_rate
        ? Number(c.candidate_hourly_rate)
        : null,
      currency_code: c.currency_code ?? null,
      candidate_created_at: c.candidate_created_at?.toISOString() ?? null,
      candidate_updated_at: c.candidate_updated_at?.toISOString() ?? null,
      store: c.store ? { store_name: c.store.store_name } : null,
      country: c.country ? { country_name_en: c.country.country_name_en } : null,
    },
    metrics: [
      { label: "Status", value: c.candidate_status, note: "Candidate status code" },
      { label: "Store", value: c.store?.store_name ?? "Unassigned", note: "Assigned store" },
      { label: "Country", value: c.country?.country_name_en ?? "—", note: "Nationality" },
      { label: "Created", value: formatDate(c.candidate_created_at), note: "" },
    ],
  };
}

// ---------------------------------------------------------------------------
// searchCandidates
// ---------------------------------------------------------------------------

/**
 * Search candidates by name or email.
 * Returns paginated results matching the search query.
 */
export async function searchCandidates(
  input: SearchCandidatesInput,
): Promise<{
  items: CandidateRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("candidate.read");

  const parsed = searchCandidatesSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { q, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    deleted: 0,
    OR: [
      { candidate_name: { contains: q } },
      { candidate_email: { contains: q } },
    ],
  } as Record<string, unknown>;

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where: where as any,
      orderBy: { candidate_updated_at: "desc" },
      skip,
      take: limit,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_name_ar: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        candidate_created_at: true,
        candidate_updated_at: true,
        store: { select: { store_name: true } },
      },
    }),
    prisma.candidate.count({ where: where as any }),
  ]);

  return {
    items: candidates.map((c): CandidateRow => ({
      candidate_id: c.candidate_id,
      name: c.candidate_name,
      name_ar: c.candidate_name_ar,
      email: c.candidate_email,
      phone: c.candidate_phone ?? null,
      status: c.candidate_status,
      store_name: c.store?.store_name ?? null,
      created_at: c.candidate_created_at?.toISOString() ?? null,
      updated_at: c.candidate_updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// createCandidate
// ---------------------------------------------------------------------------

/**
 * Create a new candidate. Password defaults to the candidate's email for
 * initial authentication.
 */
export async function createCandidate(
  data: CreateCandidateInput,
): Promise<CreateCandidateResult> {
  await requireCapability("candidate.write");

  const parsed = createCandidateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const d = parsed.data;
    const now = new Date();
    const passwordHash = await bcrypt.hash(d.email, 10);
    const authKey = crypto.randomBytes(16).toString("hex");

    let birthDate: Date | undefined;
    if (d.birthDate) {
      const parsedDate = new Date(d.birthDate);
      if (isFinite(parsedDate.getTime())) {
        birthDate = parsedDate;
      }
    }

    const candidate = await prisma.candidate.create({
      data: {
        candidate_name: d.name.trim(),
        candidate_name_ar: d.nameAr || "",
        candidate_email: d.email,
        candidate_phone: d.phone || undefined,
        candidate_password_hash: passwordHash,
        candidate_auth_key: authKey,
        candidate_civil_id: d.civilId || undefined,
        candidate_objective: d.objective || undefined,
        candidate_intro: d.intro || undefined,
        candidate_address_line1: d.address || undefined,
        candidate_birth_date: birthDate,
        candidate_gender: d.gender ?? null,
        candidate_hourly_rate: d.hourlyRate ?? null,
        candidate_status: 10,
        approved: 0,
        deleted: 0,
        is_incomplete_profile: false,
        candidate_committed: true,
        candidate_language_pref: "en",
        candidate_job_search_status: 1,
        country_id: d.countryId ?? null,
        university_id: d.universityId ?? null,
        bank_id: d.bankId ?? null,
        bank_account_name: d.bankAccountName || undefined,
        candidate_iban: d.iban || undefined,
        candidate_created_at: now,
        candidate_updated_at: now,
      },
      select: { candidate_id: true },
    });

    revalidatePath("/admin/candidates");

    return { success: true, candidateId: candidate.candidate_id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create candidate",
    };
  }
}

// ---------------------------------------------------------------------------
// updateCandidate
// ---------------------------------------------------------------------------

/**
 * Partial update of an existing candidate. Only provided fields are changed.
 * Uses soft-delete guard — will not update records where deleted != 0.
 */
export async function updateCandidate(
  data: UpdateCandidateInput,
): Promise<UpdateCandidateResult> {
  await requireCapability("candidate.write");

  const parsed = updateCandidateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const { candidateId, ...fields } = parsed.data;

    // Verify the candidate exists and is not soft-deleted
    const existing = await prisma.candidate.findFirst({
      where: { candidate_id: candidateId, deleted: 0 },
      select: { candidate_id: true },
    });
    if (!existing) {
      return {
        success: false,
        error: `Candidate with ID ${candidateId} not found or has been deleted`,
      };
    }

    // Build only the fields that were actually provided (partial update)
    const updateData: Record<string, unknown> = {
      candidate_updated_at: new Date(),
    };

    if (fields.name !== undefined) updateData.candidate_name = fields.name.trim();
    if (fields.nameAr !== undefined) updateData.candidate_name_ar = fields.nameAr;
    if (fields.email !== undefined) updateData.candidate_email = fields.email;
    if (fields.phone !== undefined) updateData.candidate_phone = fields.phone;
    if (fields.objective !== undefined) updateData.candidate_objective = fields.objective;
    if (fields.intro !== undefined) updateData.candidate_intro = fields.intro;
    if (fields.address !== undefined) updateData.candidate_address_line1 = fields.address;
    if (fields.civilId !== undefined) updateData.candidate_civil_id = fields.civilId;
    if (fields.bankAccountName !== undefined)
      updateData.bank_account_name = fields.bankAccountName;
    if (fields.iban !== undefined) updateData.candidate_iban = fields.iban;
    if (fields.gender !== undefined) updateData.candidate_gender = fields.gender;
    if (fields.hourlyRate !== undefined)
      updateData.candidate_hourly_rate = fields.hourlyRate;
    if (fields.status !== undefined) updateData.candidate_status = fields.status;
    if (fields.countryId !== undefined) updateData.country_id = fields.countryId;
    if (fields.universityId !== undefined) updateData.university_id = fields.universityId;
    if (fields.bankId !== undefined) updateData.bank_id = fields.bankId;
    if (fields.birthDate !== undefined) {
      const parsedDate = fields.birthDate
        ? new Date(fields.birthDate)
        : null;
      updateData.candidate_birth_date =
        parsedDate && isFinite(parsedDate.getTime()) ? parsedDate : null;
    }

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: updateData,
    });

    revalidatePath("/admin/candidates");

    return { success: true, candidateId };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update candidate",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteCandidate
// ---------------------------------------------------------------------------

/**
 * Soft-delete a candidate by setting deleted = 1.
 */
export async function deleteCandidate(
  data: DeleteCandidateInput,
): Promise<DeleteCandidateResult> {
  await requireCapability("candidate.write");

  const parsed = deleteCandidateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid candidate ID",
    };
  }

  try {
    const { candidateId } = parsed.data;

    // Verify the candidate exists and is not already soft-deleted
    const existing = await prisma.candidate.findFirst({
      where: { candidate_id: candidateId, deleted: 0 },
      select: { candidate_id: true },
    });
    if (!existing) {
      return {
        success: false,
        error: `Candidate with ID ${candidateId} not found or has already been deleted`,
      };
    }

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: {
        deleted: 1,
        candidate_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/candidates");

    return { success: true, candidateId };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to delete candidate",
    };
  }
}
