import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

export async function getStaffInterviewRows(staffId: number) {
  const rows = await prisma.request_interview.findMany({
    where: { staff_id: staffId },
    orderBy: { interview_at: "desc" },
    take: 60,
    select: {
      request_interview_uuid: true,
      interview_at: true,
      status: true,
      internal_note: true,
      candidate: { select: { candidate_id: true, candidate_name: true, candidate_email: true } },
      request: { select: { request_uuid: true, request_position_title: true } }
    }
  });

  return rows.map((row) => ({
    id: row.request_interview_uuid,
    candidate: row.candidate?.candidate_name ?? "Unknown candidate",
    candidateEmail: row.candidate?.candidate_email ?? "",
    candidateId: row.candidate?.candidate_id ?? null,
    requestTitle: row.request?.request_position_title ?? "Untitled request",
    requestUuid: row.request?.request_uuid ?? "",
    scheduledAt: row.interview_at ? formatDate(row.interview_at) : "Not scheduled",
    status: row.status === 1 ? "Completed" : row.status === 2 ? "Cancelled" : "Scheduled",
    note: row.internal_note ?? ""
  }));
}

export async function getStaffInterviewDetail(interviewUuid: string, staffId: number) {
  const interview = await prisma.request_interview.findFirst({
    where: { request_interview_uuid: interviewUuid, staff_id: staffId },
    select: {
      request_interview_uuid: true,
      interview_at: true,
      status: true,
      internal_note: true,
      interview_note: true,
      created_at: true,
      updated_at: true,
      candidate: { select: { candidate_id: true, candidate_name: true, candidate_email: true, candidate_phone: true } },
      request: { select: { request_uuid: true, request_position_title: true, request_status: true, company: { select: { company_name: true } } } },
      staff: { select: { staff_name: true } }
    }
  });

  return interview;
}
