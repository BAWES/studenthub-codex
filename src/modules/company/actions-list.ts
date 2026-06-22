"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCompaniesSchema,
  getCompanySchema,
  listCompaniesResultSchema,
  adminCompanyDetailResultSchema as companyDetailResultSchema,
  type ListCompaniesParams,
  type GetCompanyParams,
  type CompanyListItem,
  type ListCompaniesResult,
  type CompanyDetailResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Re-export schemas for shared validation (backward compatibility)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List companies with optional filters and pagination.
 * Maps to legacy GET /staff/v1/company/list
 */
export async function listCompanies(
  params: ListCompaniesParams = {},
): Promise<ListCompaniesResult> {
  await requireCapability("company.read");

  const { nameFilter, status, page, pageSize } =
    listCompaniesSchema.parse(params);

  const where: Record<string, unknown> = {
    deleted: 0,
    parent_company_id: null,
  };

  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { company_name: { contains: nameFilter } },
      { company_common_name_en: { contains: nameFilter } },
      { company_common_name_ar: { contains: nameFilter } },
    ];
  }

  if (status === "active") {
    (where as Record<string, unknown>).company_status = "active";
  } else if (status === "inactive") {
    (where as Record<string, unknown>).company_status = "inactive";
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { company_name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        company_id: true,
        company_name: true,
        company_common_name_en: true,
        company_common_name_ar: true,
        company_email: true,
        company_website: true,
        company_logo: true,
        company_bonus_commission: true,
        total_candidate: true,
        no_of_active_requests: true,
        company_followup: true,
        currency_code: true,
      },
    }),
    prisma.company.count({ where }),
  ]);

  const result = {
    items: companies.map((c) => ({
      company_id: c.company_id,
      company_name: c.company_name,
      company_common_name_en: c.company_common_name_en,
      company_common_name_ar: c.company_common_name_ar,
      company_email: c.company_email,
      company_website: c.company_website,
      company_logo: c.company_logo,
      commission: c.company_bonus_commission
        ? Number(c.company_bonus_commission)
        : null,
      total_candidate: c.total_candidate ? Number(c.total_candidate) : null,
      no_of_active_requests: c.no_of_active_requests,
      followup: c.company_followup,
      currency_code: c.currency_code,
    })),
    total,
    page,
    pageSize,
  };

  // Validate output shape
  const outputParsed = listCompaniesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company] listCompanies output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get company details by ID.
 * Maps to legacy GET /staff/v1/company/view/{id}
 */
export async function getCompany(
  params: GetCompanyParams,
): Promise<CompanyDetailResult> {
  await requireCapability("company.read");

  const { companyId } = getCompanySchema.parse(params);

  const company = await prisma.company.findUnique({
    where: { company_id: companyId, deleted: 0 },
    select: {
      company_id: true,
      company_name: true,
      company_common_name_en: true,
      company_common_name_ar: true,
      company_description_en: true,
      company_description_ar: true,
      company_email: true,
      company_website: true,
      company_logo: true,
      commercial_licence: true,
      company_bonus_commission: true,
      company_hourly_rate: true,
      total_candidate: true,
      no_of_active_requests: true,
      company_followup: true,
      currency_code: true,
      parent_company_id: true,
      staff_id: true,
    },
  });

  if (!company) return null;

  const result = {
    company_id: company.company_id,
    company_name: company.company_name,
    company_common_name_en: company.company_common_name_en,
    company_common_name_ar: company.company_common_name_ar,
    company_description_en: company.company_description_en,
    company_description_ar: company.company_description_ar,
    company_email: company.company_email,
    company_website: company.company_website,
    company_logo: company.company_logo,
    commercial_licence: company.commercial_licence,
    commission: company.company_bonus_commission
      ? Number(company.company_bonus_commission)
      : null,
    company_hourly_rate: company.company_hourly_rate
      ? Number(company.company_hourly_rate)
      : null,
    total_candidate: company.total_candidate
      ? Number(company.total_candidate)
      : null,
    no_of_active_requests: company.no_of_active_requests,
    followup: company.company_followup,
    currency_code: company.currency_code,
    parent_company_id: company.parent_company_id,
    staff_id: company.staff_id,
  };

  // Validate output shape
  const outputParsed = companyDetailResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company] getCompany output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
