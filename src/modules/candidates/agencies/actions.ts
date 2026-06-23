"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listAgenciesSchema,
  getAgencySchema,
  createAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
  agencyItemSchema,
  listAgenciesResultSchema,
  agencyActionResultSchema,
  type ListAgenciesInput,
  type GetAgencyInput,
  type CreateAgencyInput,
  type UpdateAgencyInput,
  type DeleteAgencyInput,
  type AgencyItem,
  type ListAgenciesResult,
  type AgencyActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma company row to the shared AgencyItem shape. */
function toItem(row: RawCompanyRow): AgencyItem | null {
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

/** Raw row shape from Prisma. */
type RawCompanyRow = Awaited<ReturnType<typeof prisma.company.findFirst>>;

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/agencies] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List agency (company) records (paginated, searchable).
 * Requires candidate.read capability.
 */
export async function listAgencies(
  params: ListAgenciesInput,
): Promise<ListAgenciesResult> {
  await requireCapability("candidate.read");

  const { page, limit, search } = listAgenciesSchema.parse(params);
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

  const result = {
    items: rows.map((r) => toItem(r)!),
    total,
    page,
    pageSize: limit,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listAgenciesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listAgencies", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single agency (company) by ID.
 * Requires candidate.read capability.
 * Returns null if not found or soft-deleted.
 */
export async function getAgency(
  params: GetAgencyInput,
): Promise<AgencyItem | null> {
  await requireCapability("candidate.read");

  const { companyId } = getAgencySchema.parse(params);

  const row = await prisma.company.findFirst({
    where: { company_id: companyId, deleted: 0 },
  });

  if (!row) return null;

  const result = toItem(row)!;

  // Output validation
  const outputParsed = agencyItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getAgency", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new agency (company).
 * Requires candidate.profile.edit capability.
 */
export async function createAgency(
  params: CreateAgencyInput,
): Promise<AgencyActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = createAgencySchema.safeParse(params);
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

  const result: AgencyActionResult = { success: true, companyId: row.company_id };

  // Output validation
  const outputParsed = agencyActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createAgency", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing agency (company).
 * Requires candidate.profile.edit capability.
 */
export async function updateAgency(
  params: UpdateAgencyInput,
): Promise<AgencyActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = updateAgencySchema.safeParse(params);
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

  const result: AgencyActionResult = { success: true, companyId };

  // Output validation
  const outputParsed = agencyActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateAgency", outputParsed.error.issues);
  }

  return result;
}

/**
 * Delete an agency (company) by ID (soft-delete using the `deleted` flag).
 * Requires candidate.profile.edit capability.
 */
export async function deleteAgency(
  params: DeleteAgencyInput,
): Promise<AgencyActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = deleteAgencySchema.safeParse(params);
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

  const result: AgencyActionResult = {
    success: true,
    companyId: parsed.data.companyId,
  };

  // Output validation
  const outputParsed = agencyActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteAgency", outputParsed.error.issues);
  }

  return result;
}
