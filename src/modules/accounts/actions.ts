"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listAccountsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
  status: z.number().int().optional(),
});

const getAccountSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAccountsParams = z.input<typeof listAccountsSchema>;
export type GetAccountParams = z.input<typeof getAccountSchema>;

export type AccountListItem = {
  admin_id: number;
  admin_name: string;
  admin_email: string;
  admin_status: number;
  admin_created_at: Date;
};

export type AccountDetail = AccountListItem & {
  admin_updated_at: Date;
  admin_limited_access: number | null;
};

export type ListAccountsResult = {
  accounts: AccountListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List accounts (admin users) with pagination and optional search/status filter.
 * Mirrors the legacy Yii2 AccountController::actionList pattern.
 */
export async function listAccounts(
  params: ListAccountsParams = {},
): Promise<ListAccountsResult> {
  await requireCapability("admin.read");

  const parsed = listAccountsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, search, status } = parsed.data;

  const where: Record<string, unknown> = {};
  if (status !== undefined) where.admin_status = status;
  if (status === undefined) where.admin_status = 10; // default: active only

  if (search) {
    where.OR = [
      { admin_name: { contains: search } },
      { admin_email: { contains: search } },
    ];
  }

  const [accounts, total] = await Promise.all([
    prisma.admin.findMany({
      where: where as any,
      orderBy: { admin_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        admin_id: true,
        admin_name: true,
        admin_email: true,
        admin_status: true,
        admin_created_at: true,
      },
    }),
    prisma.admin.count({ where: where as any }),
  ]);

  return {
    accounts: accounts as AccountListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single account by ID. Returns null if not found.
 * Mirrors the legacy Yii2 AccountController::actionGet pattern.
 */
export async function getAccount(
  params: GetAccountParams,
): Promise<AccountDetail | null> {
  await requireCapability("admin.read");

  const parsed = getAccountSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid account ID");
  }

  const { id } = parsed.data;

  const account = await prisma.admin.findFirst({
    where: { admin_id: id },
    select: {
      admin_id: true,
      admin_name: true,
      admin_email: true,
      admin_status: true,
      admin_limited_access: true,
      admin_created_at: true,
      admin_updated_at: true,
    },
  });

  return account as AccountDetail | null;
}
