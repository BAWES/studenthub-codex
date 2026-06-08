"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVITATION_STATUS_INVITED = 0;
const INVITATION_STATUS_ACCEPTED = 1;
const INVITATION_STATUS_REJECTED = 2;

const NOTE_TYPE_INVITATION_ACCEPTED = "Invitation Accepted";
const NOTE_TYPE_INVITATION_REJECTED = "Invitation Rejected";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listInvitationsSchema = z.object({
  status: z.number().int().min(0).max(2).optional(),
  onlyCount: z.boolean().optional(),
});

export type ListInvitationsParams = z.input<typeof listInvitationsSchema>;

const respondInvitationSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
  action: z.enum(["accept", "reject"], {
    errorMap: () => ({ message: 'Action must be "accept" or "reject"' }),
  }),
  reason: z.string().optional(),
});

export type RespondInvitationParams = z.input<typeof respondInvitationSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InvitationListItem = {
  invitation_uuid: string;
  invitation_status: number | null;
  invitation_created_at: Date | null;
  invitation_app_seen_at: Date | null;
  invitation_email_seen_at: Date | null;
  request: {
    request_uuid: string;
    request_position_title: string | null;
    company: {
      company_name: string | null;
    } | null;
  } | null;
};

export type InvitationActionResult = {
  success: boolean;
  message: string;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List invitations for the authenticated candidate.
 * Mirrors the legacy Yii2 InvitationController::actionList().
 *
 * @param params - Optional filter: status filter or onlyCount flag
 * @returns Array of invitations or count if onlyCount is true
 */
export async function listInvitations(
  params: ListInvitationsParams = {},
): Promise<InvitationListItem[] | number> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { status, onlyCount } = listInvitationsSchema.parse(params);

  const where: Record<string, unknown> = {
    candidate_id: candidateId,
  };

  if (status !== undefined) {
    where.invitation_status = status;
  }

  if (onlyCount) {
    return prisma.invitation.count({ where });
  }

  const invitations = await prisma.invitation.findMany({
    where,
    orderBy: { invitation_created_at: "desc" },
    select: {
      invitation_uuid: true,
      invitation_status: true,
      invitation_created_at: true,
      invitation_app_seen_at: true,
      invitation_email_seen_at: true,
      request: {
        select: {
          request_uuid: true,
          request_position_title: true,
          company: {
            select: {
              company_name: true,
            },
          },
        },
      },
    },
  });

  return invitations as unknown as InvitationListItem[];
}

/**
 * Accept an invitation. Sets status to ACCEPTED (1) and creates a note
 * recording the acceptance. Mirrors legacy actionAccept().
 *
 * @param params - invitationUuid and optional reason
 * @returns Result with success flag and message
 */
export async function acceptInvitation(
  params: RespondInvitationParams,
): Promise<InvitationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { invitationUuid, reason } = respondInvitationSchema.parse({
    ...params,
    action: "accept",
  });

  const invitation = await prisma.invitation.findFirst({
    where: { invitation_uuid: invitationUuid, candidate_id: candidateId },
    include: { request: { select: { company_id: true, request_uuid: true } } },
  });

  if (!invitation) {
    return { success: false, message: "Invitation not found." };
  }

  if (invitation.invitation_status !== INVITATION_STATUS_INVITED) {
    if (invitation.invitation_status === INVITATION_STATUS_ACCEPTED) {
      return { success: false, message: "You have already accepted this invitation." };
    }
    return { success: false, message: "You have already rejected this invitation." };
  }

  const now = new Date();
  const noteUuid = `note_${crypto.randomUUID()}`;

  await prisma.$transaction([
    prisma.invitation.update({
      where: { invitation_uuid: invitationUuid },
      data: {
        invitation_status: INVITATION_STATUS_ACCEPTED,
        invitation_app_seen_at: now,
        invitation_updated_at: now,
      },
    }),
    prisma.note.create({
      data: {
        note_uuid: noteUuid,
        request_uuid: invitation.request_uuid,
        company_id: invitation.request?.company_id ?? null,
        candidate_id: candidateId,
        invitation_uuid: invitationUuid,
        note_type: NOTE_TYPE_INVITATION_ACCEPTED,
        note_text: reason ?? null,
        note_created_datetime: now,
        note_updated_datetime: now,
      },
    }),
  ]);

  revalidatePath("/candidate/invitations");
  revalidatePath(`/candidate/invitations/${invitationUuid}`);

  return { success: true, message: "Invitation accepted successfully." };
}

/**
 * Reject an invitation. Sets status to REJECTED (2) and creates a note
 * recording the rejection. Mirrors legacy actionReject().
 *
 * @param params - invitationUuid and optional reason
 * @returns Result with success flag and message
 */
export async function rejectInvitation(
  params: RespondInvitationParams,
): Promise<InvitationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { invitationUuid, reason } = respondInvitationSchema.parse({
    ...params,
    action: "reject",
  });

  const invitation = await prisma.invitation.findFirst({
    where: { invitation_uuid: invitationUuid, candidate_id: candidateId },
    include: { request: { select: { company_id: true, request_uuid: true } } },
  });

  if (!invitation) {
    return { success: false, message: "Invitation not found." };
  }

  if (invitation.invitation_status !== INVITATION_STATUS_INVITED) {
    if (invitation.invitation_status === INVITATION_STATUS_ACCEPTED) {
      return { success: false, message: "You have already accepted this invitation." };
    }
    return { success: false, message: "You have already rejected this invitation." };
  }

  const now = new Date();
  const noteUuid = `note_${crypto.randomUUID()}`;

  await prisma.$transaction([
    prisma.invitation.update({
      where: { invitation_uuid: invitationUuid },
      data: {
        invitation_status: INVITATION_STATUS_REJECTED,
        invitation_app_seen_at: now,
        invitation_updated_at: now,
      },
    }),
    prisma.note.create({
      data: {
        note_uuid: noteUuid,
        request_uuid: invitation.request_uuid,
        company_id: invitation.request?.company_id ?? null,
        candidate_id: candidateId,
        invitation_uuid: invitationUuid,
        note_type: NOTE_TYPE_INVITATION_REJECTED,
        note_text: reason ?? null,
        note_created_datetime: now,
        note_updated_datetime: now,
      },
    }),
  ]);

  revalidatePath("/candidate/invitations");
  revalidatePath(`/candidate/invitations/${invitationUuid}`);

  return { success: true, message: "Invitation rejected successfully." };
}
