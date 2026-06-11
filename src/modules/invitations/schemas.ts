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
