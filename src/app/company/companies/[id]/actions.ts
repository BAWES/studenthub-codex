"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/modules/auth/session";
import {
  getCompany as moduleGetCompany,
  updateCompany as moduleUpdateCompany,
  getCompanyAccountDetail as moduleGetCompanyAccountDetail,
} from "@/modules/companies/actions";
import {
  getCompanyDetailSchema,
  updateCompanySchema,
  companyDetailResultSchema,
  companyAccountDetailOutputSchema,
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

  const company = await moduleGetCompany(parsed.data.companyId);
  return company as CompanyDetailResult | null;
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

  const result = await moduleUpdateCompany(parsed.data);
  revalidatePath("/company/companies");
  return result as UpdateCompanyResult;
}

// ---------------------------------------------------------------------------
// Get Company Account Detail (contact-scoped)
// ---------------------------------------------------------------------------

/**
 * Get company detail scoped to the contact's linked companies.
 * Delegates to src/modules/companies/actions.ts.
 */
export async function getCompanyAccountDetail(
  contactUuid: string,
  companyId: number,
): Promise<ReturnType<typeof companyAccountDetailOutputSchema.parse> | null> {
  await requireCapability("company.read.linked");
  return moduleGetCompanyAccountDetail(contactUuid, companyId);
}
