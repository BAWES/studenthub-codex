import { z } from "zod";

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
