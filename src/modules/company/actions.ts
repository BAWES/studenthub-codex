"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";

const addContactSchema = z.object({
  companyId: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("Company is required")),
  name: z.string().min(1, "Contact name is required").max(255),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  position: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  allowAccess: z.string().optional(),
});

export async function addCompanyContact(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");

  const parsed = addContactSchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    email: formData.get("email"),
    position: formData.get("position"),
    phone: formData.get("phone"),
    allowAccess: formData.get("allowAccess"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let contactUuid: string;
  if (parsed.data.email) {
    const existing = await prisma.contact.findUnique({
      where: { contact_email: parsed.data.email },
      select: { contact_uuid: true },
    });
    if (existing) {
      contactUuid = existing.contact_uuid;
    } else {
      contactUuid = crypto.randomUUID();
      await prisma.contact.create({
        data: {
          contact_uuid: contactUuid,
          contact_name: parsed.data.name,
          contact_email: parsed.data.email,
          contact_created_at: new Date(),
          contact_updated_at: new Date(),
        },
      });
    }
  } else {
    contactUuid = crypto.randomUUID();
    await prisma.contact.create({
      data: {
        contact_uuid: contactUuid,
        contact_name: parsed.data.name,
        contact_created_at: new Date(),
        contact_updated_at: new Date(),
      },
    });
  }

  await prisma.company_contact.create({
    data: {
      company_contact_uuid: crypto.randomUUID(),
      contact_uuid: contactUuid,
      company_id: parsed.data.companyId,
      contact_position: parsed.data.position || null,
      allow_access: parsed.data.allowAccess === "1",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/company/contacts");
  return { error: "" };
}

export async function removeCompanyContact(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");
  const companyContactUuid = formData.get("companyContactUuid");

  if (typeof companyContactUuid !== "string" || !companyContactUuid.trim()) {
    return { error: "Invalid contact." };
  }

  await prisma.company_contact.delete({
    where: { company_contact_uuid: companyContactUuid },
  });

  revalidatePath("/company/contacts");
  return { error: "" };
}

const addStoreSchema = z.object({
  companyId: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("Company is required")),
  storeName: z.string().min(1, "Store name is required").max(255),
  storeLocation: z.string().max(255).optional(),
  mallUuid: z.string().max(60).optional(),
  brandUuid: z.string().max(60).optional(),
});

export async function addCompanyStore(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");

  const parsed = addStoreSchema.safeParse({
    companyId: formData.get("companyId"),
    storeName: formData.get("storeName"),
    storeLocation: formData.get("storeLocation"),
    mallUuid: formData.get("mallUuid"),
    brandUuid: formData.get("brandUuid"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.store.create({
    data: {
      company_id: parsed.data.companyId,
      store_name: parsed.data.storeName,
      store_location: parsed.data.storeLocation || "",
      mall_uuid: parsed.data.mallUuid || null,
      brand_uuid: parsed.data.brandUuid || null,
      store_created_at: new Date(),
      store_updated_at: new Date(),
    },
  });

  revalidatePath("/company/stores");
  return { error: "" };
}

export async function removeCompanyStore(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");
  const storeIdRaw = formData.get("storeId");
  const storeId = Number(storeIdRaw);

  if (!Number.isInteger(storeId) || storeId <= 0) {
    return { error: "Invalid store." };
  }

  await prisma.store.update({
    where: { store_id: storeId },
    data: { deleted: 1, store_updated_at: new Date() },
  });

  revalidatePath("/company/stores");
  return { error: "" };
}

// ---------------------------------------------------------------------------
// Company list/get — admin-level server actions
// Mirrors Yii2 admin CompanyController::actionList and actionView.
// ---------------------------------------------------------------------------

export type CompanyItem = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_email: string | null;
  company_website: string | null;
  company_logo: string | null;
  commercial_licence: string | null;
  company_hourly_rate: number | null;
  company_bonus_commission: number | null;
  company_approved_to_hire: boolean;
  company_status_override: boolean;
  company_followup: boolean | null;
  total_candidate: bigint | null;
  no_of_active_requests: number | null;
  country_id: number | null;
  currency_code: string | null;
  parent_company_id: number | null;
  staff_id: number | null;
  company_created_at: Date;
  company_updated_at: Date;
};

export type ListCompaniesResult = {
  companies: CompanyItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const listCompaniesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().max(255).optional(),
  status: z.coerce.number().int().min(0).max(3).optional(),
  currencyCode: z.string().length(3).optional(),
});

export type ListCompaniesInput = z.input<typeof listCompaniesSchema>;

const getCompanySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export type GetCompanyInput = z.input<typeof getCompanySchema>;

/**
 * List companies with optional name filter and pagination.
 * Mirrors admin CompanyController::actionList.
 * Requires company.read.any capability.
 */
export async function listCompanies(
  params: ListCompaniesInput = {},
): Promise<ListCompaniesResult> {
  await requireCapability("company.read.any");

  const parsed = listCompaniesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, status, currencyCode, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {
    deleted: 0,
  };

  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { company_name: { contains: nameFilter, mode: "insensitive" } },
      { company_common_name_en: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  if (currencyCode) {
    where.currency_code = currencyCode;
  }

  if (status === 1) {
    // Active: not deleted, not status_override=false
    where.company_status_override = false;
  } else if (status === 2) {
    // Inactive: status_override=true
    where.company_status_override = true;
  }

  const [rawCompanies, total] = await Promise.all([
    prisma.company.findMany({
      where: where as any,
      orderBy: [{ company_name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where: where as any }),
  ]);

  const companies: CompanyItem[] = rawCompanies.map((c) => ({
    company_id: c.company_id,
    company_name: c.company_name,
    company_common_name_en: c.company_common_name_en,
    company_common_name_ar: c.company_common_name_ar,
    company_email: c.company_email,
    company_website: c.company_website,
    company_logo: c.company_logo,
    commercial_licence: c.commercial_licence,
    company_hourly_rate: c.company_hourly_rate ? Number(c.company_hourly_rate) : null,
    company_bonus_commission: c.company_bonus_commission ? Number(c.company_bonus_commission) : null,
    company_approved_to_hire: c.company_approved_to_hire ?? false,
    company_status_override: c.company_status_override ?? false,
    company_followup: c.company_followup,
    total_candidate: c.total_candidate,
    no_of_active_requests: c.no_of_active_requests,
    country_id: c.country_id,
    currency_code: c.currency_code,
    parent_company_id: c.parent_company_id,
    staff_id: c.staff_id,
    company_created_at: c.company_created_at,
    company_updated_at: c.company_updated_at,
  }));

  return {
    companies,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single company by ID. Returns null if not found.
 * Mirrors admin CompanyController::actionView.
 * Requires company.read.any capability.
 */
export async function getCompany(params: GetCompanyInput): Promise<CompanyItem | null> {
  await requireCapability("company.read.any");

  const parsed = getCompanySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company ID");
  }

  const { companyId } = parsed.data;

  const c = await prisma.company.findUnique({
    where: { company_id: companyId },
  });

  if (!c) return null;

  return {
    company_id: c.company_id,
    company_name: c.company_name,
    company_common_name_en: c.company_common_name_en,
    company_common_name_ar: c.company_common_name_ar,
    company_email: c.company_email,
    company_website: c.company_website,
    company_logo: c.company_logo,
    commercial_licence: c.commercial_licence,
    company_hourly_rate: c.company_hourly_rate ? Number(c.company_hourly_rate) : null,
    company_bonus_commission: c.company_bonus_commission ? Number(c.company_bonus_commission) : null,
    company_approved_to_hire: c.company_approved_to_hire ?? false,
    company_status_override: c.company_status_override ?? false,
    company_followup: c.company_followup,
    total_candidate: c.total_candidate,
    no_of_active_requests: c.no_of_active_requests,
    country_id: c.country_id,
    currency_code: c.currency_code,
    parent_company_id: c.parent_company_id,
    staff_id: c.staff_id,
    company_created_at: c.company_created_at,
    company_updated_at: c.company_updated_at,
  };
}
