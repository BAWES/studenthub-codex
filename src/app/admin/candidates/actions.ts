"use server";

// ---------------------------------------------------------------------------
// Admin CandidatesController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/CandidateController.php
//
// Actions:
//   - listCandidates    — paginated list of candidates with search by name/email
//   - getCandidate      — single candidate detail with associated info
//   - searchCandidates  — search candidates by name or email with pagination
//   - createCandidate   — create a new candidate
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
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
  candidateName: z.string().min(1, "Candidate name is required").max(255),
  candidateNameAr: z.string().max(255).optional(),
  candidateEmail: z.string().min(1, "Email is required").max(255),
  candidatePhone: z.string().max(20).optional(),
  candidateGender: z.coerce.number().int().optional(),
  candidateBirthDate: z.string().optional(),
  candidateHourlyRate: z.coerce.number().optional(),
  currencyCode: z.string().max(3).optional(),
  storeId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  candidateObjective: z.string().max(255).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidatesInput = z.input<typeof listCandidatesSchema>;
export type GetCandidateInput = z.input<typeof getCandidateSchema>;
export type SearchCandidatesInput = z.input<typeof searchCandidatesSchema>;
export type CreateCandidateInput = z.input<typeof createCandidateSchema>;

export type CandidateActionResponse = {
  operation: "success" | "error";
  message: string;
};

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
 * Create a new candidate.
 * Status defaults to 10 (active). Created/updated timestamps are set to now.
 */
export async function createCandidate(
  input: CreateCandidateInput,
): Promise<CandidateActionResponse> {
  await requireCapability("candidate.write");

  const parsed = createCandidateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const {
    candidateName,
    candidateNameAr,
    candidateEmail,
    candidatePhone,
    candidateGender,
    candidateBirthDate,
    candidateHourlyRate,
    currencyCode,
    storeId,
    countryId,
    universityId,
    candidateObjective,
  } = parsed.data;

  try {
    const now = new Date();

    await prisma.candidate.create({
      data: {
        candidate_name: candidateName,
        candidate_name_ar: candidateNameAr ?? candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone ?? null,
        candidate_gender: candidateGender ?? null,
        candidate_birth_date: candidateBirthDate ? new Date(candidateBirthDate) : null,
        candidate_hourly_rate: candidateHourlyRate ?? null,
        currency_code: currencyCode ?? null,
        store_id: storeId ?? null,
        country_id: countryId ?? null,
        university_id: universityId ?? null,
        candidate_objective: candidateObjective ?? null,
        candidate_status: 10,
        approved: 0,
        deleted: 0,
        candidate_committed: true,
        candidate_created_at: now,
        candidate_updated_at: now,
      },
    });

    revalidatePath("/admin/candidates");

    return {
      operation: "success",
      message: `Candidate "${candidateName}" created successfully`,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create candidate",
    };
  }
}
