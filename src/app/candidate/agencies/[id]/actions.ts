"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
  type AgencyItem,
  type AgencyActionResult,
} from "../schemas";

// ---------------------------------------------------------------------------
// Server actions (single agency operations)
// ---------------------------------------------------------------------------

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

/**
 * Update an existing agency (company).
 */
export async function updateAgency(
  data: Record<string, unknown>,
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
 * Delete an agency (company) by ID (soft-delete).
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

  await prisma.company.update({
    where: { company_id: parsed.data.companyId },
    data: { deleted: 1, company_updated_at: new Date() },
  });

  revalidatePath("/candidate/agencies");
  return { success: true, companyId: parsed.data.companyId };
}
