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
    staff_job_title: string;
    staff_salary: number | null;
    staff_salary_currency: string;
  } | null;
  metrics: StaffMetric[];
  requests: StaffListItem[];
  stories: StaffListItem[];
};

// ---------------------------------------------------------------------------
// Company workspace — type definitions
// Mirrors the return shape of getCompanyWorkspace from @/modules/workspace/data
// ---------------------------------------------------------------------------

export type CompanyMetric = {
  label: string;
  value: number;
  note: string;
};

export type CompanyListItem = {
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
  companies: CompanyListItem[];
  requests: CompanyListItem[];
};

export const getCompanyWorkspaceSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});
