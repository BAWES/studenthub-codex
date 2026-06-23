"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  currencyItemSchema,
  listCurrenciesResultSchema,
  createCurrencyResultSchema,
} from "./schemas";
import type { CurrencyItem, ListCurrenciesResult } from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCurrenciesSchema = z.object({
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCurrencySchema = z.object({
  id: z.coerce.number().int().positive("Currency ID must be a positive integer"),
});

const createCurrencySchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  code: z.string().min(1, "Code is required").max(255),
  currencySymbol: z.string().max(255).optional(),
  rate: z.coerce.number().min(0).optional(),
  decimalPlace: z.coerce.number().int().min(0).max(1).optional(),
  sortOrder: z.coerce.number().int().optional(),
  status: z.coerce.number().int().min(0).max(1).optional().default(1),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCurrenciesParams = z.input<typeof listCurrenciesSchema>;
export type GetCurrencyParams = z.input<typeof getCurrencySchema>;
export type CreateCurrencyParams = z.input<typeof createCurrencySchema>;

// ---------------------------------------------------------------------------
// listCurrencies
// ---------------------------------------------------------------------------

/**
 * List currencies with pagination and optional keyword search.
 *
 * Mirrors the legacy CurrencyController::actionList().
 * - Filters by keyword on title/code when keyword is provided
 * - Paginated with configurable page/limit
 * - Ordered by sort_order ascending
 */
export async function listCurrencies(
  params: ListCurrenciesParams = {},
): Promise<ListCurrenciesResult> {
  await requireCapability("admin.read");

  const parsed = listCurrenciesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { keyword, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { code: { contains: keyword } },
    ];
  }

  const [currencies, total] = await Promise.all([
    prisma.currency.findMany({
      where: where as any,
      orderBy: { sort_order: "asc" },
      skip,
      take: limit,
      select: {
        currency_id: true,
        title: true,
        code: true,
        currency_symbol: true,
        rate: true,
        decimal_place: true,
        sort_order: true,
        status: true,
        datetime: true,
      },
    }),
    prisma.currency.count({ where: where as any }),
  ]);

  const result: ListCurrenciesResult = {
    currencies: currencies as CurrencyItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listCurrenciesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/currency] listCurrencies output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCurrency
// ---------------------------------------------------------------------------

/**
 * Get a single currency by its ID.
 *
 * Mirrors the legacy CurrencyController::actionView($id).
 * Throws if not found.
 */
export async function getCurrency(
  params: GetCurrencyParams,
): Promise<CurrencyItem> {
  await requireCapability("admin.read");

  const parsed = getCurrencySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid currency ID");
  }

  const { id } = parsed.data;

  const currency = await prisma.currency.findUnique({
    where: { currency_id: id },
    select: {
      currency_id: true,
      title: true,
      code: true,
      currency_symbol: true,
      rate: true,
      decimal_place: true,
      sort_order: true,
      status: true,
      datetime: true,
    },
  });

  if (!currency) {
    throw new Error(`Currency with ID ${id} not found`);
  }

  const result: CurrencyItem = currency as CurrencyItem;

  // Validate output shape
  const outputParsed = currencyItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/currency] getCurrency output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createCurrency
// ---------------------------------------------------------------------------

/**
 * Create a new currency entry.
 *
 * Mirrors the legacy CurrencyController::actionCreate().
 * Maps field names from camelCase Yii2 convention to Prisma snake_case.
 */
export async function createCurrency(
  data: CreateCurrencyParams,
): Promise<{ currency_id: number }> {
  await requireCapability("admin.write");

  const parsed = createCurrencySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid currency data");
  }

  const { title, code, currencySymbol, rate, decimalPlace, sortOrder, status } =
    parsed.data;

  const currency = await prisma.currency.create({
    data: {
      title,
      code,
      currency_symbol: currencySymbol ?? null,
      rate: rate ?? null,
      decimal_place: decimalPlace != null ? Boolean(decimalPlace) : null,
      sort_order: sortOrder ?? null,
      status: Boolean(status),
      datetime: new Date(),
    },
    select: {
      currency_id: true,
    },
  });

  const result = { currency_id: currency.currency_id };

  // Validate output shape
  const outputParsed = createCurrencyResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/currency] createCurrency output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
