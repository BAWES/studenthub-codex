import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

export async function getCandidateInvitationRows(candidateId: number) {
  const rows = await prisma.invitation.findMany({
    where: { candidate_id: candidateId },
    orderBy: { invitation_created_at: "desc" },
    take: 80,
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
          company: { select: { company_name: true } }
        }
      }
    }
  });

  return rows.map((row) => ({
    id: row.invitation_uuid,
    role: row.request.request_position_title ?? "Invitation",
    company: row.request.company?.company_name ?? "No company",
    compensation: row.request.request_compensation || "Not set",
    status: `Status ${row.invitation_status ?? 0}`,
    seen: row.invitation_app_seen_at || row.invitation_email_seen_at ? "Seen" : "Unseen",
    created: formatDate(row.invitation_created_at)
  }));
}

export async function getCandidateInvitationDetail(candidateId: number, invitationUuid: string) {
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
            staff: { select: { staff_name: true, staff_email: true } }
          }
        },
        story: {
          select: {
            story_uuid: true,
            story_status: true,
            story_last_updated_at: true
          }
        }
      }
    }),
    prisma.note.findMany({
      where: { invitation_uuid: invitationUuid },
      orderBy: { note_created_datetime: "desc" },
      take: 8,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true }
    })
  ]);

  return {
    invitation,
    metrics: [
      { label: "Status", value: invitation ? `Status ${invitation.invitation_status ?? 0}` : "Missing", note: "Legacy invitation status" },
      { label: "Seats", value: invitation?.request.request_number_of_employees ?? 0, note: "Requested headcount" },
      { label: "Seen", value: invitation?.invitation_app_seen_at || invitation?.invitation_email_seen_at ? "Yes" : "No", note: invitation?.invitation_seen_via ?? "No seen source" },
      { label: "Request", value: invitation?.request.request_status ?? "No status", note: "Linked request status" }
    ],
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime)
    }))
  };
}
