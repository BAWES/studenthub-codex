import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getInvitationSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
});

export const acceptInvitationSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
});

export const declineInvitationSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
  reason: z.string().max(500).optional().default(""),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AcceptInvitationInput = z.input<typeof acceptInvitationSchema>;
export type DeclineInvitationInput = z.input<typeof declineInvitationSchema>;

export type InvitationActionResponse = {
  success: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const invitationExistenceSchema = z
  .object({
    invitation_uuid: z.string().min(1),
    invitation_status: z.number().int(),
  })
  .nullable();

export const invitationActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
