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
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single request row in a list.
 */
const requestRowSchema = z.object({
  request_uuid: z.string(),
  title: z.string(),
  company_name: z.string().nullable(),
  staff_name: z.string().nullable(),
  position_type: z.string(),
  no_of_employees: z.number().int().nullable(),
  status: z.string(),
  priority: z.number().int().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for listRequests response.
 */
export const listRequestsOutputSchema = z.object({
  items: z.array(requestRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

const requestCompanySchema = z
  .object({
    company_name: z.string().nullable(),
    company_email: z.string().nullable(),
  })
  .nullable();

const requestStaffSchema = z
  .object({
    staff_name: z.string().nullable(),
    staff_email: z.string().nullable(),
  })
  .nullable();

const requestDetailRequestSchema = z
  .object({
    request_uuid: z.string(),
    request_position_title: z.string().nullable(),
    request_job_description: z.string(),
    request_compensation: z.string(),
    request_status: z.string().nullable(),
    request_feedback: z.string().nullable(),
    request_priority: z.number().int().nullable(),
    request_started_at: z.string().nullable(),
    request_finished_at: z.string().nullable(),
    request_created_datetime: z.string().nullable(),
    request_updated_datetime: z.string().nullable(),
    company: requestCompanySchema,
    staff: requestStaffSchema,
  })
  .nullable();

const getRequestApplicationSchema = z.object({
  application_uuid: z.string(),
  candidate_name: z.string().nullable(),
  status: z.number().int().nullable(),
  created_at: z.string().nullable(),
});

const getRequestInvitationSchema = z.object({
  invitation_uuid: z.string(),
  candidate_name: z.string().nullable(),
  status: z.number().int().nullable(),
  created_at: z.string().nullable(),
});

const getRequestInterviewSchema = z.object({
  request_interview_uuid: z.string(),
  candidate_name: z.string().nullable(),
  interview_at: z.string().nullable(),
  status: z.number().int().nullable(),
});

const getRequestMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

/**
 * Schema for getRequest response — full detail with applications etc.
 */
export const getRequestOutputSchema = z.object({
  request: requestDetailRequestSchema,
  applications: z.array(getRequestApplicationSchema),
  invitations: z.array(getRequestInvitationSchema),
  interviews: z.array(getRequestInterviewSchema),
  metrics: z.array(getRequestMetricSchema),
});

/**
 * Schema for updateRequestStatus response.
 */
export const updateRequestStatusOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

/**
 * Schema for approveRequest response.
 */
export const approveRequestOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

/**
 * Schema for rejectRequest response.
 */
export const rejectRequestOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

/**
 * Schema for closeRequest response.
 */
export const closeRequestOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

const requestRowSchema = z.object({
  request_uuid: z.string().min(1),
  title: z.string().min(1),
  company_name: z.string().nullable(),
  staff_name: z.string().nullable(),
  position_type: z.string().min(1),
  no_of_employees: z.number().int().nullable(),
  status: z.string().min(1),
  priority: z.number().int().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const listRequestsOutputSchema = z.object({
  items: z.array(requestRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListRequestsOutput = z.infer<typeof listRequestsOutputSchema>;

const requestMetricSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  note: z.string().min(1),
});

const applicationSchema = z.object({
  application_uuid: z.string().min(1),
  candidate_name: z.string().nullable(),
  status: z.number().int().nullable(),
  created_at: z.string().nullable(),
});

const invitationSchema = z.object({
  invitation_uuid: z.string().min(1),
  candidate_name: z.string().nullable(),
  status: z.number().int().nullable(),
  created_at: z.string().nullable(),
});

const interviewSchema = z.object({
  request_interview_uuid: z.string().min(1),
  candidate_name: z.string().nullable(),
  interview_at: z.string().nullable(),
  status: z.number().int().nullable(),
});

const requestCompanySchema = z.object({
  company_name: z.string().nullable(),
  company_email: z.string().nullable(),
});

const requestStaffSchema = z.object({
  staff_name: z.string().nullable(),
  staff_email: z.string().nullable(),
});

const entitySchema = z.object({
  request_uuid: z.string().min(1),
  request_position_title: z.string().nullable(),
  request_job_description: z.string().min(1),
  request_compensation: z.string().min(1),
  request_status: z.string().nullable(),
  request_feedback: z.string().nullable(),
  request_priority: z.number().int().nullable(),
  request_started_at: z.string().nullable(),
  request_finished_at: z.string().nullable(),
  request_created_datetime: z.string().nullable(),
  request_updated_datetime: z.string().nullable(),
  company: requestCompanySchema.nullable(),
  staff: requestStaffSchema.nullable(),
});

export const getRequestOutputSchema = z.object({
  request: entitySchema.nullable(),
  applications: z.array(applicationSchema),
  invitations: z.array(invitationSchema),
  interviews: z.array(interviewSchema),
  metrics: z.array(requestMetricSchema),
});

export type GetRequestOutput = z.infer<typeof getRequestOutputSchema>;

const requestActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().min(1),
});

export const updateRequestStatusOutputSchema = requestActionResponseSchema;

export type UpdateRequestStatusOutput = z.infer<typeof updateRequestStatusOutputSchema>;

export const approveRequestOutputSchema = requestActionResponseSchema;

export type ApproveRequestOutput = z.infer<typeof approveRequestOutputSchema>;

export const rejectRequestOutputSchema = requestActionResponseSchema;

export type RejectRequestOutput = z.infer<typeof rejectRequestOutputSchema>;

export const closeRequestOutputSchema = requestActionResponseSchema;

export type CloseRequestOutput = z.infer<typeof closeRequestOutputSchema>;

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
