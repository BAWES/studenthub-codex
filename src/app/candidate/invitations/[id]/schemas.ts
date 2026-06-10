import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/invitations/[id] actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const getInvitationSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
});

export const respondInvitationSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
  reason: z.string().max(1000, "Reason must be 1000 characters or fewer").optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RespondInvitationInput = z.input<typeof respondInvitationSchema>;
