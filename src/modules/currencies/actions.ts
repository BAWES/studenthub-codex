"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCurrenciesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  status: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCurrenciesParams = z.input<typeof listCurrenciesSchema>;

export type CurrencyListItem = {
  currency_id: number;
  title: string;
  code: string;
  currency_symbol: string | null;
  rate: number | null;
  sort_order: number | null;
  status: boolean | null;
};

export type ListCurrenciesResult = {
  currencies: CurrencyListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List currencies with pagination and optional status filter.
 * Mirrors the legacy Yii2 CurrencyController.
 */
export async function listCurrencies(
  params: ListCurrenciesParams = {},
): Promise<ListCurrenciesResult> {
  await requireCapability("candidate.read.own");

  const parsed = listCurrenciesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, status } = parsed.data;

  const where: { status?: boolean } = {};
  if (status !== undefined) {
    where.status = status;
  }

  const [currencies, total] = await Promise.all([
    prisma.currency.findMany({
      where,
      orderBy: { sort_order: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.currency.count({ where }),
  ]);

  return {
    currencies: currencies as CurrencyListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
