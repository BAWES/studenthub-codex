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
