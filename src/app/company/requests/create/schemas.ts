import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getCompanyListSchema = z.object({
  contactUuid: z
    .string({ required_error: "Contact UUID is required" })
    .min(1, "Contact UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCompanyListInput = z.input<typeof getCompanyListSchema>;

export type CompanyListItem = {
  id: number;
  name: string;
};
