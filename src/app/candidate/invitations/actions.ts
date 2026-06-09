"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import {
  listInvitationsSchema,
  getInvitationDetailSchema,
  type ListInvitationsParams,
  type GetInvitationDetailParams,
  type ListInvitationsResult,
  type GetInvitationDetailResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateInvitations
// ---------------------------------------------------------------------------

/**
 * List invitations for the current candidate.
 *
 * Maps to the legacy getCandidateInvitationRows function.
 * Paginated, ordered by created_at descending.
 */
export async function listCandidateInvitations(
  params: FormData | ListInvitationsParams = {},
): Promise<ListInvitationsResult> {
  const session = await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listInvitationsSchema.safeParse(raw);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const candidateId = Number(session.id);

  const where = { candidate_id: candidateId };

  const [rows, total] = await Promise.all([
    prisma.invitation.findMany({
      where: where as any,
      orderBy: { invitation_created_at: "desc" },
      skip,
      take: limit,
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_app_seen_at: true,
        invitation_email_seen_at: true,
        invitation_created_at: true,
        request: {
          select: {
            request_position_title: true,
            request_compensation: true,
            company: { select: { company_name: true } },
          },
        },
      },
    }),
    prisma.invitation.count({ where: where as any }),
  ]);

  const items = rows.map((row) => ({
    invitation_uuid: row.invitation_uuid,
    invitation_status: row.invitation_status,
    invitation_app_seen_at: row.invitation_app_seen_at,
    invitation_email_seen_at: row.invitation_email_seen_at,
    invitation_created_at: row.invitation_created_at,
    position_title: row.request.request_position_title,
    compensation: row.request.request_compensation,
    company_name: row.request.company?.company_name ?? null,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getCandidateInvitationDetail
// ---------------------------------------------------------------------------

/**
 * Get a single invitation by UUID for the current candidate.
 *
 * Maps to the legacy getCandidateInvitationDetail function.
 * Returns the invitation with full request, company, staff, story, and notes.
 * Returns nullified result if not found or not owned.
 */
export async function getCandidateInvitationDetail(
  params: GetInvitationDetailParams,
): Promise<GetInvitationDetailResult> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getInvitationDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { invitationUuid } = parsed.data;
  const candidateId = Number(session.id);

  const [invitation, notes] = await prisma.$transaction([
    prisma.invitation.findFirst({
      where: { invitation_uuid: invitationUuid, candidate_id: candidateId },
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_app_seen_at: true,
        invitation_email_seen_at: true,
        invitation_seen_via: true,
        invitation_created_at: true,
        invitation_updated_at: true,
        request: {
          select: {
            request_uuid: true,
            request_position_title: true,
            request_job_description: true,
            request_compensation: true,
            request_location: true,
            request_number_of_employees: true,
            request_status: true,
            company: { select: { company_name: true, company_email: true } },
            staff: { select: { staff_name: true, staff_email: true } },
          },
        },
        story: {
          select: {
            story_uuid: true,
            story_status: true,
            story_last_updated_at: true,
          },
        },
      },
    }),
    prisma.note.findMany({
      where: { invitation_uuid: invitationUuid },
      orderBy: { note_created_datetime: "desc" },
      take: 8,
      select: {
        note_uuid: true,
        note_type: true,
        note_text: true,
        note_created_datetime: true,
      },
    }),
  ]);

  return {
    invitation: invitation
      ? {
          invitation_uuid: invitation.invitation_uuid,
          invitation_status: invitation.invitation_status,
          invitation_app_seen_at: invitation.invitation_app_seen_at,
          invitation_email_seen_at: invitation.invitation_email_seen_at,
          invitation_seen_via: invitation.invitation_seen_via,
          invitation_created_at: invitation.invitation_created_at,
          invitation_updated_at: invitation.invitation_updated_at,
          request: {
            request_uuid: invitation.request.request_uuid,
            request_position_title: invitation.request.request_position_title,
            request_job_description: invitation.request.request_job_description,
            request_compensation: invitation.request.request_compensation,
            request_location: invitation.request.request_location,
            request_number_of_employees: invitation.request.request_number_of_employees,
            request_status: invitation.request.request_status as string | null,
            company_name: invitation.request.company?.company_name ?? null,
            company_email: invitation.request.company?.company_email ?? null,
            staff_name: invitation.request.staff?.staff_name ?? null,
            staff_email: invitation.request.staff?.staff_email ?? null,
          },
          story_uuid: invitation.story?.story_uuid ?? null,
          story_status: invitation.story?.story_status ?? null,
          story_last_updated_at: invitation.story?.story_last_updated_at ?? null,
        }
      : null,
    metrics: invitation
      ? [
          {
            label: "Status",
            value: `Status ${invitation.invitation_status ?? 0}`,
            note: "Legacy invitation status",
          },
          {
            label: "Seats",
            value: invitation.request.request_number_of_employees ?? 0,
            note: "Requested headcount",
          },
          {
            label: "Seen",
            value:
              invitation.invitation_app_seen_at ||
              invitation.invitation_email_seen_at
                ? "Yes"
                : "No",
            note: invitation.invitation_seen_via ?? "No seen source",
          },
          {
            label: "Request",
            value: invitation.request.request_status ?? "No status",
            note: "Linked request status",
          },
        ]
      : [
          { label: "Status", value: "Missing", note: "Legacy invitation status" },
          { label: "Seats", value: 0, note: "Requested headcount" },
          { label: "Seen", value: "No", note: "No seen source" },
          { label: "Request", value: "No status", note: "Linked request status" },
        ],
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime),
    })),
  };
}
