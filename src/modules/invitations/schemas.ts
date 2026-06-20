import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for the nested company object within an invitation.
 */
export const invitationCompanySchema = z
  .object({
    company_name: z.string().nullable(),
  })
  .nullable();

/**
 * Schema for the nested request object within an invitation.
 */
export const invitationRequestSchema = z
  .object({
    request_uuid: z.string(),
    request_position_title: z.string().nullable(),
    company: invitationCompanySchema,
  })
  .nullable();

/**
 * Schema for InvitationListItem returned from listInvitations.
 */
export const invitationListItemSchema = z.object({
  invitation_uuid: z.string(),
  invitation_status: z.number().int().nullable(),
  invitation_created_at: z.date().nullable(),
  invitation_app_seen_at: z.date().nullable(),
  invitation_email_seen_at: z.date().nullable(),
  request: invitationRequestSchema,
});

// ---------------------------------------------------------------------------
// Invitation detail schemas
// ---------------------------------------------------------------------------

export const invitationDetailRequestSchema = z
  .object({
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

export const invitationDetailNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string(),
});

export const invitationDetailMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

export const invitationDetailSchema = z.object({
  invitation: z
    .object({
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
    })
    .nullable(),
  metrics: z.array(invitationDetailMetricSchema),
  notes: z.array(invitationDetailNoteSchema),
});

export type GetInvitationDetailResult = z.output<typeof invitationDetailSchema>;

/**
 * Schema for the invitation action result (accept/reject).
 */
export const invitationActionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * Schema for the listInvitations return type: an array of items or a count.
 */
export const listInvitationsResultSchema = z.union([
  z.array(invitationListItemSchema),
  z.number().int().nonnegative(),
]);

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type InvitationListItem = z.output<typeof invitationListItemSchema>;
export type InvitationActionResult = z.output<typeof invitationActionResultSchema>;
