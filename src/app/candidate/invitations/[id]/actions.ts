"use server";

// ---------------------------------------------------------------------------
// Candidate Invitation [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to parent/list-level actions.
//
// Actions:
//   - getInvitation          — single invitation detail (delegates to parent)
//   - acceptInvitation       — accept an invitation
//   - declineInvitation      — decline an invitation with optional reason
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import { getCandidateInvitationDetail as parentGetDetail } from "../actions";
import type { GetInvitationDetailResult } from "../schemas";
import {
  acceptInvitation as moduleAccept,
  rejectInvitation as moduleReject,
  type InvitationActionResult,
} from "@/modules/invitations/actions";
import {
  getInvitationSchema,
  respondInvitationSchema,
  type RespondInvitationInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// getInvitation
// ---------------------------------------------------------------------------

/**
 * Get a single invitation with full detail (request, company, staff, story,
 * notes, metrics). Delegates to the parent `getCandidateInvitationDetail`.
 */
export async function getInvitation(
  invitationUuid: string,
): Promise<GetInvitationDetailResult> {
  await requireCapability("candidate.read.own");

  const parsed = getInvitationSchema.safeParse({ invitationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invitation UUID");
  }

  return parentGetDetail({ invitationUuid: parsed.data.invitationUuid });
}

// ---------------------------------------------------------------------------
// acceptInvitation
// ---------------------------------------------------------------------------

/**
 * Accept an invitation. Sets status to ACCEPTED (1) and creates a note
 * recording the acceptance. Delegates to the module-level acceptInvitation.
 */
export async function acceptInvitation(
  invitationUuid: string,
): Promise<InvitationActionResult> {
  await requireCapability("candidate.read.own");

  const parsed = getInvitationSchema.safeParse({ invitationUuid });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid invitation UUID" };
  }

  return moduleAccept({ invitationUuid: parsed.data.invitationUuid, action: "accept" });
}

// ---------------------------------------------------------------------------
// declineInvitation
// ---------------------------------------------------------------------------

/**
 * Decline an invitation with an optional reason. Sets status to REJECTED (2)
 * and creates a note recording the rejection.
 * Delegates to the module-level rejectInvitation.
 */
export async function declineInvitation(
  input: RespondInvitationInput,
): Promise<InvitationActionResult> {
  await requireCapability("candidate.read.own");

  const parsed = respondInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  return moduleReject({
    invitationUuid: parsed.data.invitationUuid,
    action: "reject",
    reason: parsed.data.reason,
  });
}
