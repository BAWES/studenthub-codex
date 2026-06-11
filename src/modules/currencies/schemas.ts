import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
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
// Output schemas
// ---------------------------------------------------------------------------

export const currencyListItemSchema = z.object({
  currency_id: z.number(),
  title: z.string(),
  code: z.string(),
  currency_symbol: z.string().nullable(),
  rate: z.number().nullable(),
  sort_order: z.number().nullable(),
  status: z.boolean().nullable(),
});

export const listCurrenciesOutputSchema = z.object({
  currencies: z.array(currencyListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const getCurrencyOutputSchema = currencyListItemSchema.nullable();

// ---------------------------------------------------------------------------
// Inferred types (used in function signatures)
// ---------------------------------------------------------------------------

export type ListCurrenciesParams = z.input<typeof listCurrenciesSchema>;

export type GetCurrencyParams = z.input<typeof getCurrencySchema>;

export type CurrencyListItem = z.output<typeof currencyListItemSchema>;

export type ListCurrenciesResult = z.output<typeof listCurrenciesOutputSchema>;
