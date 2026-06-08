import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import { getCandidateIdsForStaff } from "@/modules/workspace/data";

export async function getStaffRequestRows(staffId: number) {
  const rows = await prisma.request.findMany({
    where: { staff_id: staffId },
    orderBy: { request_updated_datetime: "desc" },
    take: 60,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.request_uuid,
    title: row.request_position_title ?? "Untitled request",
    company: row.company?.company_name ?? "No company",
    seats: row.request_number_of_employees ?? 0,
    status: row.request_status ?? "No status",
    updated: formatDate(row.request_updated_datetime)
  }));
}


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

export async function getStaffWorkspace(staffId: number) {
  const candidateIds = await getCandidateIdsForStaff(staffId);

  const [staff, productionCandidates, productionCompanies, assignedRequests, workHistories, stories, notes, recentRequests, recentStories] =
    await prisma.$transaction([
      prisma.staff.findUnique({
        where: { staff_id: staffId },
        select: {
          staff_name: true,
          staff_email: true,
          staff_job_title: true,
          staff_salary: true,
          staff_salary_currency: true
        }
      }),
      prisma.candidate.count({ where: { deleted: 0, candidate_id: { in: candidateIds.length ? candidateIds : [-1] } } }),
      prisma.company.count({ where: { deleted: 0 } }),
      prisma.request.count({ where: { staff_id: staffId } }),
      prisma.candidate_work_history.count({ where: { staff_id: staffId } }),
      prisma.story.count({ where: { staff_id: staffId } }),
      prisma.note.count({ where: { created_by: staffId } }),
      prisma.request.findMany({
        where: { staff_id: staffId },
        orderBy: { request_created_datetime: "desc" },
        take: 6,
        select: {
          request_uuid: true,
          request_position_title: true,
          request_status: true,
          request_created_datetime: true,
          company: { select: { company_name: true } }
        }
      }),
      prisma.story.findMany({
        where: { staff_id: staffId },
        orderBy: { story_last_updated_at: "desc" },
        take: 6,
        select: {
          story_uuid: true,
          story_status: true,
          story_last_updated_at: true,
          request: { select: { request_position_title: true } }
        }
      })
    ]);

  return {
    staff,
    metrics: [
      { label: "Candidates", value: productionCandidates, note: `${workHistories} assigned to this staff account` },
      { label: "Companies", value: productionCompanies, note: "Employer records in the prod clone" },
      { label: "Assigned Requests", value: assignedRequests, note: "Requests owned by this staff member" },
      { label: "Stories", value: stories, note: `${notes} staff notes · ${formatMoney(staff?.staff_salary, staff?.staff_salary_currency ?? "KWD")}` }
    ],
    requests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${formatDate(request.request_created_datetime)}`
    })),
    stories: recentStories.map((story) => ({
      id: story.story_uuid,
      title: story.request.request_position_title ?? "Story",
      subtitle: `Status ${story.story_status}`,
      meta: formatDate(story.story_last_updated_at)
    }))
  };
}
