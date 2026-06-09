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
  keyword: z.string().optional(),
});

const getCurrencySchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCurrenciesParams = z.input<typeof listCurrenciesSchema>;

export type GetCurrencyParams = z.input<typeof getCurrencySchema>;

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

  const { page = 1, limit = 20, status, keyword } = parsed.data;

  const where: Record<string, unknown> = {};
  if (status !== undefined) {
    where.status = status;
  }
  if (keyword && keyword.trim()) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { code: { contains: keyword, mode: "insensitive" } },
    ];
  }

  const [currencies, total] = await Promise.all([
    prisma.currency.findMany({
      where: where as any,
      orderBy: { sort_order: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.currency.count({ where: where as any }),
  ]);

  return {
    currencies: currencies as CurrencyListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single currency by ID.
 * Mirrors the legacy Yii2 CurrencyController::actionView().
 */
export async function getCurrency(
  params: GetCurrencyParams,
): Promise<CurrencyListItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getCurrencySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { id } = parsed.data;

  const currency = await prisma.currency.findUnique({
    where: { currency_id: id },
  });

  return currency as CurrencyListItem | null;
}
