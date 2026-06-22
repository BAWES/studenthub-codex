import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Match score helpers (inlined from workspace/data/match-score)
// ---------------------------------------------------------------------------

/**
 * Compute a match score (0-100) for a candidate against a job request.
 */
function computeMatchScore(params: {
  matchedSkillCount: number;
  totalRequestSkills: number;
  candidateRate?: number | null;
  requestCompensation?: number | null;
}): number {
  const { matchedSkillCount, totalRequestSkills, candidateRate, requestCompensation } = params;

  const skillScore =
    totalRequestSkills > 0
      ? Math.min(matchedSkillCount, totalRequestSkills) / totalRequestSkills
      : null;

  let rateScore: number | null = null;
  if (
    candidateRate != null &&
    candidateRate > 0 &&
    requestCompensation != null &&
    requestCompensation > 0
  ) {
    const diff = Math.abs(candidateRate - requestCompensation);
    const proximity = Math.max(0, 1 - diff / requestCompensation);
    rateScore = proximity;
  }

  let total: number;
  if (skillScore === null) {
    total = 0.5;
  } else if (rateScore === null) {
    total = skillScore;
  } else {
    total = skillScore * 0.6 + rateScore * 0.4;
  }

  return Math.round(Math.max(0, Math.min(1, total)) * 100);
}

function matchScoreLabel(score: number): string {
  if (score >= 90) return "Excellent match";
  if (score >= 70) return "Strong match";
  if (score >= 50) return "Good match";
  if (score >= 30) return "Partial match";
  return "Low match";
}

// ---------------------------------------------------------------------------
// request-detail-core.ts
// ---------------------------------------------------------------------------
// Core query logic for fetching full request detail with pipeline data.
// Extracted from @/modules/workspace/data/shared to eliminate the data/
// directory dependency from route-level actions.
// ---------------------------------------------------------------------------

/**
 * Attempt to extract a numeric hourly-equivalent from a compensation string.
 * Examples: "3,000 KWD/month" -> 3000, "500-800" -> 650 (midpoint).
 * Returns null if no number can be reliably extracted.
 */
function parseCompensationToNumber(compensation: string | null | undefined): number | null {
  if (!compensation) return null;
  // Remove currency codes, whitespace, and "per month" / "/month" suffixes
  const cleaned = compensation.replace(/[a-zA-Z,\s/]+/g, " ").trim();
  // Extract all numeric values (handles "500-800", "3000", "1,500.50")
  const numbers = cleaned.match(/\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length === 0) return null;
  const parsed = numbers.map(Number).filter((n) => n > 0);
  if (parsed.length === 0) return null;
  // Use midpoint for ranges, single value otherwise
  const total = parsed.reduce((a, b) => a + b, 0);
  return Math.round(total / parsed.length);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function getRequestDetail(
  requestUuid: string,
  staffId?: number,
  options: { candidateHref?: (candidateId: number) => string | undefined } = {}
) {
  const where = staffId
    ? { request_uuid: requestUuid, staff_id: staffId }
    : { request_uuid: requestUuid };
  const [
    request,
    applications,
    interviews,
    invitations,
    activities,
    notes,
    stories,
    requestSkills,
    suggestions,
  ] = await prisma.$transaction([
    prisma.request.findFirst({
      where,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_job_description: true,
        request_compensation: true,
        request_number_of_employees: true,
        request_location: true,
        request_additional_info: true,
        request_status: true,
        request_priority: true,
        request_created_datetime: true,
        request_updated_datetime: true,
        request_started_at: true,
        request_finished_at: true,
        company: {
          select: {
            company_id: true,
            company_name: true,
            company_email: true,
            currency_code: true,
          },
        },
        contact: { select: { contact_name: true, contact_email: true } },
        staff: { select: { staff_name: true, staff_email: true } },
      },
    }),
    prisma.request_application.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { created_at: "desc" },
      take: 10,
      select: {
        application_uuid: true,
        status: true,
        created_at: true,
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_email: true,
          },
        },
      },
    }),
    prisma.request_interview.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { interview_at: "desc" },
      take: 10,
      select: {
        request_interview_uuid: true,
        interview_at: true,
        status: true,
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_email: true,
          },
        },
      },
    }),
    prisma.invitation.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { invitation_created_at: "desc" },
      take: 10,
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_created_at: true,
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_email: true,
          },
        },
      },
    }),
    prisma.request_activity.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { activity_created_datetime: "desc" },
      take: 8,
      select: {
        activity_uuid: true,
        activity_detail: true,
        activity_created_datetime: true,
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.note.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { note_created_datetime: "desc" },
      take: 8,
      select: {
        note_uuid: true,
        note_type: true,
        note_text: true,
        note_created_datetime: true,
      },
    }),
    prisma.story.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { story_last_updated_at: "desc" },
      take: 8,
      select: {
        story_uuid: true,
        story_status: true,
        story_last_updated_at: true,
      },
    }),
    prisma.request_skill.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { skill: "asc" },
      take: 18,
      select: { skill: true },
    }),
    prisma.suggestion.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { suggestion_datetime: "desc" },
      take: 20,
      select: {
        suggestion_uuid: true,
        suggestion_status: true,
        mail_to_company: true,
        suggestion_datetime: true,
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_email: true,
            candidate_hourly_rate: true,
            currency_code: true,
          },
        },
        note_suggestion_note_uuidTonote: { select: { note_text: true } },
      },
    }),
  ]);
  const requestSkillValues = requestSkills.map((item) => item.skill).filter(Boolean);
  const excludedCandidateIds = [
    ...applications.map((item) => item.candidate?.candidate_id),
    ...interviews.map((item) => item.candidate?.candidate_id),
    ...invitations.map((item) => item.candidate?.candidate_id),
    ...suggestions.map((item) => item.candidate?.candidate_id),
  ].filter((id): id is number => Boolean(id));
  const matchedCandidates = request
    ? await prisma.candidate.findMany({
        where: {
          deleted: 0,
          candidate_status: 10,
          approved: { not: 0 },
          ...(excludedCandidateIds.length
            ? { candidate_id: { notIn: excludedCandidateIds } }
            : {}),
          ...(requestSkillValues.length
            ? {
                candidate_skill: {
                  some: { deleted: 0, skill: { in: requestSkillValues } },
                },
              }
            : {}),
        },
        orderBy: [
          { candidate_updated_at: "desc" },
          { candidate_id: "desc" },
        ],
        take: 10,
        select: {
          candidate_id: true,
          candidate_uid: true,
          candidate_name: true,
          candidate_email: true,
          candidate_hourly_rate: true,
          currency_code: true,
          candidate_updated_at: true,
          country: { select: { country_name_en: true } },
          university: { select: { university_name_en: true } },
          candidate_skill: {
            where: requestSkillValues.length
              ? { deleted: 0, skill: { in: requestSkillValues } }
              : { deleted: 0 },
            take: 6,
            select: { skill: true },
          },
        },
      })
    : [];
  const requestCompensationValue = parseCompensationToNumber(
    request?.request_compensation
  );
  const scoredCandidates = matchedCandidates.map((candidate) => {
    const matchedSkillNames = candidate.candidate_skill
      .map((skill) => skill.skill)
      .filter(Boolean);
    const matchScore = computeMatchScore({
      matchedSkillCount: matchedSkillNames.length,
      totalRequestSkills: requestSkillValues.length,
      candidateRate: Number(candidate.candidate_hourly_rate) || null,
      requestCompensation: requestCompensationValue,
    });
    return { candidate, matchedSkillNames, matchScore };
  });
  // Sort by score descending, then by recent activity
  scoredCandidates.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    const aTime = a.candidate.candidate_updated_at?.getTime() ?? 0;
    const bTime = b.candidate.candidate_updated_at?.getTime() ?? 0;
    return bTime - aTime;
  });
  const suggestedForEmail = suggestions
    .filter((suggestion) => suggestion.candidate)
    .slice(0, 8)
    .map((suggestion) => {
      const candidate = suggestion.candidate;
      return `${candidate?.candidate_name} (${candidate?.candidate_email ?? "no email"}) - ${suggestion.note_suggestion_note_uuidTonote.note_text ?? "Suggested"}`;
    });
  const suggestionEmailHref =
    request?.contact?.contact_email || request?.company?.company_email
      ? `mailto:${request.contact?.contact_email ?? request.company?.company_email}?subject=${encodeURIComponent(
          `Candidates for ${request.request_position_title ?? "your request"}`,
        )}&body=${encodeURIComponent(suggestedForEmail.length ? suggestedForEmail.join("\n") : "No suggestions selected yet.")}`
      : null;

  return {
    request,
    requestSkills: requestSkillValues,
    requestSummary: stripHtml(
      request?.request_job_description ||
        request?.request_additional_info ||
        "No request description imported."
    ).slice(0, 220),
    suggestionEmailHref,
    pipeline: [
      {
        id: "matches",
        label: "Matches",
        value: matchedCandidates.length,
        note: "Skill-fit candidates",
      },
      {
        id: "suggestions",
        label: "Suggested",
        value: suggestions.length,
        note: "Employer-ready candidates",
      },
      {
        id: "invited",
        label: "Invited",
        value: invitations.length,
        note: "Candidate outreach",
      },
      {
        id: "applications",
        label: "Applied",
        value: applications.length,
        note: "Inbound applications",
      },
      {
        id: "interviews",
        label: "Interviews",
        value: interviews.length,
        note: "Evaluation queue",
      },
      {
        id: "stories",
        label: "Stories",
        value: stories.length,
        note: "Operational fulfillment",
      },
    ],
    metrics: [
      {
        label: "Seats",
        value: request?.request_number_of_employees ?? 0,
        note: "Requested employees",
      },
      {
        label: "Status",
        value: request?.request_status ?? "No status",
        note: `Priority ${request?.request_priority ?? 0}`,
      },
      {
        label: "Suggestions",
        value: suggestions.length,
        note: "Recent suggestions shown",
      },
      {
        label: "Invitations",
        value: invitations.length,
        note: "Recent invitations shown",
      },
    ],
    matchedCandidates: scoredCandidates.map(
      ({ candidate, matchedSkillNames, matchScore }) => {
        return {
          id: candidate.candidate_id,
          uid: candidate.candidate_uid ?? `#${candidate.candidate_id}`,
          name: candidate.candidate_name,
          email: candidate.candidate_email,
          country: candidate.country?.country_name_en ?? "No country",
          university:
            candidate.university?.university_name_en ?? "No university",
          rate: formatMoney(
            candidate.candidate_hourly_rate,
            candidate.currency_code ?? request?.company?.currency_code ?? "KWD"
          ),
          signal: matchedSkillNames.length
            ? `${matchedSkillNames.length} skill match${matchedSkillNames.length === 1 ? "" : "es"}`
            : "Recently active",
          matchScore,
          matchLabel: matchScoreLabel(matchScore),
          reasons: [
            ...matchedSkillNames.slice(0, 4),
            candidate.country?.country_name_en
              ? `Country: ${candidate.country.country_name_en}`
              : null,
            `Updated ${formatDate(candidate.candidate_updated_at)}`,
          ].filter((reason): reason is string => Boolean(reason)),
        };
      }
    ),
    applications: applications.map((application) => ({
      id: application.application_uuid,
      title: application.candidate?.candidate_name ?? "Unknown candidate",
      subtitle: application.candidate?.candidate_email ?? "No email",
      meta: `Status ${application.status ?? 0} · ${formatDate(application.created_at)}`,
      status: application.status,
      href: application.candidate?.candidate_id
        ? options.candidateHref
          ? options.candidateHref(application.candidate.candidate_id)
          : staffId
            ? `/app/companies?candidate=${application.candidate.candidate_id}`
            : `/admin/candidates/${application.candidate.candidate_id}`
        : undefined,
    })),
    interviews: interviews.map((interview) => ({
      id: interview.request_interview_uuid,
      title: interview.candidate?.candidate_name ?? "Interview",
      subtitle: interview.candidate?.candidate_email ?? "No email",
      meta: `Status ${interview.status ?? 0} · ${formatDate(interview.interview_at)}`,
      status: interview.status,
    })),
    invitations: invitations.map((invitation) => ({
      id: invitation.invitation_uuid,
      title: invitation.candidate?.candidate_name ?? "Invitation",
      subtitle: invitation.candidate?.candidate_email ?? "No email",
      meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`,
      status: invitation.invitation_status,
    })),
    suggestions: suggestions.map((suggestion) => ({
      id: suggestion.suggestion_uuid,
      title: suggestion.candidate?.candidate_name ?? "Suggestion",
      subtitle:
        suggestion.note_suggestion_note_uuidTonote.note_text ??
        suggestion.candidate?.candidate_email ??
        "No note",
      meta: `Status ${suggestion.suggestion_status ?? 0} · ${suggestion.mail_to_company ? "Mailed" : "Not mailed"} · ${formatDate(suggestion.suggestion_datetime)}`,
    })),
    activities: activities.map((activity) => ({
      id: activity.activity_uuid,
      title: activity.staff?.staff_name ?? "Activity",
      subtitle: activity.activity_detail.slice(0, 180),
      meta: formatDate(activity.activity_created_datetime),
    })),
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime),
    })),
    stories: stories.map((story) => ({
      id: story.story_uuid,
      title: `Story ${story.story_uuid.slice(0, 12)}`,
      subtitle: `Status ${story.story_status}`,
      meta: formatDate(story.story_last_updated_at),
      status: story.story_status,
    })),
  };
}
