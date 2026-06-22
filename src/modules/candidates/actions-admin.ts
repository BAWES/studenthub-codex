"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCandidatesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
  status: z.number().int().optional(),
  approved: z.number().int().optional(),
  countryId: z.number().int().positive().optional(),
});

const getCandidateSchema = z.object({
  id: z.number().int().positive(),
});

const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  nameAr: z.string().max(255).optional().default(""),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().max(20).optional().default(""),
  countryId: z.number().int().positive().optional(),
  universityId: z.number().int().positive().optional(),
  bankId: z.number().int().positive().optional(),
  bankAccountName: z.string().max(100).optional().default(""),
  iban: z.string().max(100).optional().default(""),
  civilId: z.string().max(255).optional().default(""),
  objective: z.string().max(255).optional().default(""),
  intro: z.string().optional().default(""),
  address: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  gender: z.number().int().min(0).max(2).optional(),
  hourlyRate: z.number().positive().optional(),
});

const updateCandidateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  nameAr: z.string().max(255).optional(),
  email: z.string().email("Invalid email").max(255).optional(),
  phone: z.string().max(20).optional(),
  countryId: z.number().int().positive().optional().nullable(),
  universityId: z.number().int().positive().optional().nullable(),
  bankId: z.number().int().positive().optional().nullable(),
  bankAccountName: z.string().max(100).optional(),
  iban: z.string().max(100).optional(),
  civilId: z.string().max(255).optional(),
  objective: z.string().max(255).optional(),
  intro: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.number().int().min(0).max(2).optional(),
  hourlyRate: z.number().positive().optional(),
  status: z.number().int().optional(),
});

const deleteCandidateSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidatesParams = z.input<typeof listCandidatesSchema>;
export type GetCandidateParams = z.input<typeof getCandidateSchema>;
export type CreateCandidateParams = z.input<typeof createCandidateSchema>;
export type UpdateCandidateParams = z.input<typeof updateCandidateSchema>;
export type DeleteCandidateParams = z.input<typeof deleteCandidateSchema>;

export type CandidateListItem = {
  candidate_id: number;
  candidate_name: string;
  candidate_name_ar: string;
  candidate_email: string;
  candidate_phone: string | null;
  candidate_status: number;
  approved: number;
  candidate_created_at: Date;
};

export type CandidateDetail = CandidateListItem & {
  candidate_objective: string | null;
  candidate_intro: string | null;
  candidate_birth_date: Date | null;
  candidate_civil_id: string | null;
  candidate_address_line1: string | null;
  country_id: number | null;
  university_id: number | null;
  bank_id: number | null;
  bank_account_name: string | null;
  candidate_iban: string | null;
  candidate_gender: number | null;
  candidate_hourly_rate: number | null;
  candidate_updated_at: Date;
  profile_url: string | null;
};

export type ListCandidatesResult = {
  candidates: CandidateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List candidates with pagination, search, and optional filters.
 * Excludes candidates marked as deleted (soft delete).
 */
export async function listCandidates(
  params: ListCandidatesParams = {},
): Promise<ListCandidatesResult> {
  await requireCapability("candidate.read");

  const parsed = listCandidatesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, search, status, approved, countryId } = parsed.data;

  const where: Record<string, unknown> = { deleted: 0 };

  if (status !== undefined) {
    where.candidate_status = status;
  }
  if (approved !== undefined) {
    where.approved = approved;
  }
  if (countryId !== undefined) {
    where.country_id = countryId;
  }
  if (search) {
    where.OR = [
      { candidate_name: { contains: search } },
      { candidate_name_ar: { contains: search } },
      { candidate_email: { contains: search } },
      { candidate_phone: { contains: search } },
      { candidate_civil_id: { contains: search } },
    ];
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where: where as any,
      orderBy: { candidate_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_name_ar: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        approved: true,
        candidate_created_at: true,
      },
    }),
    prisma.candidate.count({ where: where as any }),
  ]);

  return {
    candidates: candidates as CandidateListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single candidate by ID, excluding soft-deleted records.
 */
export async function getCandidate(
  params: GetCandidateParams,
): Promise<CandidateDetail | null> {
  await requireCapability("candidate.read");

  const parsed = getCandidateSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const { id } = parsed.data;

  const candidate = await prisma.candidate.findFirst({
    where: {
      candidate_id: id,
      deleted: 0,
    },
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_name_ar: true,
      candidate_email: true,
      candidate_phone: true,
      candidate_status: true,
      approved: true,
      candidate_created_at: true,
      candidate_updated_at: true,
      candidate_objective: true,
      candidate_intro: true,
      candidate_birth_date: true,
      candidate_civil_id: true,
      candidate_address_line1: true,
      country_id: true,
      university_id: true,
      bank_id: true,
      bank_account_name: true,
      candidate_iban: true,
      candidate_gender: true,
      candidate_hourly_rate: true,
      profile_url: true,
    },
  });

  return candidate as CandidateDetail | null;
}

/**
 * Create a new candidate with hashed password and auth key.
 */
export async function createCandidate(
  data: CreateCandidateParams,
): Promise<{ candidate_id: number }> {
  await requireCapability("candidate.write");

  const parsed = createCandidateSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate data");
  }

  const d = parsed.data;

  // Generate password hash and auth key (matching Yii2 conventions)
  const passwordHash = await bcrypt.hash(d.email, 10); // default password = email
  const authKey = crypto.randomBytes(16).toString("hex");
  const now = new Date();

  // Parse birthDate if provided
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
      candidate_name_ar: d.nameAr ?? "",
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

  return { candidate_id: candidate.candidate_id };
}

/**
 * Update an existing candidate. Uses soft-delete guard — will not update
 * records where deleted != 0.
 */
export async function updateCandidate(
  data: UpdateCandidateParams,
): Promise<{ candidate_id: number }> {
  await requireCapability("candidate.write");

  const parsed = updateCandidateSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid update data");
  }

  const { id, ...fields } = parsed.data;

  // Verify the candidate exists and is not soft-deleted
  const existing = await prisma.candidate.findFirst({
    where: { candidate_id: id, deleted: 0 },
    select: { candidate_id: true },
  });
  if (!existing) {
    throw new Error(`Candidate with ID ${id} not found or has been deleted`);
  }

  // Build only the fields that were actually provided (partial update)
  const updateData: Record<string, unknown> = { candidate_updated_at: new Date() };

  if (fields.name !== undefined) updateData.candidate_name = fields.name.trim();
  if (fields.nameAr !== undefined) updateData.candidate_name_ar = fields.nameAr;
  if (fields.email !== undefined) updateData.candidate_email = fields.email;
  if (fields.phone !== undefined) updateData.candidate_phone = fields.phone;
  if (fields.objective !== undefined) updateData.candidate_objective = fields.objective;
  if (fields.intro !== undefined) updateData.candidate_intro = fields.intro;
  if (fields.address !== undefined) updateData.candidate_address_line1 = fields.address;
  if (fields.civilId !== undefined) updateData.candidate_civil_id = fields.civilId;
  if (fields.bankAccountName !== undefined) updateData.bank_account_name = fields.bankAccountName;
  if (fields.iban !== undefined) updateData.candidate_iban = fields.iban;
  if (fields.gender !== undefined) updateData.candidate_gender = fields.gender;
  if (fields.hourlyRate !== undefined) updateData.candidate_hourly_rate = fields.hourlyRate;
  if (fields.status !== undefined) updateData.candidate_status = fields.status;
  if (fields.countryId !== undefined) updateData.country_id = fields.countryId;
  if (fields.universityId !== undefined) updateData.university_id = fields.universityId;
  if (fields.bankId !== undefined) updateData.bank_id = fields.bankId;
  if (fields.birthDate !== undefined) {
    const parsedDate = fields.birthDate ? new Date(fields.birthDate) : null;
    updateData.candidate_birth_date = parsedDate && isFinite(parsedDate.getTime())
      ? parsedDate
      : null;
  }

  await prisma.candidate.update({
    where: { candidate_id: id },
    data: updateData,
  });

  return { candidate_id: id };
}

/**
 * Soft-delete a candidate by setting deleted = 1.
 */
export async function deleteCandidate(
  params: DeleteCandidateParams,
): Promise<{ success: boolean }> {
  await requireCapability("candidate.write");

  const parsed = deleteCandidateSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const { id } = parsed.data;

  // Verify the candidate exists and is not already soft-deleted
  const existing = await prisma.candidate.findFirst({
    where: { candidate_id: id, deleted: 0 },
    select: { candidate_id: true },
  });
  if (!existing) {
    throw new Error(`Candidate with ID ${id} not found or has already been deleted`);
  }

  await prisma.candidate.update({
    where: { candidate_id: id },
    data: {
      deleted: 1,
      candidate_updated_at: new Date(),
    },
  });

  return { success: true };
}
