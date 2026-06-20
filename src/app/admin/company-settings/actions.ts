"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  adminCompanySettingsItemSchema,
  adminCompanySettingsActionResponseSchema,
  updateCompanySettingsInputSchema,
} from "./schemas";
import type {
  AdminCompanySettingsItem,
  UpdateCompanySettingsInput,
} from "./schemas";

export async function listAdminCompanySettings(): Promise<{ items: AdminCompanySettingsItem[] }> {
  await requireCapability("admin.read");

  const rows = await prisma.company.findMany({
    orderBy: { company_name: "asc" },
    select: {
      company_id: true,
      company_name: true,
      company_common_name_en: true,
      company_common_name_ar: true,
      company_description_en: true,
      company_description_ar: true,
      company_website: true,
      company_email: true,
      company_hourly_rate: true,
      company_bonus_commission: true,
      company_followup: true,
      company_followup_interval_weeks: true,
      company_approved_to_hire: true,
      currency_code: true,
    },
    where: { deleted: 0 },
  });

  const items = rows.map((row) => {
    const item = {
      company_id: row.company_id,
      company_name: row.company_name,
      company_common_name_en: row.company_common_name_en,
      company_common_name_ar: row.company_common_name_ar,
      company_description_en: row.company_description_en,
      company_description_ar: row.company_description_ar,
      company_website: row.company_website,
      company_email: row.company_email,
      company_hourly_rate: row.company_hourly_rate ? Number(row.company_hourly_rate) : null,
      company_bonus_commission: row.company_bonus_commission ? Number(row.company_bonus_commission) : null,
      company_followup: row.company_followup ?? true,
      company_followup_interval_weeks: row.company_followup_interval_weeks,
      company_approved_to_hire: row.company_approved_to_hire ?? true,
      currency_code: row.currency_code,
    };

    const parsed = adminCompanySettingsItemSchema.safeParse(item);
    if (!parsed.success) {
      console.error("[admin/company-settings] listAdminCompanySettings item parse failed:", parsed.error.issues);
    }

    return item as AdminCompanySettingsItem;
  });

  return { items };
}

export async function getAdminCompanySettings(
  companyId: number,
): Promise<AdminCompanySettingsItem | null> {
  await requireCapability("admin.read");

  const row = await prisma.company.findFirst({
    where: { company_id: companyId, deleted: 0 },
    select: {
      company_id: true,
      company_name: true,
      company_common_name_en: true,
      company_common_name_ar: true,
      company_description_en: true,
      company_description_ar: true,
      company_website: true,
      company_email: true,
      company_hourly_rate: true,
      company_bonus_commission: true,
      company_followup: true,
      company_followup_interval_weeks: true,
      company_approved_to_hire: true,
      currency_code: true,
    },
  });

  if (!row) return null;

  const item = {
    company_id: row.company_id,
    company_name: row.company_name,
    company_common_name_en: row.company_common_name_en,
    company_common_name_ar: row.company_common_name_ar,
    company_description_en: row.company_description_en,
    company_description_ar: row.company_description_ar,
    company_website: row.company_website,
    company_email: row.company_email,
    company_hourly_rate: row.company_hourly_rate ? Number(row.company_hourly_rate) : null,
    company_bonus_commission: row.company_bonus_commission ? Number(row.company_bonus_commission) : null,
    company_followup: row.company_followup ?? true,
    company_followup_interval_weeks: row.company_followup_interval_weeks,
    company_approved_to_hire: row.company_approved_to_hire ?? true,
    currency_code: row.currency_code,
  };

  const parsed = adminCompanySettingsItemSchema.safeParse(item);
  if (!parsed.success) {
    console.error("[admin/company-settings] getAdminCompanySettings parse failed:", parsed.error.issues);
  }

  return item as AdminCompanySettingsItem;
}

export async function updateAdminCompanySettings(
  companyId: number,
  input: UpdateCompanySettingsInput,
): Promise<{ operation: "success" | "error"; message: string }> {
  await requireCapability("admin.write");

  const parsed = updateCompanySettingsInputSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { operation: "error", message: msg };
  }

  try {
    const existing = await prisma.company.findUnique({
      where: { company_id: companyId },
      select: { company_id: true },
    });

    if (!existing) {
      return { operation: "error", message: "Company not found" };
    }

    const data: Record<string, unknown> = {};
    const d = parsed.data;

    if (d.companyName !== undefined) data.company_name = d.companyName;
    if (d.companyCommonNameEn !== undefined) data.company_common_name_en = d.companyCommonNameEn;
    if (d.companyCommonNameAr !== undefined) data.company_common_name_ar = d.companyCommonNameAr;
    if (d.companyDescriptionEn !== undefined) data.company_description_en = d.companyDescriptionEn;
    if (d.companyDescriptionAr !== undefined) data.company_description_ar = d.companyDescriptionAr;
    if (d.companyWebsite !== undefined) data.company_website = d.companyWebsite;
    if (d.companyEmail !== undefined) data.company_email = d.companyEmail;
    if (d.companyHourlyRate !== undefined) data.company_hourly_rate = d.companyHourlyRate;
    if (d.companyBonusCommission !== undefined) data.company_bonus_commission = d.companyBonusCommission;
    if (d.companyFollowup !== undefined) data.company_followup = d.companyFollowup;
    if (d.companyFollowupIntervalWeeks !== undefined)
      data.company_followup_interval_weeks = d.companyFollowupIntervalWeeks;
    if (d.companyApprovedToHire !== undefined) data.company_approved_to_hire = d.companyApprovedToHire;
    if (d.currencyCode !== undefined) data.currency_code = d.currencyCode;

    if (Object.keys(data).length === 0) {
      return { operation: "error", message: "No fields to update" };
    }

    await prisma.company.update({
      where: { company_id: companyId },
      data,
    });

    revalidatePath("/admin/company-settings");

    const result = { operation: "success" as const, message: "Company settings updated successfully" };
    const outputParsed = adminCompanySettingsActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/company-settings] updateAdminCompanySettings output failed:", outputParsed.error.issues);
    }

    return result;
  } catch (_e) {
    return {
      operation: "error",
      message: "We've faced a problem updating company settings. Please contact us for assistance.",
    };
  }
}
