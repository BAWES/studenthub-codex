"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import type {
  ListAgenciesInput,
  CreateAgencyInput,
  UpdateAgencyInput,
  AgencyActionResult,
  AgencyItem,
} from "./schemas";
import {
  listAgenciesSchema,
  getAgencySchema,
  createAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
} from "./schemas";

// Re-export types for client components
export type { AgencyActionResult, AgencyItem };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma company row to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.company.findFirst>>,
): AgencyItem | null {
  if (!row) return null;
  return {
    company_id: row.company_id,
    company_name: row.company_name,
    company_common_name_en: row.company_common_name_en,
    company_common_name_ar: row.company_common_name_ar,
    company_email: row.company_email,
    company_website: row.company_website,
    company_logo: row.company_logo,
    commercial_licence: row.commercial_licence,
    total_candidate: row.total_candidate ? Number(row.total_candidate) : null,
    no_of_active_requests: row.no_of_active_requests,
    country_id: row.country_id,
    company_created_at: row.company_created_at,
    company_updated_at: row.company_updated_at,
  };
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List agency (company) records (paginated, searchable).
 * Returns companies that have been active with candidates.
 */
export async function listAgencies(
  input: ListAgenciesInput = {},
): Promise<{ items: AgencyItem[]; total: number }> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listAgenciesSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid agencies list params",
    );
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };

  if (search) {
    where.OR = [
      { company_name: { contains: search } },
      { company_common_name_en: { contains: search } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.company.findMany({
      where: where as any,
      orderBy: [{ company_name: "asc" }, { company_id: "asc" }],
      skip,
      take: limit,
    }),
    prisma.company.count({ where: where as any }),
  ]);

  return {
    items: rows.map((r) => toItem(r)!),
    total,
  };
}

/**
 * Get a single agency (company) by ID.
 */
export async function getAgency(
  companyId: number,
): Promise<AgencyItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getAgencySchema.safeParse({ companyId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid company ID",
    );
  }

  const row = await prisma.company.findFirst({
    where: {
      company_id: parsed.data.companyId,
      deleted: 0,
    },
  });

  return toItem(row);
}

/**
 * Create a new agency (company).
 * Requires candidate.profile.edit capability.
 */
export async function createAgency(
  data: CreateAgencyInput,
): Promise<AgencyActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createAgencySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid agency data",
    };
  }

  // Prevent duplicate company names
  const existing = await prisma.company.findFirst({
    where: {
      company_name: parsed.data.companyName,
      deleted: 0,
    },
    select: { company_id: true },
  });
  if (existing) {
    return { success: false, error: "An agency with this name already exists" };
  }

  const now = new Date();

  const row = await prisma.company.create({
    data: {
      company_name: parsed.data.companyName,
      company_email: parsed.data.companyEmail || null,
      company_website: parsed.data.companyWebsite || null,
      commercial_licence: parsed.data.commercialLicence || null,
      company_created_at: now,
      company_updated_at: now,
      deleted: 0,
      company_followup: true,
      company_next_followup_datetime: now,
      company_last_followup_datetime: now,
      company_followup_interval_weeks: 1,
      is_request_updates_in_30_days: false,
      company_approved_to_hire: true,
      company_status_override: false,
    },
  });

  revalidatePath("/candidate/agencies");
  return { success: true, companyId: row.company_id };
}

/**
 * Update an existing agency (company).
 * Requires candidate.profile.edit capability.
 */
export async function updateAgency(
  data: UpdateAgencyInput,
): Promise<AgencyActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = updateAgencySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid agency data",
    };
  }

  const companyId = parsed.data.companyId;

  // Verify the company exists
  const existing = await prisma.company.findFirst({
    where: { company_id: companyId, deleted: 0 },
    select: { company_id: true },
  });
  if (!existing) {
    return { success: false, error: "Agency not found" };
  }

  // Check for duplicate name (excluding this record)
  const duplicate = await prisma.company.findFirst({
    where: {
      company_name: parsed.data.companyName,
      deleted: 0,
      company_id: { not: companyId },
    },
    select: { company_id: true },
  });
  if (duplicate) {
    return { success: false, error: "An agency with this name already exists" };
  }

  await prisma.company.update({
    where: { company_id: companyId },
    data: {
      company_name: parsed.data.companyName,
      company_email: parsed.data.companyEmail || null,
      company_website: parsed.data.companyWebsite || null,
      commercial_licence: parsed.data.commercialLicence || null,
      company_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/agencies");
  return { success: true, companyId };
}

/**
 * Delete an agency (company) by ID (soft-delete using the `deleted` flag).
 * Requires candidate.profile.edit capability.
 */
export async function deleteAgency(
  companyId: number,
): Promise<AgencyActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = deleteAgencySchema.safeParse({ companyId });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid company ID",
    };
  }

  const existing = await prisma.company.findFirst({
    where: {
      company_id: parsed.data.companyId,
      deleted: 0,
    },
    select: { company_id: true },
  });
  if (!existing) {
    return { success: false, error: "Agency not found" };
  }

  // Soft-delete
  await prisma.company.update({
    where: { company_id: parsed.data.companyId },
    data: { deleted: 1, company_updated_at: new Date() },
  });

  revalidatePath("/candidate/agencies");
  return { success: true, companyId: parsed.data.companyId };
}
