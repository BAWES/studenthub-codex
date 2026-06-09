"use server";

// ---------------------------------------------------------------------------
// Admin Candidate Detail — server actions
// ---------------------------------------------------------------------------
// Actions for viewing, updating status, and verifying credentials for a single
// candidate. Used by the candidate detail panel on the admin search page.
//
// Ported from Yii2 admin/modules/v1/controllers/CandidateController.php
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate, formatMoney } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getCandidateByIdSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export const updateCandidateStatusSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  status: z.coerce.number().int(),
});

export const verifyCredentialsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateByIdInput = z.input<typeof getCandidateByIdSchema>;
export type UpdateCandidateStatusInput = z.input<typeof updateCandidateStatusSchema>;
export type VerifyCredentialsInput = z.input<typeof verifyCredentialsSchema>;

export type CandidateDetailWithCredentials = {
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
    candidate_civil_id: string | null;
    candidate_civil_expiry_date: string | null;
    candidate_civil_need_verification: boolean | null;
    candidate_created_at: string | null;
    candidate_updated_at: string | null;
    store: { store_name: string | null } | null;
    country: { country_name_en: string | null } | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
};

export type StatusUpdateResult = {
  success: boolean;
  error?: string;
};

export type CredentialsVerifyResult = {
  success: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// getCandidateById
// ---------------------------------------------------------------------------

/**
 * Get a single candidate by ID with full detail including civil ID credentials.
 * Mirrors the legacy getCandidateDetail() with credential fields.
 */
export async function getCandidateById(
  candidateId: number,
): Promise<CandidateDetailWithCredentials> {
  await requireCapability("candidate.read.any");

  const parsed = getCandidateByIdSchema.safeParse({ candidateId });
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
      candidate_civil_id: true,
      candidate_civil_expiry_date: true,
      candidate_civil_need_verification: true,
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
      candidate_civil_id: c.candidate_civil_id ?? null,
      candidate_civil_expiry_date:
        c.candidate_civil_expiry_date?.toISOString() ?? null,
      candidate_civil_need_verification:
        c.candidate_civil_need_verification ?? null,
      candidate_created_at: c.candidate_created_at?.toISOString() ?? null,
      candidate_updated_at: c.candidate_updated_at?.toISOString() ?? null,
      store: c.store ? { store_name: c.store.store_name } : null,
      country: c.country ? { country_name_en: c.country.country_name_en } : null,
    },
    metrics: [
      {
        label: "Status",
        value: c.candidate_status,
        note: "Candidate status code",
      },
      {
        label: "Store",
        value: c.store?.store_name ?? "Unassigned",
        note: "Assigned store",
      },
      {
        label: "Country",
        value: c.country?.country_name_en ?? "—",
        note: "Nationality",
      },
      {
        label: "Civil ID Verified",
        value: c.candidate_civil_need_verification ? "Needs review" : "Verified",
        note: c.candidate_civil_id
          ? `Civil ID: ${c.candidate_civil_id}`
          : "No civil ID on file",
      },
      {
        label: "Created",
        value: formatDate(c.candidate_created_at),
        note: "",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// updateCandidateStatus
// ---------------------------------------------------------------------------

/**
 * Update a candidate's status code.
 * Admin action — requires candidate.approve capability.
 */
export async function updateCandidateStatus(
  candidateId: number,
  status: number,
): Promise<StatusUpdateResult> {
  await requireCapability("candidate.approve");

  const parsed = updateCandidateStatusSchema.safeParse({ candidateId, status });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.candidate.findUnique({
    where: { candidate_id: parsed.data.candidateId },
    select: { candidate_id: true, deleted: true },
  });

  if (!existing || existing.deleted !== 0) {
    return { success: false, error: "Candidate not found" };
  }

  await prisma.candidate.update({
    where: { candidate_id: parsed.data.candidateId },
    data: { candidate_status: parsed.data.status },
  });

  revalidatePath("/admin/candidates");
  revalidatePath(`/admin/candidates/${parsed.data.candidateId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// verifyCredentials
// ---------------------------------------------------------------------------

/**
 * Mark a candidate's civil ID credentials as verified.
 * Admin action — requires id_review.mutate capability.
 * Sets candidate_civil_need_verification to false.
 */
export async function verifyCredentials(
  candidateId: number,
): Promise<CredentialsVerifyResult> {
  await requireCapability("id_review.mutate");

  const parsed = verifyCredentialsSchema.safeParse({ candidateId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid candidate ID",
    };
  }

  const existing = await prisma.candidate.findUnique({
    where: { candidate_id: parsed.data.candidateId },
    select: { candidate_id: true, deleted: true },
  });

  if (!existing || existing.deleted !== 0) {
    return { success: false, error: "Candidate not found" };
  }

  await prisma.candidate.update({
    where: { candidate_id: parsed.data.candidateId },
    data: { candidate_civil_need_verification: false },
  });

  revalidatePath("/admin/candidates");
  revalidatePath(`/admin/candidates/${parsed.data.candidateId}`);
  return { success: true };
}
