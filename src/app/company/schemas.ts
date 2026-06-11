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

// ── CompanyHome — extended dashboard types ──────────────────────────────

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

export const getCompanyWorkspaceSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation — mirrors WorkspaceMetric / WorkspaceListItem / result types
// ---------------------------------------------------------------------------

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

export const workspaceContactSchema = z.object({
  contact_name: z.string(),
  contact_email: z.string(),
}).nullable();

export const workspaceOverviewOutputSchema = z.object({
  contact: workspaceContactSchema,
  metrics: z.array(workspaceMetricSchema),
  companies: z.array(workspaceListItemSchema),
  requests: z.array(workspaceListItemSchema),
});

export const updateWorkspaceResultSchema = z.object({
  contactUuid: z.string(),
});
