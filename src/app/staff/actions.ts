"use server";

// ---------------------------------------------------------------------------
// Staff workspace — server actions
// Mirrors the legacy getStaffWorkspace() from @/modules/workspace/data.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import { getStaffWorkspaceSchema } from "./schemas";
import type { StaffWorkspaceData } from "./schemas";

/**
 * Fetch the staff workspace dashboard data for a given staff account.
 * Returns staff info, aggregate metrics, recent requests, and recent stories.
 */
export async function getStaffWorkspace(
  staffId: number,
): Promise<StaffWorkspaceData> {
  await requireCapability("request.read.assigned");

  const parsed = getStaffWorkspaceSchema.safeParse({ staffId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid staff ID");
  }

  const rows = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 500,
    select: { candidate_id: true },
  });
  const ids = rows.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));

  const [staff, productionCandidates, productionCompanies, assignedRequests, workHistories, stories, notes, recentRequests, recentStories] =
    await prisma.$transaction([
      prisma.staff.findUnique({
        where: { staff_id: staffId },
        select: {
          staff_name: true,
          staff_email: true,
          staff_job_title: true,
          staff_salary: true,
          staff_salary_currency: true,
        },
      }),
      prisma.candidate.count({ where: { deleted: 0, candidate_id: { in: ids.length ? ids : [-1] } } }),
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
          company: { select: { company_name: true } },
        },
      }),
      prisma.story.findMany({
        where: { staff_id: staffId },
        orderBy: { story_last_updated_at: "desc" },
        take: 6,
        select: {
          story_uuid: true,
          story_status: true,
          story_last_updated_at: true,
          request: { select: { request_position_title: true } },
        },
      }),
    ]);

  return {
    staff: staff
      ? {
          ...staff,
          staff_salary: staff.staff_salary ? Number(staff.staff_salary) : null,
        }
      : null,
    metrics: [
      { label: "Candidates", value: productionCandidates, note: `${workHistories} assigned to this staff account` },
      { label: "Companies", value: productionCompanies, note: "Employer records in the prod clone" },
      { label: "Assigned Requests", value: assignedRequests, note: "Requests owned by this staff member" },
      { label: "Stories", value: stories, note: `${notes} staff notes · ${formatMoney(staff?.staff_salary, staff?.staff_salary_currency ?? "KWD")}` },
    ],
    requests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${formatDate(request.request_created_datetime)}`,
    })),
    stories: recentStories.map((story) => ({
      id: story.story_uuid,
      title: story.request.request_position_title ?? "Story",
      subtitle: `Status ${story.story_status}`,
      meta: formatDate(story.story_last_updated_at),
    })),
  };
}
