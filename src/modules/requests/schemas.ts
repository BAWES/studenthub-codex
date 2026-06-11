import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/requests invitation-actions
// ---------------------------------------------------------------------------

export const getInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
});

export const getInvitationLogSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const markInvitationLogViewedSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
});

export const listInvitationsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  invitationStatus: z.coerce.number().int().optional(),
  staffId: z.coerce.number().int().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type InvitationDetail = {
  invitationUuid: string;
  candidateId: number | null;
  requestUuid: string;
  storyUuid: string | null;
  invitationStatus: number | null;
  invitationAppSeenAt: string | null;
  invitationEmailSeenAt: string | null;
  invitationSeenIn: number | null;
  invitationSeenVia: string | null;
  invitationCreatedByStaff: number | null;
  invitationUpdatedByStaff: number | null;
  invitationCreatedByCompany: number | null;
  invitationUpdatedByCompany: number | null;
  invitationCreatedAt: string | null;
  invitationUpdatedAt: string | null;
  jobInterestUuid: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  requestTitle: string | null;
  storyTitle: string | null;
};

export type InvitationLogEntry = {
  noteUuid: string;
  noteType: string | null;
  noteText: string | null;
  createdBy: number | null;
  createdAt: string;
};

export type InvitationLogResult = {
  logs: InvitationLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListInvitationsParams = z.input<typeof listInvitationsSchema>;

export type InvitationRow = {
  invitationUuid: string;
  candidateId: number | null;
  requestUuid: string;
  storyUuid: string | null;
  invitationStatus: number | null;
  invitationCreatedAt: string | null;
  candidateName: string | null;
  requestTitle: string | null;
};

export type ListInvitationsResult = {
  invitations: InvitationRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const requestListItemSchema = z.object({
  request_uuid: z.string(),
  company_id: z.number().int().nullable(),
  contact_uuid: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  request_position_type: z.number().int().nullable(),
  request_position_title: z.string().nullable(),
  request_job_description: z.string(),
  request_compensation: z.string(),
  request_number_of_employees: z.number().int().nullable(),
  no_of_employees_per_story: z.number().int(),
  request_location: z.string().nullable(),
  request_additional_info: z.string().nullable(),
  request_status: z.string().nullable(),
  request_priority: z.number().int().nullable(),
  gender: z.boolean(),
  nationality_id: z.number().int().nullable(),
  request_created_datetime: z.date(),
  request_updated_datetime: z.date(),
});

export type RequestListItemOutput = z.output<typeof requestListItemSchema>;

export const listRequestsResultSchema = z.object({
  requests: z.array(requestListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListRequestsResultOutput = z.output<typeof listRequestsResultSchema>;

export const requestUuidResultSchema = z.object({
  request_uuid: z.string(),
});

export type RequestUuidResultOutput = z.output<typeof requestUuidResultSchema>;

export const requestDetailSchema = z.object({
  request_uuid: z.string(),
  company_id: z.number().int().nullable(),
  contact_uuid: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  request_created_by: z.number().int().nullable(),
  request_updated_by: z.number().int().nullable(),
  request_position_type: z.number().int().nullable(),
  request_position_title: z.string().nullable(),
  request_job_description: z.string(),
  request_compensation: z.string(),
  request_number_of_employees: z.number().int().nullable(),
  no_of_employees_per_story: z.number().int(),
  request_location: z.string().nullable(),
  request_additional_info: z.string().nullable(),
  request_status: z.string().nullable(),
  request_feedback: z.string().nullable(),
  request_priority: z.number().int().nullable(),
  gender: z.boolean(),
  nationality_id: z.number().int().nullable(),
  our_fees: z.number().nullable(),
  our_fees_unit: z.string().nullable(),
  request_created_datetime: z.date(),
  request_updated_datetime: z.date(),
});

export type RequestDetailOutput = z.output<typeof requestDetailSchema>;
