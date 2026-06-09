"use server";

// ---------------------------------------------------------------------------
// Admin Companies [id] — server actions
// ---------------------------------------------------------------------------
// Detail-page server actions for a single company.
// Re-exports the shared actions from the parent route and adds
// detail-page-specific mutations.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatMoney } from "@/modules/workspace/format";

// Re-export shared parent actions
export {
  getAdminCompanyDetail,
  toggleCompanyApproval,
} from "../actions";

export type {
  CompanyDetail,
  CompanyRow,
} from "../actions";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const updateAdminCompanySchema = z.object({
  companyId: z.coerce.number().int().positive("Company ID is required"),
  companyName: z.string().max(255).optional(),
  companyCommonNameEn: z.string().max(255).optional().nullable(),
  companyEmail: z.string().email().max(255).optional().nullable(),
  companyWebsite: z.string().url().max(255).optional().nullable(),
  companyHourlyRate: z.coerce.number().min(0).optional().nullable(),
  currencyCode: z.string().length(3).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateAdminCompanyInput = z.input<typeof updateAdminCompanySchema>;

export type AdminCompanyActionResponse = {
  operation: "success" | "error";
  message: string;
};

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
): Promise<AdminCompanyActionResponse> {
  await requireCapability("admin.write");

  const parsed = updateAdminCompanySchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.company.findUnique({
    where: { company_id: parsed.data.companyId },
    select: { company_id: true },
  });

  if (!existing) {
    return { operation: "error", message: "Company not found" };
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

    return { operation: "success", message: "Company updated" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update company",
    };
  }
}
