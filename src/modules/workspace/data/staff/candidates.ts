import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Candidate detail data — inlined from modules/workspace/data/candidate/detail.ts
// ---------------------------------------------------------------------------

export async function getCandidateDetail(candidateId: number, requestBasePath = "/staff/requests") {
  const [
    candidate,
    invitations,
    workHours,
    histories,
    notes,
    skills,
    tags,
    warnings,
    links,
    idCards,
    applications,
    interviews,
    suggestions,
    education,
    experiences,
    certificates,
    languages,
    stats
  ] = await prisma.$transaction([
    prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: {
        candidate_id: true,
        candidate_uid: true,
        candidate_name: true,
        candidate_name_ar: true,
        candidate_objective: true,
        candidate_intro: true,
        candidate_personal_photo: true,
        candidate_resume: true,
        candidate_email: true,
        candidate_email_verification: true,
        candidate_phone: true,
        candidate_civil_id: true,
        candidate_civil_expiry_date: true,
        candidate_civil_photo_front: true,
        candidate_civil_photo_back: true,
        candidate_video: true,
        candidate_address_line1: true,
        candidate_birth_date: true,
        candidate_gender: true,
        candidate_driving_license: true,
        candidate_preferred_time: true,
        bank_id: true,
        bank_account_name: true,
        candidate_iban: true,
        candidate_status: true,
        approved: true,
        candidate_hourly_rate: true,
        currency_code: true,
        candidate_job_search_status: true,
        candidate_civil_need_verification: true,
        is_incomplete_profile: true,
        profile_url: true,
        candidate_created_at: true,
        candidate_updated_at: true,
        country_id: true,
        country: { select: { country_name_en: true } },
        university_id: true,
        university: { select: { university_name_en: true } },
        store: { select: { store_name: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.invitation.findMany({
      where: { candidate_id: candidateId },
      orderBy: { invitation_created_at: "desc" },
      take: 8,
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_created_at: true,
        request: {
          select: {
            request_uuid: true,
            request_position_title: true,
            company: { select: { company_name: true } }
          }
        }
      }
    }),
    prisma.candidate_working_hour.findMany({
      where: { candidate_id: candidateId },
      orderBy: { date: "desc" },
      take: 8,
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        total_time: true,
        status: true,
        store: { select: { store_name: true } }
      }
    }),
    prisma.candidate_work_history.findMany({
      where: { candidate_id: candidateId },
      orderBy: { end_date: "desc" },
      take: 8,
      select: {
        id: true,
        start_date: true,
        end_date: true,
        candidate_hourly_rate: true,
        company_candidate_work_history_company_idTocompany: { select: { company_name: true } },
        staff: { select: { staff_name: true } }
      }
    }),
    prisma.note.findMany({
      where: { candidate_id: candidateId },
      orderBy: { note_created_datetime: "desc" },
      take: 6,
      select: {
        note_uuid: true,
        note_type: true,
        note_text: true,
        note_created_datetime: true
      }
    }),
    prisma.candidate_skill.findMany({
      where: { candidate_id: candidateId, deleted: 0 },
      orderBy: { candidate_skill_created_at: "desc" },
      take: 12,
      select: {
        candidate_skill_id: true,
        skill: true,
        candidate_skill_created_at: true
      }
    }),
    prisma.candidate_tag.findMany({
      where: { candidate_id: candidateId, deleted: 0 },
      orderBy: { created_at: "desc" },
      take: 10,
      select: {
        tag_id: true,
        tag: true,
        reason: true,
        created_at: true,
        staff: { select: { staff_name: true } }
      }
    }),
    prisma.candidate_warning.findMany({
      where: { candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: {
        warning_id: true,
        title: true,
        message: true,
        created_at: true
      }
    }),
    prisma.candidate_link.findMany({
      where: { candidate_id: candidateId },
      orderBy: { updated_at: "desc" },
      take: 8,
      select: {
        cl_uuid: true,
        title: true,
        url: true,
        updated_at: true
      }
    }),
    prisma.candidate_id_card.findMany({
      where: { candidate_id: candidateId, deleted: 0 },
      orderBy: { updated_at: "desc" },
      take: 4,
      select: {
        id: true,
        expiry_date: true,
        created_at: true,
        updated_at: true
      }
    }),
    prisma.request_application.findMany({
      where: { candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: {
        application_uuid: true,
        status: true,
        created_at: true,
        request: {
          select: {
            request_uuid: true,
            request_position_title: true,
            company: { select: { company_name: true } }
          }
        }
      }
    }),
    prisma.request_interview.findMany({
      where: { candidate_id: candidateId },
      orderBy: { interview_at: "desc" },
      take: 8,
      select: {
        request_interview_uuid: true,
        status: true,
        interview_at: true,
        request: {
          select: {
            request_uuid: true,
            request_position_title: true,
            company: { select: { company_name: true } }
          }
        }
      }
    }),
    prisma.suggestion.findMany({
      where: { candidate_id: candidateId },
      orderBy: { suggestion_datetime: "desc" },
      take: 8,
      select: {
        suggestion_uuid: true,
        suggestion_status: true,
        mail_to_company: true,
        suggestion_datetime: true,
        request: {
          select: {
            request_uuid: true,
            request_position_title: true,
            company: { select: { company_name: true } }
          }
        },
        note_suggestion_note_uuidTonote: { select: { note_text: true } }
      }
    }),
    prisma.candidate_education.findMany({
      where: { candidate_id: candidateId },
      orderBy: { updated_at: "desc" },
      take: 6,
      select: {
        education_uuid: true,
        university_id: true,
        degree_uuid: true,
        major_uuid: true,
        graduation_year: true,
        is_currently_studying: true,
        university: { select: { university_name_en: true } },
        degree: { select: { degree_name_en: true } },
        major: { select: { major_name_en: true } },
        updated_at: true
      }
    }),
    prisma.candidate_experience.findMany({
      where: { candidate_id: candidateId, deleted: 0 },
      orderBy: { candidate_experience_created_at: "desc" },
      take: 8,
      select: {
        candidate_experience_id: true,
        experience: true,
        employer: true,
        start_year: true,
        end_year: true,
        candidate_experience_created_at: true
      }
    }),
    prisma.candidate_certificate.findMany({
      where: { candidate_id: candidateId, is_deleted: false },
      orderBy: { updated_at: "desc" },
      take: 6,
      select: {
        certificate_uuid: true,
        certificate_type: true,
        start_date: true,
        end_date: true,
        company_candidate_certificate_company_idTocompany: { select: { company_name: true } },
        store: { select: { store_name: true } },
        staff: { select: { staff_name: true } },
        updated_at: true
      }
    }),
    prisma.candidate_language.findMany({
      where: { candidate_id: candidateId, deleted: 0 },
      orderBy: { candidate_language_created_at: "desc" },
      take: 10,
      select: {
        candidate_language_id: true,
        language: true,
        proficiency: true,
      }
    }),
    prisma.candidate_stats.findFirst({
      where: { candidate_id: candidateId },
      orderBy: { updated_at: "desc" },
      select: {
        total_revenue: true,
        currency_code: true,
        updated_at: true
      }
    })
  ]);

  return {
    candidate,
    metrics: [
      { label: "Status", value: candidate?.approved === 0 ? "Needs review" : `Active ${candidate?.candidate_status ?? ""}`, note: "Approval and legacy status" },
      { label: "Rate", value: formatMoney(candidate?.candidate_hourly_rate, candidate?.currency_code ?? "KWD"), note: "Candidate hourly rate" },
      { label: "Invitations", value: invitations.length, note: "Most recent invitations shown below" },
      { label: "Work Logs", value: workHours.length, note: "Recent imported work-hour records" }
    ],
    invitations: invitations.map((invitation) => ({
      id: invitation.invitation_uuid,
      title: invitation.request.request_position_title ?? "Invitation",
      subtitle: invitation.request.company?.company_name ?? "No company",
      meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`,
      href: `${requestBasePath}/${invitation.request.request_uuid}`
    })),
    workHours: workHours.map((hour) => ({
      id: hour.candidate_working_hour_uuid,
      title: hour.store?.store_name ?? "Work log",
      subtitle: `${hour.total_time ?? 0} minutes`,
      meta: `Status ${hour.status ?? 0} · ${formatDate(hour.date)}`,
      status: hour.status ?? 0
    })),
    histories: histories.map((history) => ({
      id: history.id,
      title: history.company_candidate_work_history_company_idTocompany?.company_name ?? "Assignment",
      subtitle: history.staff?.staff_name ?? "No staff owner",
      meta: `${formatDate(history.start_date)} to ${formatDate(history.end_date)} · ${formatMoney(history.candidate_hourly_rate, candidate?.currency_code ?? "KWD")}`
    })),
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime)
    })),
    skills: skills.map((skill) => ({
      id: skill.candidate_skill_id,
      title: skill.skill,
      subtitle: "Skill",
      meta: formatDate(skill.candidate_skill_created_at)
    })),
    tags: tags.map((tag) => ({
      id: tag.tag_id,
      title: tag.tag,
      subtitle: tag.reason?.slice(0, 180) ?? tag.staff?.staff_name ?? "Candidate tag",
      meta: formatDate(tag.created_at)
    })),
    warnings: warnings.map((warning) => ({
      id: warning.warning_id,
      title: warning.title ?? "Warning",
      subtitle: warning.message.slice(0, 180),
      meta: formatDate(warning.created_at)
    })),
    links: links.map((link) => ({
      id: link.cl_uuid,
      title: link.title ?? "Candidate link",
      subtitle: link.url ?? "No URL",
      meta: formatDate(link.updated_at),
      href: link.url ?? undefined
    })),
    idCards: idCards.map((card) => ({
      id: card.id,
      title: `Civil ID card #${card.id}`,
      subtitle: `Expires ${formatDate(card.expiry_date)}`,
      meta: `Updated ${formatDate(card.updated_at ?? card.created_at)}`
    })),
    applications: applications.map((application) => ({
      id: application.application_uuid,
      title: application.request.request_position_title ?? "Application",
      subtitle: application.request.company?.company_name ?? "No company",
      meta: `Status ${application.status ?? 0} · ${formatDate(application.created_at)}`,
      href: `${requestBasePath}/${application.request.request_uuid}`
    })),
    interviews: interviews.map((interview) => ({
      id: interview.request_interview_uuid,
      title: interview.request.request_position_title ?? "Interview",
      subtitle: interview.request.company?.company_name ?? "No company",
      meta: `Status ${interview.status ?? 0} · ${formatDate(interview.interview_at)}`,
      href: `${requestBasePath}/${interview.request.request_uuid}`
    })),
    suggestions: suggestions.map((suggestion) => ({
      id: suggestion.suggestion_uuid,
      title: suggestion.request.request_position_title ?? "Suggestion",
      subtitle: suggestion.note_suggestion_note_uuidTonote.note_text?.slice(0, 180) ?? suggestion.request.company?.company_name ?? "No note",
      meta: `Status ${suggestion.suggestion_status ?? 0} · ${suggestion.mail_to_company ? "Mailed" : "Not mailed"} · ${formatDate(suggestion.suggestion_datetime)}`,
      href: `${requestBasePath}/${suggestion.request.request_uuid}`
    })),
    education: education.map((item) => ({
      id: item.education_uuid,
      title: item.university.university_name_en ?? "Education",
      subtitle: [item.degree?.degree_name_en, item.major?.major_name_en].filter(Boolean).join(" · ") || "Education",
      meta: `${item.is_currently_studying ? "Currently studying" : "Graduated"}${item.graduation_year ? ` · ${item.graduation_year}` : ""}`
    })),
    educationEntries: education.map((item) => ({
      id: item.education_uuid,
      universityId: item.university_id,
      degreeUuid: item.degree_uuid,
      majorUuid: item.major_uuid,
      graduationYear: item.graduation_year,
      isCurrentlyStudying: item.is_currently_studying ?? false,
      universityLabel: item.university?.university_name_en ?? "",
      degreeLabel: item.degree?.degree_name_en ?? undefined,
      majorLabel: item.major?.major_name_en ?? undefined,
    })),
    experiences: experiences.map((item) => ({
      id: item.candidate_experience_id,
      title: item.experience,
      subtitle: item.employer ?? "Experience",
      meta: [item.start_year, item.end_year].filter(Boolean).join(" to ") || formatDate(item.candidate_experience_created_at)
    })),
    certificates: certificates.map((item) => ({
      id: item.certificate_uuid,
      title: item.company_candidate_certificate_company_idTocompany?.company_name ?? item.store?.store_name ?? "Certificate",
      subtitle: item.certificate_type ? "Experience certificate" : "Certificate",
      meta: `${formatDate(item.start_date)} to ${formatDate(item.end_date)} · ${item.staff?.staff_name ?? "No staff owner"}`
    })),
    languages: languages.map((item) => ({
      id: item.candidate_language_id,
      title: item.language,
      subtitle: item.proficiency,
    })),
    stats: stats
      ? {
          totalRevenue: formatMoney(stats.total_revenue, stats.currency_code ?? candidate?.currency_code ?? "KWD"),
          updated: formatDate(stats.updated_at)
        }
      : null
  };
}

// ---------------------------------------------------------------------------
// Staff candidate functions — extracted from workspace/data.ts
// ---------------------------------------------------------------------------

export async function getStaffCandidateRows(staffId: number) {
  const histories = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId },
    orderBy: { end_date: "desc" },
    take: 60,
    select: {
      id: true,
      candidate_id: true,
      start_date: true,
      end_date: true,
      company_candidate_work_history_company_idTocompany: { select: { company_name: true } }
    }
  });

  const candidateIds = histories.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));
  const candidates = await prisma.candidate.findMany({
    where: { candidate_id: { in: candidateIds } },
    select: { candidate_id: true, candidate_name: true, candidate_email: true, approved: true }
  });
  const candidateById = new Map(candidates.map((candidate) => [candidate.candidate_id, candidate]));

  return histories.map((row) => {
    const candidate = row.candidate_id ? candidateById.get(row.candidate_id) : null;
    return {
      id: row.id,
      candidateId: candidate?.candidate_id ?? row.candidate_id ?? 0,
      name: candidate?.candidate_name ?? "Unknown candidate",
      email: candidate?.candidate_email ?? "No email",
      company: row.company_candidate_work_history_company_idTocompany?.company_name ?? "No company",
      status: candidate?.approved === 0 ? "Needs review" : "Assigned",
      period: `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`
    };
  });
}

export type StaffCandidateFilter = "all" | "active" | "needs-review" | "incomplete" | "civil-id";

export type StaffCandidateDirectoryRow = {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  store: string;
  status: string;
  flags: string[];
  rate: string;
  updated: string;
  created: string;
  civilExpiry: string;
  candidateStatus: number;
  approved: number;
  isIncomplete: boolean;
  needsCivilId: boolean;
  searchStatus: number | null;
  priorityScore: number;
  signal: string;
};

export async function getStaffCandidateDirectoryRows({
  staffId,
  search,
  filter
}: {
  staffId: number;
  search?: string;
  filter?: StaffCandidateFilter;
}) {
  const normalizedSearch = search?.trim();
  const candidateIds = await getCandidateIdsForStaff(staffId);
  const staffCandidateWhere = candidateIds.length ? { candidate_id: { in: candidateIds } } : { candidate_id: -1 };
  const where = {
    deleted: 0,
    ...staffCandidateWhere,
    ...(filter === "active" ? { candidate_status: 10, approved: { not: 0 } } : {}),
    ...(filter === "needs-review" ? { approved: 0 } : {}),
    ...(filter === "incomplete" ? { is_incomplete_profile: true } : {}),
    ...(filter === "civil-id" ? { candidate_civil_need_verification: true } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { candidate_name: { contains: normalizedSearch } },
            { candidate_email: { contains: normalizedSearch } },
            ...(Number.isInteger(Number(normalizedSearch)) ? [{ candidate_id: Number(normalizedSearch) }] : [])
          ]
        }
      : {})
  };

  const [rows, active, needsReview, incomplete, civilId] = await prisma.$transaction([
    prisma.candidate.findMany({
      where,
      orderBy: { candidate_updated_at: "desc" },
      take: 80,
      select: {
        candidate_id: true,
        candidate_uid: true,
        candidate_name: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        approved: true,
        candidate_job_search_status: true,
        candidate_civil_expiry_date: true,
        is_incomplete_profile: true,
        candidate_civil_need_verification: true,
        candidate_hourly_rate: true,
        currency_code: true,
        candidate_created_at: true,
        candidate_updated_at: true,
        country: { select: { country_name_en: true } },
        store: { select: { store_name: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.candidate.count({ where: { ...where, candidate_status: 10, approved: { not: 0 } } }),
    prisma.candidate.count({ where: { ...where, approved: 0 } }),
    prisma.candidate.count({ where: { ...where, is_incomplete_profile: true } }),
    prisma.candidate.count({ where: { ...where, candidate_civil_need_verification: true } })
  ]);

  return {
    rows: rows.map((row) => {
      const isIncomplete = Boolean(row.is_incomplete_profile);
      const needsCivilId = Boolean(row.candidate_civil_need_verification);
      const flags = [
        row.approved === 0 ? "Needs review" : null,
        isIncomplete ? "Incomplete" : null,
        needsCivilId ? "Civil ID" : null,
        row.candidate_status !== 10 ? `Status ${row.candidate_status}` : null
      ].filter((flag): flag is string => Boolean(flag));

      return {
        id: row.candidate_id,
        uid: row.candidate_uid ?? `#${row.candidate_id}`,
        name: row.candidate_name,
        email: row.candidate_email,
        phone: row.candidate_phone ?? "No phone",
        country: row.country?.country_name_en ?? "No country",
        company: row.store?.company?.company_name ?? "No company",
        store: row.store?.store_name ?? "No store",
        status: row.approved === 0 ? "Needs review" : row.candidate_status === 10 ? "Active" : `Status ${row.candidate_status}`,
        flags,
        rate: formatMoney(row.candidate_hourly_rate, row.currency_code ?? "KWD"),
        updated: formatDate(row.candidate_updated_at),
        created: formatDate(row.candidate_created_at),
        civilExpiry: formatDate(row.candidate_civil_expiry_date),
        candidateStatus: row.candidate_status,
        approved: row.approved,
        isIncomplete,
        needsCivilId,
        searchStatus: row.candidate_job_search_status ?? null,
        priorityScore:
          (row.approved === 0 ? 40 : 0) +
          (isIncomplete ? 30 : 0) +
          (needsCivilId ? 25 : 0) +
          (row.candidate_status !== 10 ? 10 : 0),
        signal:
          row.approved === 0
            ? "Approval decision"
            : isIncomplete
              ? "Profile cleanup"
              : needsCivilId
                ? "Civil ID review"
                : row.candidate_status === 10
                  ? "Ready"
                  : "Watch"
      };
    }),
    metrics: [
      { label: "Active", value: active, note: "Approved active candidates" },
      { label: "Needs Review", value: needsReview, note: "Candidates waiting on approval" },
      { label: "Incomplete", value: incomplete, note: "Profiles flagged incomplete" },
      { label: "Civil ID", value: civilId, note: "Candidates needing civil ID review" }
    ]
  };
}

export async function getStaffCandidateConsole({
  staffId,
  search,
  filter,
  candidateId
}: {
  staffId: number;
  search?: string;
  filter?: StaffCandidateFilter;
  candidateId?: number;
}) {
  const directory = await getStaffCandidateDirectoryRows({ staffId, search, filter });
  const rows = directory.rows;
  const selectedId =
    candidateId && Number.isFinite(candidateId) && (await canStaffAccessCandidate(staffId, candidateId))
      ? candidateId
      : rows[0]?.id;
  const selected = selectedId ? await getCandidateDetail(selectedId, "/staff/requests") : null;
  const candidateIds = rows.map((row) => row.id);
  const scopedCandidateWhere = candidateIds.length ? { candidate_id: { in: candidateIds } } : { candidate_id: -1 };

  const [
    requestCount,
    applicationCount,
    interviewCount,
    storyCount,
    workLogCount,
    appealCount,
    transferCandidateCount,
    unpaidCandidateCount,
    invoiceCount,
    idRequestCount,
    recentRequests,
    recentTransfers,
    recentIdRequests,
    recentWorkLogs,
    recentInvitations,
    pendingAppeals,
    warnings
  ] =
    await prisma.$transaction([
      prisma.request.count({ where: { staff_id: staffId } }),
      prisma.request_application.count({ where: { request: { staff_id: staffId } } }),
      prisma.request_interview.count({ where: { OR: [{ staff_id: staffId }, { request: { staff_id: staffId } }] } }),
      prisma.story.count({ where: { staff_id: staffId } }),
      prisma.candidate_working_hour.count({ where: scopedCandidateWhere }),
      prisma.candidate_working_hour_appeal.count({ where: { ...scopedCandidateWhere, status: { in: [0, 1] } } }),
      prisma.transfer_candidate.count({ where: { ...scopedCandidateWhere, deleted: 0 } }),
      prisma.transfer_candidate.count({ where: { ...scopedCandidateWhere, deleted: 0, paid: 0 } }),
      prisma.invoice.count({
        where: {
          deleted: 0,
          transfer: candidateIds.length ? { transfer_candidate: { some: scopedCandidateWhere } } : { transfer_id: -1 }
        }
      }),
      prisma.candidate_id_request.count({ where: { created_by: staffId } }),
      prisma.request.findMany({
        where: { staff_id: staffId },
        orderBy: { request_updated_datetime: "desc" },
        take: 5,
        select: {
          request_uuid: true,
          request_position_title: true,
          request_status: true,
          request_number_of_employees: true,
          request_updated_datetime: true,
          company: { select: { company_name: true } }
        }
      }),
      prisma.transfer_candidate.findMany({
        where: { ...scopedCandidateWhere, deleted: 0 },
        orderBy: { tc_updated_at: "desc" },
        take: 5,
        select: {
          tc_id: true,
          transfer_id: true,
          candidate_total: true,
          company_total: true,
          paid: true,
          currency_code: true,
          tc_updated_at: true,
          candidate: { select: { candidate_name: true } },
          company: { select: { company_name: true } }
        }
      }),
      prisma.candidate_id_request.findMany({
        where: { created_by: staffId },
        orderBy: { updated_at: "desc" },
        take: 5,
        select: { cir_uuid: true, status: true, candidate_ids: true, updated_at: true, created_at: true }
      }),
      prisma.candidate_working_hour.findMany({
        where: scopedCandidateWhere,
        orderBy: [{ updated_at: "desc" }, { date: "desc" }],
        take: 12,
        select: {
          candidate_working_hour_uuid: true,
          candidate_id: true,
          date: true,
          total_time: true,
          status: true,
          updated_at: true,
          candidate: { select: { candidate_name: true } },
          store: { select: { store_name: true } }
        }
      }),
      prisma.invitation.findMany({
        where: scopedCandidateWhere,
        orderBy: { invitation_created_at: "desc" },
        take: 12,
        select: {
          invitation_uuid: true,
          candidate_id: true,
          invitation_status: true,
          invitation_created_at: true,
          candidate: { select: { candidate_name: true } },
          request: { select: { request_uuid: true, request_position_title: true, company: { select: { company_name: true } } } }
        }
      }),
      prisma.candidate_working_hour_appeal.findMany({
        where: { ...scopedCandidateWhere, status: { in: [0, 1] } },
        orderBy: { updated_at: "desc" },
        take: 8,
        select: {
          appeal_uuid: true,
          candidate_id: true,
          reason: true,
          status: true,
          updated_at: true,
          created_at: true,
          candidate: { select: { candidate_name: true } }
        }
      }),
      prisma.candidate_warning.findMany({
        where: scopedCandidateWhere,
        orderBy: { created_at: "desc" },
        take: 8,
        select: {
          warning_id: true,
          candidate_id: true,
          title: true,
          message: true,
          created_at: true,
          candidate: { select: { candidate_name: true } }
        }
      })
    ]);

  const [fallbackCandidates, fallbackCompanies, fallbackTransfers, fallbackInvoices, fallbackIdRequests] = candidateIds.length
    ? await prisma.$transaction([
        prisma.candidate.count({ where: { deleted: 0 } }),
        prisma.company.count({ where: { deleted: 0 } }),
        prisma.transfer.count({ where: { deleted: 0 } }),
        prisma.invoice.count({ where: { deleted: 0 } }),
        prisma.candidate_id_request.count()
      ])
    : await prisma.$transaction([
        prisma.candidate.count({ where: { deleted: 0 } }),
        prisma.company.count({ where: { deleted: 0 } }),
        prisma.transfer.count({ where: { deleted: 0 } }),
        prisma.invoice.count({ where: { deleted: 0 } }),
        prisma.candidate_id_request.count()
      ]);

  const activity = [
    ...recentWorkLogs.map((item) => ({
      id: item.candidate_working_hour_uuid,
      type: "Work log",
      title: item.candidate?.candidate_name ?? "Candidate",
      subtitle: item.store?.store_name ?? "No store",
      meta: `${item.total_time ?? 0} min · Status ${item.status ?? 0}`,
      sortDate: item.updated_at ?? item.date,
      href: `/staff/candidates?candidate=${item.candidate_id ?? ""}`
    })),
    ...recentInvitations.map((item) => ({
      id: item.invitation_uuid,
      type: "Invitation",
      title: item.candidate?.candidate_name ?? "Candidate",
      subtitle: item.request.company?.company_name ?? item.request.request_position_title ?? "Request",
      meta: `Status ${item.invitation_status ?? 0}`,
      sortDate: item.invitation_created_at,
      href: `/staff/requests/${item.request.request_uuid}`
    })),
    ...pendingAppeals.map((item) => ({
      id: item.appeal_uuid,
      type: "Appeal",
      title: item.candidate?.candidate_name ?? "Candidate",
      subtitle: item.reason?.slice(0, 96) ?? "Work-log appeal",
      meta: `Status ${item.status}`,
      sortDate: item.updated_at ?? item.created_at,
      href: `/staff/candidates?candidate=${item.candidate_id}`
    })),
    ...warnings.map((item) => ({
      id: item.warning_id,
      type: "Warning",
      title: item.candidate?.candidate_name ?? "Candidate",
      subtitle: item.title ?? item.message.slice(0, 96),
      meta: formatDate(item.created_at),
      sortDate: item.created_at,
      href: `/staff/candidates?candidate=${item.candidate_id ?? ""}`
    }))
  ]
    .sort((a, b) => (b.sortDate?.getTime() ?? 0) - (a.sortDate?.getTime() ?? 0))
    .slice(0, 16)
    .map((item) => ({ ...item, sortDate: undefined, meta: item.meta || formatDate(item.sortDate) }));

  const needsDecision = rows
    .filter((row) => row.priorityScore > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 8);
  const active = rows.filter((row) => row.candidateStatus === 10 && row.approved !== 0).slice(0, 8);
  const recentlyUpdated = rows.slice(0, 8);
  const quiet = rows
    .filter((row) => row.priorityScore === 0 && row.candidateStatus !== 10)
    .slice(0, 8);

  return {
    ...directory,
    selected,
    selectedId,
    activity,
    staffOS: {
      tabs: [
        { label: "Candidates", value: rows.length, href: "/staff/candidates", active: true },
        { label: "Requests", value: requestCount, href: "/staff/requests", active: false },
        { label: "Time", value: workLogCount, href: "/staff/candidates#time", active: false },
        { label: "Pay", value: unpaidCandidateCount, href: "/staff/candidates#pay", active: false },
        { label: "Invoices", value: invoiceCount, href: "/staff/candidates#invoices", active: false },
        { label: "ID Cards", value: idRequestCount, href: "/staff/candidates#id-cards", active: false }
      ],
      quickStats: [
        { label: "Requests", value: requestCount, note: "Assigned hiring demand" },
        { label: "Applications", value: applicationCount, note: "Candidates in request pipeline" },
        { label: "Interviews", value: interviewCount, note: "Scheduled or imported interviews" },
        { label: "Stories", value: storyCount, note: "Legacy fulfillment stories" },
        { label: "Time Logs", value: workLogCount, note: "Candidate tracked shifts in scope" },
        { label: "Open Appeals", value: appealCount, note: "Time disputes needing review" },
        { label: "Payout Rows", value: transferCandidateCount, note: "Candidate transfer rows in scope" },
        { label: "Unpaid", value: unpaidCandidateCount, note: "Transfer candidate rows not paid" }
      ],
      workflows: [
        {
          id: "requests",
          title: "Staff hiring pipeline",
          subtitle: "Requests, applications, interviews, stories",
          metric: requestCount,
          href: "/staff/requests",
          rows: recentRequests.map((request) => ({
            id: request.request_uuid,
            title: request.request_position_title ?? "Untitled request",
            subtitle: request.company?.company_name ?? "No company",
            meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats · ${formatDate(request.request_updated_datetime)}`,
            href: `/staff/requests/${request.request_uuid}`
          }))
        },
        {
          id: "time",
          title: "Candidate time tracking",
          subtitle: "Clocked shifts, pending approvals, appeals",
          metric: workLogCount,
          href: "/staff/candidates#time",
          rows: recentWorkLogs.slice(0, 5).map((log) => ({
            id: log.candidate_working_hour_uuid,
            title: log.candidate?.candidate_name ?? "Candidate",
            subtitle: log.store?.store_name ?? "No store",
            meta: `${log.total_time ?? 0} min · Status ${log.status ?? 0} · ${formatDate(log.date)}`
          }))
        },
        {
          id: "pay",
          title: "Pay candidates",
          subtitle: "Transfer rows, paid state, candidate totals",
          metric: unpaidCandidateCount,
          href: "/staff/candidates#pay",
          rows: recentTransfers.map((transfer) => ({
            id: transfer.tc_id,
            title: transfer.candidate?.candidate_name ?? "Candidate payout",
            subtitle: transfer.company?.company_name ?? "No company",
            meta: `${transfer.paid ? "Paid" : "Unpaid"} · ${formatMoney(transfer.candidate_total, transfer.currency_code ?? "KWD")}`
          }))
        },
        {
          id: "invoices",
          title: "Company invoices",
          subtitle: "Invoice records generated from transfers",
          metric: invoiceCount,
          href: "/staff/candidates#invoices",
          rows: recentTransfers.map((transfer) => ({
            id: `invoice-${transfer.tc_id}`,
            title: transfer.company?.company_name ?? "Company invoice",
            subtitle: transfer.candidate?.candidate_name ?? "Candidate",
            meta: formatMoney(transfer.company_total, transfer.currency_code ?? "KWD")
          }))
        },
        {
          id: "id-cards",
          title: "ID cards and PDFs",
          subtitle: "Civil ID batches and printable document queue",
          metric: idRequestCount || fallbackIdRequests,
          href: "/staff/candidates#id-cards",
          rows: recentIdRequests.map((request) => ({
            id: request.cir_uuid,
            title: `ID batch ${request.cir_uuid.slice(0, 12)}`,
            subtitle: `${parseCandidateIds(request.candidate_ids).length} candidates`,
            meta: `${request.status ?? "pending"} · ${formatDate(request.updated_at ?? request.created_at)}`
          }))
        }
      ],
      estate: [
        { label: "Candidates", value: fallbackCandidates, note: "Total imported" },
        { label: "Companies", value: fallbackCompanies, note: "Employer accounts" },
        { label: "Transfers", value: fallbackTransfers, note: "Payroll batches" },
        { label: "Invoices", value: fallbackInvoices, note: "Legacy invoice rows" }
      ]
    },
    lanes: [
      {
        id: "decision",
        title: "Needs staff decision",
        note: "Approval, profile, civil ID, or status exceptions",
        rows: needsDecision
      },
      { id: "active", title: "Active assignments", note: "Approved candidates in active status", rows: active },
      { id: "recent", title: "Recently changed", note: "Newest candidate updates in your scope", rows: recentlyUpdated },
      { id: "watch", title: "Watch list", note: "Non-active candidates without open flags", rows: quiet }
    ],
    actionPlan: buildStaffCandidateActionPlan(selected)
  };
}

export async function getStaffCandidateDetail(staffId: number, candidateId: number) {
  const hasAccess = await canStaffAccessCandidate(staffId, candidateId);
  if (!hasAccess) return null;
  return getCandidateDetail(candidateId);
}

export async function getCandidateIdsForStaff(staffId: number) {
  const rows = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 500,
    select: { candidate_id: true }
  });
  return rows.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));
}

async function canStaffAccessCandidate(staffId: number, candidateId: number) {
  const row = await prisma.candidate_work_history.findFirst({
    where: { staff_id: staffId, candidate_id: candidateId },
    select: { id: true }
  });
  return Boolean(row);
}

function buildStaffCandidateActionPlan(detail: Awaited<ReturnType<typeof getCandidateDetail>> | null) {
  const candidate = detail?.candidate;
  if (!candidate) return [];

  const actions = [
    candidate.approved === 0
      ? {
          title: "Review approval",
          subtitle: "Candidate is still waiting on a staff decision.",
          priority: "Critical"
        }
      : null,
    candidate.is_incomplete_profile
      ? {
          title: "Complete profile",
          subtitle: "Legacy profile completeness is flagged incomplete.",
          priority: "High"
        }
      : null,
    candidate.candidate_civil_need_verification
      ? {
          title: "Resolve civil ID",
          subtitle: "Civil ID verification is still marked as required.",
          priority: "High"
        }
      : null,
    detail.workHours.length
      ? {
          title: "Audit recent work logs",
          subtitle: `${detail.workHours.length} imported work-log records are visible for review.`,
          priority: "Ops"
        }
      : null,
    detail.invitations.length
      ? {
          title: "Follow up invitations",
          subtitle: `${detail.invitations.length} recent invitations are attached to this profile.`,
          priority: "Pipeline"
        }
      : null,
    detail.warnings.length
      ? {
          title: "Check warnings",
          subtitle: `${detail.warnings.length} warning records were imported from the legacy staff app.`,
          priority: "Risk"
        }
      : null
  ].filter((action): action is { title: string; subtitle: string; priority: string } => Boolean(action));

  return actions.length
    ? actions.slice(0, 6)
    : [
        {
          title: "Keep candidate warm",
          subtitle: "No open profile, approval, civil ID, invitation, or warning action is visible in the current slice.",
          priority: "Clear"
        }
      ];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseCandidateIds(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}
