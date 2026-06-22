import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schema
// ---------------------------------------------------------------------------

export const searchCompanyEntitiesSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().optional(),
  type: z.enum(["all", "companies", "stores", "contacts"]).optional(),
});

export type SearchCompanyEntitiesInput = z.input<typeof searchCompanyEntitiesSchema>;

// ---------------------------------------------------------------------------
// Result row schemas
// ---------------------------------------------------------------------------

export const companySearchRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  status: z.string(),
  type: z.enum(["company", "store", "contact"]),
  subtitle: z.string(),
  meta: z.string(),
  href: z.string(),
});

export const companySearchResultSchema = z.object({
  query: z.string(),
  page: z.number().int(),
  matchingCount: z.number().int(),
  rows: z.array(companySearchRowSchema),
  facets: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      options: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          count: z.number().int(),
          active: z.boolean(),
        }),
      ),
    }),
  ),
});

export type CompanySearchRow = z.output<typeof companySearchRowSchema>;
export type CompanySearchResult = z.output<typeof companySearchResultSchema>;
