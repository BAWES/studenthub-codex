"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCurrenciesSchema,
  getCurrencySchema,
  listCurrenciesResultSchema,
  currencyDetailSchema,
  type ListCurrenciesResult,
  type ListCurrenciesParams,
  type GetCurrencyParams,
  type CurrencyListItem,
} from "./schemas";

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

  const result: ListCurrenciesResult = {
    currencies: currencies as CurrencyListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listCurrenciesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/currencies] listCurrencies output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  const result = currency as CurrencyListItem | null;

  // Validate output shape
  const outputParsed = currencyDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/currencies] getCurrency output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
