"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getCompanyDetailSchema,
  updateCompanySchema,
} from "./schemas";
import type {
  CompanyDetailResult,
  UpdateCompanyInput,
  UpdateCompanyResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Get Company Detail
// ---------------------------------------------------------------------------

/**
 * Get a single company by ID with full detail including related records.
 * Mirrors the legacy getCompanyAccountDetail endpoint.
 * Called from company/companies/[id] route.
 */
export async function getCompanyDetail(
  companyId: number,
): Promise<CompanyDetailResult | null> {
  await requireCapability("company.read.linked");

  const parsed = getCompanyDetailSchema.safeParse({ companyId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company ID");
  }

  const raw = await prisma.company.findUnique({
    where: { company_id: parsed.data.companyId },
    include: {
      country: {
        select: {
          country_name_en: true,
        },
      },
      company: {
        // parent company relation (self-referencing via "companyTocompany")
        select: {
          company_name: true,
        },
      },
      staff: {
        select: {
          staff_name: true,
        },
      },
    },
  });

  if (!raw) return null;

  return {
    company_id: raw.company_id,
    parent_company_id: raw.parent_company_id,
    company_name: raw.company_name,
    company_common_name_en: raw.company_common_name_en,
    company_common_name_ar: raw.company_common_name_ar,
    company_description_en: raw.company_description_en,
    company_description_ar: raw.company_description_ar,
    company_website: raw.company_website,
    company_email: raw.company_email,
    company_logo: raw.company_logo,
    commercial_licence: raw.commercial_licence,
    company_hourly_rate: raw.company_hourly_rate
      ? Number(raw.company_hourly_rate)
      : null,
    company_bonus_commission: raw.company_bonus_commission
      ? Number(raw.company_bonus_commission)
      : null,
    company_followup: raw.company_followup,
    total_candidate: raw.total_candidate,
    no_of_active_requests: raw.no_of_active_requests,
    is_request_updates_in_30_days: raw.is_request_updates_in_30_days,
    company_approved_to_hire: raw.company_approved_to_hire,
    company_status_override: raw.company_status_override,
    company_created_at: raw.company_created_at,
    company_updated_at: raw.company_updated_at,
    last_request_datetime: raw.last_request_datetime,
    last_payment_datetime: raw.last_payment_datetime,
    country_id: raw.country_id,
    currency_code: raw.currency_code,
    country_name: raw.country?.country_name_en ?? null,
    parent_company_name: raw.company?.company_name ?? null,
    staff_name: raw.staff?.staff_name ?? null,
  };
}

// ---------------------------------------------------------------------------
// Update Company
// ---------------------------------------------------------------------------

/**
 * Update an existing company's details.
 * Mirrors the legacy updateCompany endpoint.
 * Called from company/companies/[id] route.
 */
export async function updateCompany(
  data: UpdateCompanyInput,
): Promise<UpdateCompanyResult> {
  await requireCapability("company.write.linked");

  const parsed = updateCompanySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company data");
  }

  const { companyId, ...fields } = parsed.data;

  const updateData: Record<string, unknown> = {
    company_updated_at: new Date(),
  };

  if (fields.company_name !== undefined) {
    updateData.company_name = fields.company_name;
  }
  if (fields.company_common_name_en !== undefined) {
    updateData.company_common_name_en = fields.company_common_name_en;
  }
  if (fields.company_common_name_ar !== undefined) {
    updateData.company_common_name_ar = fields.company_common_name_ar;
  }
  if (fields.company_description_en !== undefined) {
    updateData.company_description_en = fields.company_description_en;
  }
  if (fields.company_description_ar !== undefined) {
    updateData.company_description_ar = fields.company_description_ar;
  }
  if (fields.company_website !== undefined) {
    updateData.company_website = fields.company_website;
  }
  if (fields.company_email !== undefined) {
    updateData.company_email = fields.company_email;
  }
  if (fields.commercial_licence !== undefined) {
    updateData.commercial_licence = fields.commercial_licence;
  }
  if (fields.country_id !== undefined) {
    updateData.country_id = fields.country_id;
  }
  if (fields.currency_code !== undefined) {
    updateData.currency_code = fields.currency_code;
  }
  if (fields.company_hourly_rate !== undefined) {
    updateData.company_hourly_rate = fields.company_hourly_rate;
  }
  if (fields.company_bonus_commission !== undefined) {
    updateData.company_bonus_commission = fields.company_bonus_commission;
  }
  if (fields.company_followup !== undefined) {
    updateData.company_followup = fields.company_followup;
  }
  if (fields.company_approved_to_hire !== undefined) {
    updateData.company_approved_to_hire = fields.company_approved_to_hire;
  }
  if (fields.company_status_override !== undefined) {
    updateData.company_status_override = fields.company_status_override;
  }
  if (fields.parent_company_id !== undefined) {
    updateData.parent_company_id = fields.parent_company_id;
  }

  await prisma.company.update({
    where: { company_id: companyId },
    data: updateData as any,
  });

  revalidatePath("/company/companies");
  return { company_id: companyId };
}
