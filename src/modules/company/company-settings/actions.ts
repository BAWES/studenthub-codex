"use server";

// ---------------------------------------------------------------------------
// Company Settings — server actions
// ---------------------------------------------------------------------------
// Actions:
//   - list        — list all settings for the current user's company
//   - get         — get a single setting by company_id
//   - update      — update company settings
//
// Company settings map to the `company` model fields. The "current" company
// is resolved from the authenticated user's session.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  updateCompanySettingsSchema,
  companySettingsOutputSchema,
  companySettingsListOutputSchema,
  companySettingsActionResultOutputSchema,
} from "./schemas";
import type {
  UpdateCompanySettingsInput,
  CompanySettings,
  CompanySettingsActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/company/company-settings] ${source} output validation failed:`, error);
}

/**
 * Map a raw company row to the CompanySettings shape.
 * Handles Decimal → number conversion for numeric fields.
 */
function toCompanySettings(r: any): CompanySettings {
  return {
    company_id: r.company_id,
    company_name: r.company_name ?? null,
    company_common_name_en: r.company_common_name_en ?? null,
    company_common_name_ar: r.company_common_name_ar ?? null,
    company_description_en: r.company_description_en ?? null,
    company_description_ar: r.company_description_ar ?? null,
    company_website: r.company_website ?? null,
    company_email: r.company_email ?? null,
    company_logo: r.company_logo ?? null,
    commercial_licence: r.commercial_licence ?? null,
    company_hourly_rate: r.company_hourly_rate ? Number(r.company_hourly_rate) : null,
    company_bonus_commission: r.company_bonus_commission ? Number(r.company_bonus_commission) : null,
    company_followup: r.company_followup ?? null,
    company_followup_interval_weeks: r.company_followup_interval_weeks ?? null,
    company_approved_to_hire: r.company_approved_to_hire ?? null,
    currency_code: r.currency_code ?? null,
  };
}

// ---------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------

/**
 * Get company settings for the current user's company.
 * Resolves the company from the authenticated user's session context.
 */
export async function list(): Promise<{
  items: CompanySettings[];
}> {
  await requireCapability("company.read.assigned");

  // TODO: Resolve company from session context once user→company mapping is available.
  // For now, returns all companies the user has access to.
  const companies = await prisma.company.findMany({
    where: { deleted: 0 },
    orderBy: { company_name: "asc" },
    take: 100,
  });

  const items = companies.map(toCompanySettings);

  // Validate output shape
  const outputParsed = companySettingsListOutputSchema.safeParse({ items });
  if (!outputParsed.success) {
    logOutputError("list", outputParsed.error.issues);
  }

  return { items };
}

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------

/**
 * Get a specific company's settings by company_id.
 */
export async function get(
  companyId: number,
): Promise<CompanySettings | null> {
  await requireCapability("company.read.assigned");

  const company = await prisma.company.findFirst({
    where: { company_id: companyId, deleted: 0 },
  });

  const result = company ? toCompanySettings(company) : null;

  // Validate output shape
  if (result !== null) {
    const outputParsed = companySettingsOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("get", outputParsed.error.issues);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

/**
 * Update company settings. Only provided fields are updated.
 * Returns the updated settings on success.
 */
export async function update(
  companyId: number,
  input: UpdateCompanySettingsInput,
): Promise<CompanySettingsActionResult> {
  await requireCapability("company.write.linked");

  const parsed = updateCompanySettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify the company exists
  const existing = await prisma.company.findFirst({
    where: { company_id: companyId, deleted: 0 },
    select: { company_id: true },
  });

  if (!existing) {
    return { operation: "error", message: "Company not found" };
  }

  const data = parsed.data;

  // Build update payload — only set provided fields
  const updateData: Record<string, unknown> = {
    company_updated_at: new Date(),
  };

  if (data.companyName !== undefined) updateData.company_name = data.companyName;
  if (data.companyCommonNameEn !== undefined) updateData.company_common_name_en = data.companyCommonNameEn;
  if (data.companyCommonNameAr !== undefined) updateData.company_common_name_ar = data.companyCommonNameAr;
  if (data.companyDescriptionEn !== undefined) updateData.company_description_en = data.companyDescriptionEn;
  if (data.companyDescriptionAr !== undefined) updateData.company_description_ar = data.companyDescriptionAr;
  if (data.companyWebsite !== undefined) updateData.company_website = data.companyWebsite;
  if (data.companyEmail !== undefined) updateData.company_email = data.companyEmail;
  if (data.companyHourlyRate !== undefined) updateData.company_hourly_rate = data.companyHourlyRate;
  if (data.companyBonusCommission !== undefined) updateData.company_bonus_commission = data.companyBonusCommission;
  if (data.companyFollowup !== undefined) updateData.company_followup = data.companyFollowup;
  if (data.companyFollowupIntervalWeeks !== undefined) updateData.company_followup_interval_weeks = data.companyFollowupIntervalWeeks;
  if (data.companyApprovedToHire !== undefined) updateData.company_approved_to_hire = data.companyApprovedToHire;
  if (data.currencyCode !== undefined) updateData.currency_code = data.currencyCode;

  try {
    const updated = await prisma.company.update({
      where: { company_id: companyId },
      data: updateData as any,
    });

    revalidatePath("/company/company-settings");

    const updatedSettings = toCompanySettings(updated);

    const result: CompanySettingsActionResult = {
      operation: "success",
      message: "Company settings updated successfully",
      data: updatedSettings,
    };

    // Validate output shape
    const outputParsed = companySettingsActionResultOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("update", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update company settings",
    };
  }
}
