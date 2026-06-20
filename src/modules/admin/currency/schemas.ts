import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single currency item.
 */
export const currencyItemSchema = z.object({
  currency_id: z.number().int().positive(),
  title: z.string(),
  code: z.string(),
  currency_symbol: z.string().nullable(),
  rate: z.number().nullable(),
  decimal_place: z.boolean().nullable(),
  sort_order: z.number().int().nullable(),
  status: z.boolean().nullable(),
  datetime: z.date().nullable(),
});

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

/**
 * Schema for the createCurrency response.
 */
export const createCurrencyResultSchema = z.object({
  currency_id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type CurrencyItem = z.output<typeof currencyItemSchema>;
export type ListCurrenciesResult = z.output<typeof listCurrenciesResultSchema>;
export type CreateCurrencyResult = z.output<typeof createCurrencyResultSchema>;
