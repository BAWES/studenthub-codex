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
