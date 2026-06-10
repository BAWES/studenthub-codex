import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  status: z
    .enum([
      "pending",
      "started",
      "delivered",
      "cancelled",
      "finished_by_recruitment",
      "re_work",
    ])
    .optional(),
  q: z.string().optional(),
});

export const getRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
});

export const updateRequestStatusSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  status: z.enum([
    "pending",
    "started",
    "delivered",
    "cancelled",
    "finished_by_recruitment",
    "re_work",
  ]),
  feedback: z.string().max(255).optional(),
});

export const approveRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export const rejectRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export const closeRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  resolution: z.string().min(1, "Resolution is required").max(500),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListRequestsInput = z.input<typeof listRequestsSchema>;
export type GetRequestInput = z.input<typeof getRequestSchema>;
export type UpdateRequestStatusInput = z.input<typeof updateRequestStatusSchema>;

export type ApproveRequestInput = z.input<typeof approveRequestSchema>;
export type RejectRequestInput = z.input<typeof rejectRequestSchema>;
export type CloseRequestInput = z.input<typeof closeRequestSchema>;

export type RequestActionResponse = {
  operation: "success" | "error";
  message: string;
};

export type RequestRow = {
  request_uuid: string;
  title: string;
  company_name: string | null;
  staff_name: string | null;
  position_type: string;
  no_of_employees: number | null;
  status: string;
  priority: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type RequestDetail = {
  request: {
    request_uuid: string;
    request_position_title: string | null;
    request_job_description: string;
    request_compensation: string;
    request_status: string | null;
    request_feedback: string | null;
    request_priority: number | null;
    request_started_at: string | null;
    request_finished_at: string | null;
    request_created_datetime: string | null;
    request_updated_datetime: string | null;
    company: { company_name: string | null; company_email: string | null } | null;
    staff: { staff_name: string | null; staff_email: string | null } | null;
  } | null;
  applications: {
    application_uuid: string;
    candidate_name: string | null;
    status: number | null;
    created_at: string | null;
  }[];
  invitations: {
    invitation_uuid: string;
    candidate_name: string | null;
    status: number | null;
    created_at: string | null;
  }[];
  interviews: {
    request_interview_uuid: string;
    candidate_name: string | null;
    interview_at: string | null;
    status: number | null;
  }[];
  metrics: { label: string; value: string | number; note: string }[];
};

export type UpdateRequestStatusResult = {
  operation: "success" | "error";
  message: string;
};
