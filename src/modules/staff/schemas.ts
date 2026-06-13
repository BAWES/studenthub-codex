import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffListItemSchema = z.object({
  staff_id: z.number().int().positive(),
  staff_name: z.string(),
  staff_job_title: z.string().nullable(),
  staff_email: z.string(),
  staff_role: z.boolean().nullable(),
  staff_status: z.number().int(),
  staff_created_at: z.date(),
});

export type StaffListItem = z.output<typeof staffListItemSchema>;

export const listStaffResultSchema = z.object({
  staff: z.array(staffListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type StaffListResult = z.output<typeof listStaffResultSchema>;

/** Alias expected by tests — same schema as listStaffResultSchema */
export const staffListResultSchema = listStaffResultSchema;

/** Nullable staff item result for getStaff (returns null when not found) */
export const staffGetResultSchema = staffListItemSchema.nullable();

export type StaffGetResult = z.output<typeof staffGetResultSchema>;

// ---------------------------------------------------------------------------
// Staff workspace — Zod schemas
// ---------------------------------------------------------------------------

/**
 * Schema for getStaffWorkspace action.
 * Validates the staffId parameter — must be a positive integer.
 */
export const getStaffWorkspaceSchema = z.object({
  staffId: z
    .number({ invalid_type_error: "staffId must be a number" })
    .int("staffId must be an integer")
    .positive("staffId must be positive"),
});

// ---------------------------------------------------------------------------
// Staff workspace — type definitions
// Mirrors the return shape of getStaffWorkspace from @/modules/workspace/data
// ---------------------------------------------------------------------------

export type StaffMetric = {
  label: string;
  value: number;
  note: string;
};

export type StaffWorkspaceListItem = {
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
  requests: StaffWorkspaceListItem[];
  stories: StaffWorkspaceListItem[];
};

// ---------------------------------------------------------------------------
// Staff workspace — output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single staff metric row.
 */
export const staffMetricSchema = z.object({
  label: z.string().min(1),
  value: z.number().int().nonnegative(),
  note: z.string(),
});

/**
 * Validates a single list item (requests / stories).
 */
export const staffWorkspaceListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().min(1),
  subtitle: z.string(),
  meta: z.string().optional(),
  href: z.string().optional(),
});

/**
 * Validates the staff object inside the workspace response.
 */
export const staffObjectOutputSchema = z.object({
  staff_name: z.string(),
  staff_email: z.string(),
  staff_job_title: z.string().nullable(),
  staff_salary: z.number().nullable(),
  staff_salary_currency: z.string().nullable(),
});

/**
 * Validates the full getStaffWorkspace return shape.
 */
export const staffWorkspaceOutputSchema = z.object({
  staff: staffObjectOutputSchema.nullable(),
  metrics: z.array(staffMetricSchema).length(4),
  requests: z.array(staffWorkspaceListItemSchema),
  stories: z.array(staffWorkspaceListItemSchema),
});
