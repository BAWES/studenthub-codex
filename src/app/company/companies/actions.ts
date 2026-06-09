"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCompaniesSchema,
  getCompanySchema,
  createCompanySchema,
} from "./schemas";
import type {
  ListCompaniesInput,
  GetCompanyInput,
  CreateCompanyInput,
  CompanyListItem,
  CompanyDetail,
  ListCompaniesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// List Companies
// ---------------------------------------------------------------------------

/**
 * List companies with optional search filter and pagination.
 * Mirrors the legacy listCompanies endpoint for company accounts.
 */
export async function listCompanies(
  params: ListCompaniesInput = {},
): Promise<ListCompaniesResult> {
  await requireCapability("company.read.linked");

  const parsed = listCompaniesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, search, country_id, currency_code } = parsed.data;

  const where: Record<string, unknown> = {
    deleted: 0,
  };

  if (search) {
    where.OR = [
      { company_name: { contains: search } },
      { company_common_name_en: { contains: search } },
      { company_email: { contains: search } },
    ];
  }

  if (country_id !== undefined) {
    where.country_id = country_id;
  }

  if (currency_code !== undefined) {
    where.currency_code = currency_code;
  }

  const [raw, total] = await Promise.all([
    prisma.company.findMany({
      where: where as any,
      orderBy: { company_updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        country: {
          select: {
            country_name_en: true,
          },
        },
      },
    }),
    prisma.company.count({ where: where as any }),
  ]);

  const companies: CompanyListItem[] = raw.map((c) => ({
    company_id: c.company_id,
    company_name: c.company_name,
    company_email: c.company_email,
    company_website: c.company_website,
    country_name: c.country?.country_name_en ?? null,
    country_id: c.country_id,
    no_of_active_requests: c.no_of_active_requests,
    total_candidate: c.total_candidate,
    company_updated_at: c.company_updated_at,
    currency_code: c.currency_code,
    commercial_licence: c.commercial_licence,
  }));

  return {
    companies,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// Get Company
// ---------------------------------------------------------------------------

/**
 * Get a single company by ID with full detail.
 * Mirrors the legacy getCompanyDetail endpoint.
 */
export async function getCompany(
  companyId: number,
): Promise<CompanyDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getCompanySchema.safeParse({ companyId });
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
// Create Company
// ---------------------------------------------------------------------------

/**
 * Create a new company.
 * Mirrors the legacy createCompany endpoint.
 */
export async function createCompany(
  data: CreateCompanyInput,
): Promise<{ company_id: number }> {
  await requireCapability("company.write.linked");

  const parsed = createCompanySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company data");
  }

  const company = await prisma.company.create({
    data: {
      company_name: parsed.data.company_name,
      company_common_name_en: parsed.data.company_common_name_en ?? null,
      company_common_name_ar: parsed.data.company_common_name_ar ?? null,
      company_description_en: parsed.data.company_description_en ?? null,
      company_description_ar: parsed.data.company_description_ar ?? null,
      company_website: parsed.data.company_website ?? null,
      company_email: parsed.data.company_email ?? null,
      commercial_licence: parsed.data.commercial_licence ?? null,
      country_id: parsed.data.country_id ?? null,
      currency_code: parsed.data.currency_code ?? "KWD",
      company_hourly_rate: parsed.data.company_hourly_rate ?? null,
      company_bonus_commission: parsed.data.company_bonus_commission ?? null,
      company_created_at: new Date(),
      company_updated_at: new Date(),
    },
  });

  revalidatePath("/company/companies");
  return { company_id: company.company_id };
}
