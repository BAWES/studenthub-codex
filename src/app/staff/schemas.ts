import { z } from "zod";

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
export const staffListItemSchema = z.object({
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
  requests: z.array(staffListItemSchema),
  stories: z.array(staffListItemSchema),
});
