"use server";

// ---------------------------------------------------------------------------
// Admin Companies [id] — server actions
// ---------------------------------------------------------------------------
// Detail-page server actions for a single company.
// Re-exports the shared actions from the parent route and adds
// detail-page-specific mutations.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatMoney } from "@/modules/workspace/format";
import { getAdminCompanyDetail as _getAdminCompanyDetail, toggleCompanyApproval as _toggleCompanyApproval } from "../actions";
import type { CompanyDetail, CompanyRow } from "../schemas";

// ---------------------------------------------------------------------------
// Re-export shared parent actions via wrapper functions
// Next.js 15 "use server" forbids bare re-exports — use wrapper functions.
// ---------------------------------------------------------------------------

export async function getAdminCompanyDetail(
  companyId: number,
): Promise<CompanyDetail> {
  return _getAdminCompanyDetail(companyId);
}

export async function toggleCompanyApproval(
  companyId: number,
  approved: boolean,
): Promise<{ success: boolean; error?: string }> {
  return _toggleCompanyApproval(companyId, approved);
}

import { updateAdminCompanySchema, updateCompanyResultSchema, companyExistenceSchema } from "./schemas";
import type { UpdateAdminCompanyInput } from "./schemas";

// ---------------------------------------------------------------------------
// updateAdminCompany
// ---------------------------------------------------------------------------

/**
 * Update a company's editable fields.
 * Admin action — requires admin.write capability.
 * Only provided fields are modified.
 */
export async function updateAdminCompany(
  input: UpdateAdminCompanyInput,
): Promise<z.output<typeof updateCompanyResultSchema>> {
  await requireCapability("admin.write");

  const parsed = updateAdminCompanySchema.safeParse(input);
  if (!parsed.success) {
    return updateCompanyResultSchema.parse({
      operation: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  const existing = await prisma.company.findUnique({
    where: { company_id: parsed.data.companyId },
    select: { company_id: true },
  });

  const parsedExisting = companyExistenceSchema.safeParse(existing);
  if (!parsedExisting.success || !parsedExisting.data) {
    return updateCompanyResultSchema.parse({
      operation: "error" as const,
      message: "Company not found",
    });
  }

  const updateData: Record<string, unknown> = {
    company_updated_at: new Date(),
  };

  if (parsed.data.companyName !== undefined) updateData.company_name = parsed.data.companyName;
  if (parsed.data.companyCommonNameEn !== undefined) updateData.company_common_name_en = parsed.data.companyCommonNameEn;
  if (parsed.data.companyEmail !== undefined) updateData.company_email = parsed.data.companyEmail;
  if (parsed.data.companyWebsite !== undefined) updateData.company_website = parsed.data.companyWebsite;
  if (parsed.data.companyHourlyRate !== undefined) updateData.company_hourly_rate = parsed.data.companyHourlyRate;
  if (parsed.data.currencyCode !== undefined) updateData.currency_code = parsed.data.currencyCode;

  try {
    await prisma.company.update({
      where: { company_id: parsed.data.companyId },
      data: updateData as any,
    });

    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${parsed.data.companyId}`);

    return updateCompanyResultSchema.parse({
      operation: "success" as const,
      message: "Company updated",
    });
  } catch (err) {
    return updateCompanyResultSchema.parse({
      operation: "error" as const,
      message: err instanceof Error ? err.message : "Failed to update company",
    });
  }
}
