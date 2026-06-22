import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas (moved from actions.ts)
// ---------------------------------------------------------------------------

export const listCurrenciesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  status: z.boolean().optional(),
  keyword: z.string().optional(),
});

export const getCurrencySchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single currency item returned from listCurrencies / getCurrency.
 */
export const currencyItemSchema = z.object({
  currency_id: z.number().int().positive(),
  title: z.string(),
  code: z.string(),
  currency_symbol: z.string().nullable(),
  rate: z.number().nullable(),
  sort_order: z.number().int().nullable(),
  status: z.boolean().nullable(),
});

/**
 * Schema for getCurrency result (item or null).
 */
export const currencyDetailSchema = currencyItemSchema.nullable();

/**
 * Schema for the listCurrencies response.
 */
export const listCurrenciesResultSchema = z.object({
  currencies: z.array(currencyItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types (derived from schemas where possible, explicit where needed)
// ---------------------------------------------------------------------------

export type CurrencyListItem = z.output<typeof currencyItemSchema>;
export type ListCurrenciesResult = z.output<typeof listCurrenciesResultSchema>;
export type ListCurrenciesParams = z.input<typeof listCurrenciesSchema>;
export type GetCurrencyParams = z.input<typeof getCurrencySchema>;
