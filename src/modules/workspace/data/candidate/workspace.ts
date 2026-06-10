import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

export async function getCandidateWorkspace(candidateId: number) {
  const [candidate, education, experience, skills, invitations, workingHours, recentInvitations, recentHours] =
    await prisma.$transaction([
      prisma.candidate.findUnique({
        where: { candidate_id: candidateId },
        select: {
          candidate_name: true,
          candidate_email: true,
          candidate_status: true,
          approved: true,
          candidate_hourly_rate: true,
          currency_code: true,
          candidate_created_at: true
        }
      }),
      prisma.candidate_education.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_experience.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_skill.count({ where: { candidate_id: candidateId } }),
      prisma.invitation.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_working_hour.count({ where: { candidate_id: candidateId } }),
      prisma.invitation.findMany({
        where: { candidate_id: candidateId },
        orderBy: { invitation_created_at: "desc" },
        take: 6,
        select: {
          invitation_uuid: true,
          invitation_status: true,
          invitation_created_at: true,
          request: { select: { request_position_title: true, company: { select: { company_name: true } } } }
        }
      }),
      prisma.candidate_working_hour.findMany({
        where: { candidate_id: candidateId },
        orderBy: { date: "desc" },
        take: 6,
        select: {
          candidate_working_hour_uuid: true,
          date: true,
          total_time: true,
          status: true,
          store: { select: { store_name: true } }
        }
      })
    ]);

  return {
    candidate,
    metrics: [
      { label: "Education", value: education, note: "Profile education entries" },
      { label: "Experience", value: experience, note: "Profile experience entries" },
      { label: "Skills", value: skills, note: "Skill tags from the old system" },
      {
        label: "Rate",
        value: formatMoney(candidate?.candidate_hourly_rate, candidate?.currency_code ?? "KWD"),
        note: `${invitations} invitations · ${workingHours} work logs`
      }
    ],
    invitations: recentInvitations.map((invitation) => ({
      id: invitation.invitation_uuid,
      title: invitation.request.request_position_title ?? "Invitation",
      subtitle: invitation.request.company?.company_name ?? "No company",
      meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`
    })),
    hours: recentHours.map((hour) => ({
      id: hour.candidate_working_hour_uuid,
      title: hour.store?.store_name ?? "Work log",
      subtitle: `${hour.total_time ?? 0} minutes`,
      meta: `Status ${hour.status ?? 0} · ${formatDate(hour.date)}`
    }))
  };
}
