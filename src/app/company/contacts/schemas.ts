import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCompanyContactsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCompanyContactSchema = z.object({
  uuid: z.string().min(1, "Company contact UUID is required"),
});

export const createCompanyContactSchema = z.object({
  company_id: z.number({ required_error: "Company ID is required" }).int().positive(),
  contact_name: z
    .string({ required_error: "Contact name is required" })
    .min(1, "Contact name is required")
    .max(255),
  contact_email: z.string().email("Invalid email").max(255).optional(),
  contact_position: z.string().max(100).optional(),
  allow_access: z.boolean().optional().default(false),
});

export const updateCompanyContactSchema = z.object({
  uuid: z.string().min(1, "Company contact UUID is required"),
  contact_position: z.string().max(100).optional(),
  allow_access: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompanyContactsInput = z.input<typeof listCompanyContactsSchema>;
export type CreateCompanyContactInput = z.input<typeof createCompanyContactSchema>;
export type UpdateCompanyContactInput = z.input<typeof updateCompanyContactSchema>;

export type CompanyContactListItem = {
  company_contact_uuid: string;
  company_id: number | null;
  contact_position: string | null;
  allow_access: boolean | null;
  contact_name: string | null;
  contact_email: string | null;
  company_name: string | null;
};

export type CompanyContactDetail = {
  company_contact_uuid: string;
  contact_uuid: string | null;
  company_id: number | null;
  contact_position: string | null;
  allow_access: boolean | null;
  created_at: Date;
  updated_at: Date;
  contact_name: string | null;
  contact_email: string | null;
  company_name: string | null;
};

export type ListCompanyContactsResult = {
  contacts: CompanyContactListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// DataTable row types (colocated replacement for @/modules/company/data)
// ---------------------------------------------------------------------------

export const listCompanyContactsRowsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

/**
 * A flat display row for the DataTable in company/contacts/page.tsx.
 * Mirrors the return shape of getCompanyContactsRows from @/modules/company/data.
 */
export type CompanyContactRow = {
  id: string;
  name: string;
  email: string;
  position: string;
  companyName: string;
  allowAccess: boolean;
};
