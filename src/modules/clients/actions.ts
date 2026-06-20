"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listClientsSchema,
  getClientSchema,
  createClientSchema,
  updateClientSchema,
  listClientsResultSchema,
  getClientResultSchema,
  clientMutationResultSchema,
  type ListClientsInput,
  type CreateClientInput,
  type UpdateClientInput,
  type ClientListItem,
  type ClientDetail,
  type ListClientsResult,
} from "./schemas";

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

  const result: ListClientsResult = {
    clients: clients as ClientListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listClientsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/clients] listClients output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  const result = client as ClientDetail | null;

  // Validate output shape
  const outputParsed = getClientResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/clients] getClient output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  const result = { company_id: client.company_id };

  // Validate output shape
  const outputParsed = clientMutationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/clients] createClient output validation failed:",
      outputParsed.error.issues,
    );
  }

  revalidatePath("/clients");
  return result;
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

  const result = { company_id: id };

  // Validate output shape
  const outputParsed = clientMutationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/clients] updateClient output validation failed:",
      outputParsed.error.issues,
    );
  }

  revalidatePath("/clients");
  return result;
}
