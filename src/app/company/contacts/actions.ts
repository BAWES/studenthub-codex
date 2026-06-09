"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCompanyContactsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCompanyContactSchema = z.object({
  uuid: z.string().min(1, "Company contact UUID is required"),
});

export const createCompanyContactSchema = z.object({
  company_id: z.number({ required_error: "Company ID is required" }).int().positive(),
  contact_name: z
    .string({ required_error: "Contact name is required" })
    .min(1, "Contact name is required")
    .max(255),
  contact_email: z.string().email("Invalid email").max(255).optional(),
  contact_position: z.string().max(100).optional(),
  allow_access: z.boolean().optional().default(false),
});

export const updateCompanyContactSchema = z.object({
  uuid: z.string().min(1, "Company contact UUID is required"),
  contact_position: z.string().max(100).optional(),
  allow_access: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompanyContactsInput = z.input<typeof listCompanyContactsSchema>;
export type CreateCompanyContactInput = z.input<typeof createCompanyContactSchema>;
export type UpdateCompanyContactInput = z.input<typeof updateCompanyContactSchema>;

export type CompanyContactListItem = {
  company_contact_uuid: string;
  company_id: number | null;
  contact_position: string | null;
  allow_access: boolean | null;
  contact_name: string | null;
  contact_email: string | null;
  company_name: string | null;
};

export type CompanyContactDetail = {
  company_contact_uuid: string;
  contact_uuid: string | null;
  company_id: number | null;
  contact_position: string | null;
  allow_access: boolean | null;
  created_at: Date;
  updated_at: Date;
  contact_name: string | null;
  contact_email: string | null;
  company_name: string | null;
};

export type ListCompanyContactsResult = {
  contacts: CompanyContactListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List company contacts with optional company filter and pagination.
 * Mirrors the legacy CompanyContactController::actionList().
 */
export async function listCompanyContacts(
  params: ListCompanyContactsInput = {},
): Promise<ListCompanyContactsResult> {
  await requireCapability("company.read.linked");

  const parsed = listCompanyContactsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }

  const [raw, total] = await Promise.all([
    prisma.company_contact.findMany({
      where: where as any,
      orderBy: { updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        company_contact_uuid: true,
        company_id: true,
        contact_position: true,
        allow_access: true,
        contact: {
          select: {
            contact_name: true,
            contact_email: true,
          },
        },
        company: {
          select: {
            company_name: true,
          },
        },
      },
    }),
    prisma.company_contact.count({ where: where as any }),
  ]);

  const contacts: CompanyContactListItem[] = raw.map((c) => ({
    company_contact_uuid: c.company_contact_uuid,
    company_id: c.company_id,
    contact_position: c.contact_position,
    allow_access: c.allow_access,
    contact_name: c.contact?.contact_name ?? null,
    contact_email: c.contact?.contact_email ?? null,
    company_name: c.company?.company_name ?? null,
  }));

  return {
    contacts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single company contact by UUID.
 * Mirrors the legacy CompanyContactController::actionView().
 */
export async function getCompanyContact(
  uuid: string,
): Promise<CompanyContactDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getCompanyContactSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company contact UUID");
  }

  const raw = await prisma.company_contact.findUnique({
    where: { company_contact_uuid: parsed.data.uuid },
    include: {
      contact: {
        select: {
          contact_name: true,
          contact_email: true,
        },
      },
      company: {
        select: {
          company_name: true,
        },
      },
    },
  });

  if (!raw) return null;

  return {
    company_contact_uuid: raw.company_contact_uuid,
    contact_uuid: raw.contact_uuid,
    company_id: raw.company_id,
    contact_position: raw.contact_position,
    allow_access: raw.allow_access,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    contact_name: raw.contact?.contact_name ?? null,
    contact_email: raw.contact?.contact_email ?? null,
    company_name: raw.company?.company_name ?? null,
  };
}

/**
 * Create a new company contact link.
 * If a contact with the given email doesn't exist, creates one first.
 * Mirrors the legacy CompanyContactController::actionCreate().
 */
export async function createCompanyContact(
  data: CreateCompanyContactInput,
): Promise<{ company_contact_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = createCompanyContactSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company contact data");
  }

  // Find or create the contact record
  let contactUuid: string;

  if (parsed.data.contact_email) {
    const existingContact = await prisma.contact.findUnique({
      where: { contact_email: parsed.data.contact_email },
      select: { contact_uuid: true },
    });

    if (existingContact) {
      contactUuid = existingContact.contact_uuid;
    } else {
      const newContact = await prisma.contact.create({
        data: {
          contact_uuid: crypto.randomUUID(),
          contact_name: parsed.data.contact_name,
          contact_email: parsed.data.contact_email,
          contact_created_at: new Date(),
          contact_updated_at: new Date(),
        },
      });
      contactUuid = newContact.contact_uuid;
    }
  } else {
    // No email provided, create a contact without an email
    const newContact = await prisma.contact.create({
      data: {
        contact_uuid: crypto.randomUUID(),
        contact_name: parsed.data.contact_name,
        contact_created_at: new Date(),
        contact_updated_at: new Date(),
      },
    });
    contactUuid = newContact.contact_uuid;
  }

  const companyContact = await prisma.company_contact.create({
    data: {
      company_contact_uuid: crypto.randomUUID(),
      company_id: parsed.data.company_id,
      contact_uuid: contactUuid,
      contact_position: parsed.data.contact_position ?? null,
      allow_access: parsed.data.allow_access ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/company/contacts");
  return { company_contact_uuid: companyContact.company_contact_uuid };
}

/**
 * Update an existing company contact's position or access settings.
 */
export async function updateCompanyContact(
  data: UpdateCompanyContactInput,
): Promise<{ company_contact_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = updateCompanyContactSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company contact data");
  }

  const updateData: Record<string, unknown> = { updated_at: new Date() };
  if (parsed.data.contact_position !== undefined) {
    updateData.contact_position = parsed.data.contact_position;
  }
  if (parsed.data.allow_access !== undefined) {
    updateData.allow_access = parsed.data.allow_access;
  }

  await prisma.company_contact.update({
    where: { company_contact_uuid: parsed.data.uuid },
    data: updateData as any,
  });

  revalidatePath("/company/contacts");
  return { company_contact_uuid: parsed.data.uuid };
}
