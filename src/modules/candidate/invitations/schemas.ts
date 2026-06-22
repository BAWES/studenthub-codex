import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listInvitationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getInvitationDetailSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListInvitationsParams = z.input<typeof listInvitationsSchema>;
export type GetInvitationDetailParams = z.input<typeof getInvitationDetailSchema>;

export type InvitationRow = {
  invitation_uuid: string;
  invitation_status: number | null;
  invitation_app_seen_at: Date | null;
  invitation_email_seen_at: Date | null;
  invitation_created_at: Date | null;
  position_title: string | null;
  compensation: string | null;
  company_name: string | null;
};

export type ListInvitationsResult = {
  items: InvitationRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetInvitationDetailResult = {
  invitation: {
    invitation_uuid: string;
    invitation_status: number | null;
    invitation_app_seen_at: Date | null;
    invitation_email_seen_at: Date | null;
    invitation_seen_via: string | null;
    invitation_created_at: Date | null;
    invitation_updated_at: Date | null;
    request: {
      request_uuid: string;
      request_position_title: string | null;
      request_job_description: string | null;
      request_compensation: string | null;
      request_location: string | null;
      request_number_of_employees: number | null;
      request_status: string | null;
      company_name: string | null;
      company_email: string | null;
      staff_name: string | null;
      staff_email: string | null;
    };
    story_uuid: string | null;
    story_status: number | null;
    story_last_updated_at: Date | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
  notes: { id: string; title: string; subtitle: string; meta: string }[];
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const invitationRowOutputSchema = z.object({
  invitation_uuid: z.string(),
  invitation_status: z.number().int().nullable(),
  invitation_app_seen_at: z.date().nullable(),
  invitation_email_seen_at: z.date().nullable(),
  invitation_created_at: z.date().nullable(),
  position_title: z.string().nullable(),
  compensation: z.string().nullable(),
  company_name: z.string().nullable(),
});

export const listInvitationsResultOutputSchema = z.object({
  items: z.array(invitationRowOutputSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

const invitationDetailRequestSchema = z.object({
  request_uuid: z.string(),
  request_position_title: z.string().nullable(),
  request_job_description: z.string().nullable(),
  request_compensation: z.string().nullable(),
  request_location: z.string().nullable(),
  request_number_of_employees: z.number().int().nullable(),
  request_status: z.string().nullable(),
  company_name: z.string().nullable(),
  company_email: z.string().nullable(),
  staff_name: z.string().nullable(),
  staff_email: z.string().nullable(),
});

const invitationDetailInvitationSchema = z.object({
  invitation_uuid: z.string(),
  invitation_status: z.number().int().nullable(),
  invitation_app_seen_at: z.date().nullable(),
  invitation_email_seen_at: z.date().nullable(),
  invitation_seen_via: z.string().nullable(),
  invitation_created_at: z.date().nullable(),
  invitation_updated_at: z.date().nullable(),
  request: invitationDetailRequestSchema,
  story_uuid: z.string().nullable(),
  story_status: z.number().int().nullable(),
  story_last_updated_at: z.date().nullable(),
}).nullable();

export const getInvitationDetailResultOutputSchema = z.object({
  invitation: invitationDetailInvitationSchema,
  metrics: z.array(z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    note: z.string(),
  })),
  notes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string(),
    meta: z.string(),
  })),
});

// ---------------------------------------------------------------------------
// Types — z.output aliases (for consistency with module-level pattern)
// ---------------------------------------------------------------------------

export type InvitationRowOutput = z.output<typeof invitationRowOutputSchema>;
export type ListInvitationsResultOutput = z.output<typeof listInvitationsResultOutputSchema>;
export type GetInvitationDetailResultOutput = z.output<typeof getInvitationDetailResultOutputSchema>;
