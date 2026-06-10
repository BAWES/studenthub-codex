"use server";

// ---------------------------------------------------------------------------
// Candidate Invitation [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getInvitation          — single invitation detail (delegates to parent)
//   - acceptInvitation       — accept an invitation
//   - declineInvitation      — decline an invitation with optional reason
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateInvitationDetail as parentGetInvitationDetail,
} from "../actions";
import type {
  GetInvitationDetailResult,
} from "../schemas";
import {
  getInvitationSchema,
  acceptInvitationSchema,
  declineInvitationSchema,
} from "./schemas";
import type {
  AcceptInvitationInput,
  DeclineInvitationInput,
  InvitationActionResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// Re-export schemas types so consumers have a single import path
// ---------------------------------------------------------------------------
export type {
  GetInvitationDetailResult,
} from "../schemas";
export type {
  AcceptInvitationInput,
  DeclineInvitationInput,
  InvitationActionResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// Constants — mirror @/modules/candidates/actions
// ---------------------------------------------------------------------------

const INVITATION_STATUS_ACCEPTED = 1;
const INVITATION_STATUS_REJECTED = 2;

// ---------------------------------------------------------------------------
// getInvitation
// ---------------------------------------------------------------------------

/**
 * Get a single invitation with full detail (request, company, staff, story,
 * notes). Delegates to the parent `getCandidateInvitationDetail` action.
 */
export async function getInvitation(
  invitationUuid: string,
): Promise<GetInvitationDetailResult> {
  const parsed = getInvitationSchema.safeParse({ invitationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invitation UUID");
  }

  return parentGetInvitationDetail(parsed.data);
}

// ---------------------------------------------------------------------------
// acceptInvitation
// ---------------------------------------------------------------------------

/**
 * Accept an invitation. Updates the invitation status to accepted (1).
 * The invitation must belong to the current candidate.
 *
 * Returns `{ success: boolean, error?: string }`.
 */
export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<InvitationActionResponse> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = acceptInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { invitationUuid } = parsed.data;

  const invitation = await prisma.invitation.findFirst({
    where: { invitation_uuid: invitationUuid, candidate_id: candidateId },
    select: { invitation_uuid: true, invitation_status: true },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.invitation_status === INVITATION_STATUS_ACCEPTED) {
    return { success: false, error: "Invitation has already been accepted" };
  }

  if (invitation.invitation_status === INVITATION_STATUS_REJECTED) {
    return { success: false, error: "Invitation has already been rejected" };
  }

  await prisma.invitation.update({
    where: { invitation_uuid: invitationUuid },
    data: {
      invitation_status: INVITATION_STATUS_ACCEPTED,
      invitation_app_seen_at: new Date(),
      invitation_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/invitations");
  revalidatePath(`/candidate/invitations/${invitationUuid}`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// declineInvitation
// ---------------------------------------------------------------------------

/**
 * Decline an invitation with an optional reason. Updates the invitation
 * status to rejected (2). The invitation must belong to the current candidate.
 *
 * Returns `{ success: boolean, error?: string }`.
 */
export async function declineInvitation(
  input: DeclineInvitationInput,
): Promise<InvitationActionResponse> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = declineInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { invitationUuid } = parsed.data;

  const invitation = await prisma.invitation.findFirst({
    where: { invitation_uuid: invitationUuid, candidate_id: candidateId },
    select: { invitation_uuid: true, invitation_status: true },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.invitation_status === INVITATION_STATUS_REJECTED) {
    return { success: false, error: "Invitation has already been rejected" };
  }

  if (invitation.invitation_status === INVITATION_STATUS_ACCEPTED) {
    return { success: false, error: "Cannot decline an accepted invitation" };
  }

  await prisma.invitation.update({
    where: { invitation_uuid: invitationUuid },
    data: {
      invitation_status: INVITATION_STATUS_REJECTED,
      invitation_app_seen_at: new Date(),
      invitation_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/invitations");
  revalidatePath(`/candidate/invitations/${invitationUuid}`);

  return { success: true };
}
