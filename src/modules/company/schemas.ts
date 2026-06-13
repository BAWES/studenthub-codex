import { z } from "zod";

// ---------------------------------------------------------------------------
// Workspace/dashboard types (migrated from app-level company/schemas.ts)
// ---------------------------------------------------------------------------

export type StaffMetric = {
  label: string;
  value: number;
  note: string;
};

export type StaffListItem = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
};

export type StaffWorkspaceData = {
  staff: {
    staff_name: string;
    staff_email: string;
    staff_job_title: string | null;
    staff_salary: number | null;
    staff_salary_currency: string | null;
  } | null;
  metrics: StaffMetric[];
  requests: StaffListItem[];
  stories: StaffListItem[];
};

export type CompanyMetric = {
  label: string;
  value: number;
  note: string;
};

/** Workspace list item type (used by CompanyWorkspaceData for companies & requests). */
export type WorkspaceListItem = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
};

export type CompanyWorkspaceData = {
  contact: {
    contact_name: string;
    contact_email: string;
  } | null;
  metrics: CompanyMetric[];
  companies: WorkspaceListItem[];
  requests: WorkspaceListItem[];
};

export type HomeActivityItem = {
  id: string;
  type: "request_created" | "request_updated" | "note_added" | "application_received";
  detail: string;
  timestamp: Date;
  relatedEntityId?: string;
};

export type HomeActiveRequestItem = {
  id: string;
  title: string;
  status: string;
  candidatesCount: number;
  createdAt: Date;
};

export type CompanyHomeData = CompanyWorkspaceData & {
  /** Active (non-terminal) request count */
  activeRequestCount: number;
  /** Pending (submitted, not started) request count */
  pendingRequestCount: number;
  /** Total open positions across all active requests */
  openPositionsCount: number;
  /** Active requests with candidate counts */
  activeRequests: HomeActiveRequestItem[];
  /** Recent activity across linked companies (last 30 actions) */
  recentActivity: HomeActivityItem[];
};

// ---------------------------------------------------------------------------
// Workspace/dashboard schemas (migrated from app-level)
// ---------------------------------------------------------------------------

export const getCompanyWorkspaceSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

export const workspaceMetricSchema = z.object({
  label: z.string(),
  value: z.number().int().nonnegative(),
  note: z.string(),
});

export const workspaceListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string().optional(),
});

export const workspaceContactSchema = z
  .object({
    contact_name: z.string(),
    contact_email: z.string(),
  })
  .nullable();

export const workspaceOverviewOutputSchema = z.object({
  contact: workspaceContactSchema,
  metrics: z.array(workspaceMetricSchema),
  companies: z.array(workspaceListItemSchema),
  requests: z.array(workspaceListItemSchema),
});

export const updateWorkspaceResultSchema = z.object({
  contactUuid: z.string(),
});

// ---------------------------------------------------------------------------
// Output validation — staff workspace
// ---------------------------------------------------------------------------

export const staffWorkspaceStaffSchema = z
  .object({
    staff_name: z.string(),
    staff_email: z.string(),
    staff_job_title: z.string().nullable(),
    staff_salary: z.number().nullable(),
    staff_salary_currency: z.string().nullable(),
  })
  .nullable();

export const staffListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string().optional(),
  href: z.string().optional(),
});

export const staffWorkspaceOutputSchema = z.object({
  staff: staffWorkspaceStaffSchema,
  metrics: z.array(workspaceMetricSchema),
  requests: z.array(staffListItemSchema),
  stories: z.array(staffListItemSchema),
});

// ---------------------------------------------------------------------------
// Output validation — company home
// ---------------------------------------------------------------------------

export const homeActivityItemSchema = z.object({
  id: z.string(),
  type: z.enum(["request_created", "request_updated", "note_added", "application_received"]),
  detail: z.string(),
  timestamp: z.date(),
  relatedEntityId: z.string().optional(),
});

export const homeActiveRequestItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  candidatesCount: z.number(),
  createdAt: z.date(),
});

export const companyHomeOutputSchema = workspaceOverviewOutputSchema.extend({
  activeRequestCount: z.number().int().nonnegative(),
  pendingRequestCount: z.number().int().nonnegative(),
  openPositionsCount: z.number().int().nonnegative(),
  activeRequests: z.array(homeActiveRequestItemSchema),
  recentActivity: z.array(homeActivityItemSchema),
});

// ---------------------------------------------------------------------------
// Existence check and action result schemas
// Used by company/requests/[id] which imports from ../schemas
// ---------------------------------------------------------------------------

export const entityExistenceSchema = z
  .object({ request_uuid: z.string().min(1) })
  .nullable();

export const actionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const requestStatusUpdateResultSchema = z.union([
  z.object({ success: z.literal(true) }),
  z.object({ error: z.string() }),
]);

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCompaniesSchema = z.object({
  nameFilter: z.string().optional(),
  status: z
    .union([z.literal("active"), z.literal("inactive"), z.literal("")])
    .optional(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

export const getCompanySchema = z.object({
  companyId: z.number().int().positive("Company ID is required"),
});

export type ListCompaniesParams = z.input<typeof listCompaniesSchema>;
export type GetCompanyParams = z.input<typeof getCompanySchema>;

// ---------------------------------------------------------------------------
// Output validation schemas (used by actions-list.ts)
// ---------------------------------------------------------------------------

/**
 * Schema for a single company item in the list response (actions-list.ts).
 */
export const companyListItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_email: z.string().nullable(),
  company_website: z.string().nullable(),
  company_logo: z.string().nullable(),
  commission: z.number().nullable(),
  total_candidate: z.number().nullable(),
  no_of_active_requests: z.number().nullable(),
  followup: z.boolean().nullable(),
  currency_code: z.string().nullable(),
  // Present only in getCompany detail response
  company_description_en: z.string().nullable().optional(),
  company_description_ar: z.string().nullable().optional(),
  commercial_licence: z.string().nullable().optional(),
  company_hourly_rate: z.number().nullable().optional(),
  company_bonus_commission: z.number().nullable().optional(),
  parent_company_id: z.number().nullable().optional(),
  staff_id: z.number().nullable().optional(),
});

/**
 * Schema for the listCompanies response (actions-list.ts).
 */
export const listCompaniesResultSchema = z.object({
  items: z.array(companyListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});

/**
 * Schema for the getCompany response (single item or null).
 */
export const companyDetailResultSchema = companyListItemSchema.nullable();

// ---------------------------------------------------------------------------
// Output validation schemas (used by actions.ts — admin-level)
// ---------------------------------------------------------------------------

/**
 * Schema for a single company item returned by admin listCompanies / getCompany.
 */
export const adminCompanyItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_email: z.string().nullable(),
  company_website: z.string().nullable(),
  company_logo: z.string().nullable(),
  commercial_licence: z.string().nullable(),
  company_hourly_rate: z.number().nullable(),
  company_bonus_commission: z.number().nullable(),
  company_approved_to_hire: z.boolean(),
  company_status_override: z.boolean(),
  company_followup: z.boolean().nullable(),
  total_candidate: z.union([z.number().int(), z.bigint()]).nullable(),
  no_of_active_requests: z.number().nullable(),
  country_id: z.number().nullable(),
  currency_code: z.string().nullable(),
  parent_company_id: z.number().nullable(),
  staff_id: z.number().nullable(),
  company_created_at: z.coerce.date(),
  company_updated_at: z.coerce.date(),
});

/**
 * Schema for the admin listCompanies response.
 */
export const adminListCompaniesResultSchema = z.object({
  companies: z.array(adminCompanyItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for admin getCompany response (single item or null).
 */
export const adminCompanyDetailResultSchema = adminCompanyItemSchema.nullable();

/**
 * Schema for form-action results (addCompanyContact, removeCompanyContact, etc.).
 * These return { error: string }.
 */
export const companyActionResultSchema = z.object({
  error: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CompanyListItem = z.output<typeof companyListItemSchema>;
export type ListCompaniesResult = z.output<typeof listCompaniesResultSchema>;
export type CompanyDetailResult = z.output<typeof companyDetailResultSchema>;

export type AdminCompanyItem = z.output<typeof adminCompanyItemSchema>;
export type AdminListCompaniesResult = z.output<typeof adminListCompaniesResultSchema>;
export type AdminCompanyDetailResult = z.output<typeof adminCompanyDetailResultSchema>;
export type CompanyActionResult = z.output<typeof companyActionResultSchema>;

// ---------------------------------------------------------------------------
// Company Contacts — input schemas
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

export const listCompanyContactsRowsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

// ---------------------------------------------------------------------------
// Company Contacts — output validation schemas
// ---------------------------------------------------------------------------

export const companyContactListItemSchema = z.object({
  company_contact_uuid: z.string(),
  company_id: z.number().nullable(),
  contact_position: z.string().nullable(),
  allow_access: z.boolean().nullable(),
  contact_name: z.string().nullable(),
  contact_email: z.string().nullable(),
  company_name: z.string().nullable(),
});

export const listCompanyContactsResultSchema = z.object({
  contacts: z.array(companyContactListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const companyContactDetailSchema = z
  .object({
    company_contact_uuid: z.string(),
    contact_uuid: z.string().nullable(),
    company_id: z.number().nullable(),
    contact_position: z.string().nullable(),
    allow_access: z.boolean().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
    contact_name: z.string().nullable(),
    contact_email: z.string().nullable(),
    company_name: z.string().nullable(),
  })
  .nullable();

export const companyContactUuidResultSchema = z.object({
  company_contact_uuid: z.string(),
});

export const companyContactRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  position: z.string(),
  companyName: z.string(),
  allowAccess: z.boolean(),
});

// ---------------------------------------------------------------------------
// Company Contacts — types
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

export type CompanyContactRow = {
  id: string;
  name: string;
  email: string;
  position: string;
  companyName: string;
  allowAccess: boolean;
};

// ---------------------------------------------------------------------------
// Company Notes — input schemas
// ---------------------------------------------------------------------------

export const listCompanyNotesSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCompanyNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

export const createCompanyNoteSchema = z.object({
  company_id: z.number({ required_error: "Company ID is required" }).int().positive(),
  note_text: z.string({ required_error: "Note text is required" }).min(1).max(10000),
  note_type: z.string().max(100).optional(),
  created_by: z.number().int().positive().optional(),
});

export const updateCompanyNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
  note_text: z.string().min(1).max(10000).optional(),
  note_type: z.string().max(100).optional(),
  updated_by: z.number().int().positive().optional(),
});

export const deleteCompanyNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

// ---------------------------------------------------------------------------
// Company Notes — [id] sub-page input schemas
// ---------------------------------------------------------------------------

export const getNoteEntrySchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

export const deleteNoteEntrySchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

export const updateNoteEntrySchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.number().int().positive("Company ID is required"),
});

// ---------------------------------------------------------------------------
// Company Notes — types
// ---------------------------------------------------------------------------

export type ListCompanyNotesInput = z.input<typeof listCompanyNotesSchema>;
export type CreateCompanyNoteInput = z.input<typeof createCompanyNoteSchema>;
export type UpdateCompanyNoteInput = z.input<typeof updateCompanyNoteSchema>;

export type CompanyNoteListItem = {
  note_uuid: string;
  note_text: string | null;
  note_type: string | null;
  company_id: number | null;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  company_name: string | null;
};

export type CompanyNoteDetail = {
  note_uuid: string;
  company_id: number | null;
  note_text: string | null;
  note_type: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  company_name: string | null;
};

export type ListCompanyNotesResult = {
  notes: CompanyNoteListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetNoteEntryInput = z.input<typeof getNoteEntrySchema>;
export type UpdateNoteEntryInput = z.input<typeof updateNoteEntrySchema>;
export type DeleteNoteEntryInput = z.input<typeof deleteNoteEntrySchema>;

export type NoteEntryResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

// ---------------------------------------------------------------------------
// Company Stores — input schemas
// ---------------------------------------------------------------------------

export const listStoresSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  company_id: z.number().int().positive().optional(),
  store_status: z.number().int().optional(),
});

export const getStoreSchema = z.object({
  store_id: z.number().int().positive("Store ID must be a positive integer"),
});

export const listStoresRowsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

export const listMallsAndBrandsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

export const listCompanySelectOptionsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

// ---------------------------------------------------------------------------
// Company Stores — types
// ---------------------------------------------------------------------------

export type ListStoresInput = z.input<typeof listStoresSchema>;

export type StoreListItem = {
  store_id: number;
  store_name: string;
  store_location: string;
  mall_name: string | null;
  brand_name: string | null;
  manager_name: string | null;
  store_status: "active" | "inactive";
};

export type StoreDetail = {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: "active" | "inactive";
  company_id: number | null;
  company_name: string | null;
  mall_name: string | null;
  brand_name: string | null;
  manager_name: string | null;
  manager_email: string | null;
  created_at: string;
  updated_at: string;
};

export type ListStoresResult = {
  stores: StoreListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StoreRow = {
  id: number;
  name: string;
  location: string;
  mallName: string;
  brandName: string;
  companyName: string;
  managerName: string;
};

export type MallsAndBrandsResult = {
  malls: { uuid: string; name: string }[];
  brands: { uuid: string; name: string }[];
};

export type CompanySelectOption = {
  id: number;
  name: string;
};
