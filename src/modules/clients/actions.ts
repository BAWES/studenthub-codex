"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listClientsSchema = z.object({
  name: z.string().optional(),
  staff_id: z.number().int().positive().optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getClientSchema = z.object({
  id: z.number().int().positive(),
});

export const createClientSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(255),
  common_name_en: z.string().max(255).optional(),
  common_name_ar: z.string().max(255).optional(),
  description_en: z.string().max(65535).optional(),
  description_ar: z.string().max(65535).optional(),
  website: z.string().max(65535).optional(),
  email: z.string().max(225).optional(),
  hourly_rate: z.number().positive().optional(),
  bonus_commission: z.number().min(0).optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().length(3).optional(),
});

export const updateClientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  common_name_en: z.string().max(255).optional(),
  common_name_ar: z.string().max(255).optional(),
  description_en: z.string().max(65535).optional(),
  description_ar: z.string().max(65535).optional(),
  website: z.string().max(65535).optional(),
  email: z.string().max(225).optional(),
  hourly_rate: z.number().positive().optional(),
  bonus_commission: z.number().min(0).optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().length(3).optional(),
  staff_id: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListClientsInput = z.input<typeof listClientsSchema>;
export type CreateClientInput = z.input<typeof createClientSchema>;
export type UpdateClientInput = z.input<typeof updateClientSchema>;

export type ClientListItem = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_email: string | null;
  company_hourly_rate: number | null;
  company_bonus_commission: number | null;
  company_approved_to_hire: boolean;
  company_status_override: boolean;
  company_created_at: Date;
  company_updated_at: Date;
  country_id: number | null;
  currency_code: string | null;
  staff_id: number | null;
  parent_company_id: number | null;
  deleted: number;
};

export type ClientDetail = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_description_en: string | null;
  company_description_ar: string | null;
  company_website: string | null;
  company_email: string | null;
  company_logo: string | null;
  commercial_licence: string | null;
  company_hourly_rate: number | null;
  company_bonus_commission: number | null;
  company_approved_to_hire: boolean;
  company_status_override: boolean;
  company_followup: boolean;
  company_followup_interval_weeks: number | null;
  company_created_at: Date;
  company_updated_at: Date;
  last_request_datetime: Date | null;
  last_payment_datetime: Date | null;
  country_id: number | null;
  currency_code: string | null;
  staff_id: number | null;
  parent_company_id: number | null;
  total_candidate: bigint | null;
  no_of_active_requests: number | null;
  deleted: number;
};

export type ListClientsResult = {
  clients: ClientListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Filter builder
// ---------------------------------------------------------------------------

type ClientWhereInput = {
  deleted: number;
  company_name?: { contains: string; mode?: "insensitive" };
  staff_id?: number;
  company_approved_to_hire?: boolean;
  parent_company_id?: null;
};

function buildClientFilter(params: {
  name?: string;
  staff_id?: number;
  approved_to_hire?: 0 | 1;
}): ClientWhereInput {
  const where: ClientWhereInput = { deleted: 0, parent_company_id: null };

  if (params.name && params.name.trim()) {
    where.company_name = { contains: params.name, mode: "insensitive" };
  }

  if (params.staff_id !== undefined) {
    where.staff_id = params.staff_id;
  }

  if (params.approved_to_hire !== undefined) {
    where.company_approved_to_hire = params.approved_to_hire === 1;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List clients (parent companies) with optional filters and pagination.
 * Excludes soft-deleted clients and non-parent companies.
 */
export async function listClients(
  params: ListClientsInput = {},
): Promise<ListClientsResult> {
  await requireCapability("client.read");

  const parsed = listClientsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { name, staff_id, approved_to_hire, page = 1, limit = 20 } = parsed.data;
  const where = buildClientFilter({ name, staff_id, approved_to_hire });

  const [clients, total] = await Promise.all([
    prisma.company.findMany({
      where: where as any,
      orderBy: { company_created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where: where as any }),
  ]);

  return {
    clients: clients as ClientListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single client by ID, including extended detail fields.
 * Returns null if not found or soft-deleted.
 */
export async function getClient(
  id: number,
): Promise<ClientDetail | null> {
  await requireCapability("client.read");

  const parsed = getClientSchema.safeParse({ id });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid client ID");
  }

  const client = await prisma.company.findFirst({
    where: {
      company_id: parsed.data.id,
      deleted: 0,
    },
  });

  return client as ClientDetail | null;
}

/**
 * Create a new client (company) account.
 */
export async function createClient(
  data: CreateClientInput,
): Promise<{ company_id: number }> {
  await requireCapability("client.write");

  const parsed = createClientSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid client data");
  }

  const client = await prisma.company.create({
    data: {
      company_name: parsed.data.name,
      company_common_name_en: parsed.data.common_name_en ?? null,
      company_common_name_ar: parsed.data.common_name_ar ?? null,
      company_description_en: parsed.data.description_en ?? null,
      company_description_ar: parsed.data.description_ar ?? null,
      company_website: parsed.data.website ?? null,
      company_email: parsed.data.email ?? null,
      company_hourly_rate: parsed.data.hourly_rate ?? null,
      company_bonus_commission: parsed.data.bonus_commission ?? null,
      company_approved_to_hire:
        parsed.data.approved_to_hire !== undefined
          ? parsed.data.approved_to_hire === 1
          : true,
      country_id: parsed.data.country_id ?? null,
      currency_code: parsed.data.currency_code ?? "KWD",
    } as any,
  });

  revalidatePath("/clients");
  return { company_id: client.company_id };
}

/**
 * Update an existing client (company) account.
 * Only provided fields are updated — partial update semantics.
 */
export async function updateClient(
  data: UpdateClientInput,
): Promise<{ company_id: number }> {
  await requireCapability("client.write");

  const parsed = updateClientSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid client data");
  }

  const { id, ...fields } = parsed.data;

  // Build update payload with only provided fields
  const updateData: Record<string, unknown> = {};
  if (fields.name !== undefined) updateData.company_name = fields.name;
  if (fields.common_name_en !== undefined) updateData.company_common_name_en = fields.common_name_en;
  if (fields.common_name_ar !== undefined) updateData.company_common_name_ar = fields.common_name_ar;
  if (fields.description_en !== undefined) updateData.company_description_en = fields.description_en;
  if (fields.description_ar !== undefined) updateData.company_description_ar = fields.description_ar;
  if (fields.website !== undefined) updateData.company_website = fields.website;
  if (fields.email !== undefined) updateData.company_email = fields.email;
  if (fields.hourly_rate !== undefined) updateData.company_hourly_rate = fields.hourly_rate;
  if (fields.bonus_commission !== undefined) updateData.company_bonus_commission = fields.bonus_commission;
  if (fields.approved_to_hire !== undefined) updateData.company_approved_to_hire = fields.approved_to_hire === 1;
  if (fields.country_id !== undefined) updateData.country_id = fields.country_id;
  if (fields.currency_code !== undefined) updateData.currency_code = fields.currency_code;
  if (fields.staff_id !== undefined) updateData.staff_id = fields.staff_id;

  await prisma.company.update({
    where: { company_id: id },
    data: updateData as any,
  });

  revalidatePath("/clients");
  return { company_id: id };
}
