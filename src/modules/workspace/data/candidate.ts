import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import { getNotificationTypeLabel } from "@/modules/notifications/utils";

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

export async function getCandidateWorkLogRows(candidateId: number) {
  const rows = await prisma.candidate_working_hour.findMany({
    where: { candidate_id: candidateId },
    orderBy: { date: "desc" },
    take: 80,
    select: {
      candidate_working_hour_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      via: true,
      note: true,
      store: { select: { store_name: true, company: { select: { company_name: true } } } }
    }
  });

  return rows.map((row) => ({
    id: row.candidate_working_hour_uuid,
    date: formatDate(row.date),
    store: row.store?.store_name ?? "No store",
    company: row.store?.company?.company_name ?? "No company",
    total: `${row.total_time ?? 0} minutes`,
    status: `Status ${row.status ?? 0}`,
    via: row.via ?? "Not set",
    note: row.note?.slice(0, 120) ?? ""
  }));
}

export async function getCandidateWorkLogDetail(candidateId: number, workLogUuid: string) {
  const [workLog, appeals, feedback] = await prisma.$transaction([
    prisma.candidate_working_hour.findFirst({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
        start_location_lat: true,
        start_location_long: true,
        end_location_lat: true,
        end_location_long: true,
        created_at: true,
        updated_at: true,
        store: { select: { store_name: true, store_location: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.candidate_working_hour_appeal.findMany({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { appeal_uuid: true, reason: true, status: true, created_at: true }
    }),
    prisma.candidate_work_log_feedback.findMany({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { cwlf_uuid: true, note: true, reason: true, status: true, rating: true, created_at: true }
    })
  ]);

  return {
    workLog,
    metrics: [
      { label: "Total", value: `${workLog?.total_time ?? 0} minutes`, note: "Imported total time" },
      { label: "Status", value: `Status ${workLog?.status ?? 0}`, note: workLog?.via ?? "No source" },
      { label: "Appeals", value: appeals.length, note: "Appeal records linked to this log" },
      { label: "Feedback", value: feedback.length, note: "Feedback records linked to this log" }
    ],
    appeals: appeals.map((appeal) => ({
      id: appeal.appeal_uuid,
      title: `Status ${appeal.status}`,
      subtitle: appeal.reason?.slice(0, 180) ?? "No reason",
      meta: formatDate(appeal.created_at)
    })),
    feedback: feedback.map((item) => ({
      id: item.cwlf_uuid,
      title: item.reason ?? `Status ${item.status ?? 0}`,
      subtitle: item.note?.slice(0, 180) ?? "No note",
      meta: `${item.rating === true ? "Positive" : item.rating === false ? "Negative" : "No rating"} · ${formatDate(item.created_at)}`
    }))
  };
}

export async function getCandidateTransferRows(candidateId: number) {
  const rows = await prisma.transfer_candidate.findMany({
    where: { candidate_id: candidateId, deleted: 0 },
    orderBy: { tc_updated_at: "desc" },
    take: 80,
    select: {
      tc_id: true,
      transfer_id: true,
      candidate_total: true,
      company_total: true,
      transfer_cost: true,
      hours: true,
      minutes: true,
      paid: true,
      currency_code: true,
      tc_updated_at: true,
      company: { select: { company_name: true } },
      store: { select: { store_name: true } },
      transfer: {
        select: {
          transfer_status: true,
          start_date: true,
          end_date: true,
          payment_received_on: true,
          currency_code: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.tc_id,
    transferId: row.transfer_id,
    company: row.company?.company_name ?? row.store?.store_name ?? "No company",
    period: row.transfer?.start_date
      ? `${formatDate(row.transfer.start_date)} to ${formatDate(row.transfer.end_date)}`
      : "No period",
    hours: `${row.hours ?? 0}h ${row.minutes ?? 0}m`,
    candidateTotal: formatMoney(row.candidate_total, row.currency_code ?? row.transfer?.currency_code ?? "KWD"),
    companyTotal: formatMoney(row.company_total, row.currency_code ?? row.transfer?.currency_code ?? "KWD"),
    cost: formatMoney(row.transfer_cost, row.currency_code ?? row.transfer?.currency_code ?? "KWD"),
    paid: row.paid ? "Paid" : "Unpaid",
    transferStatus: `Transfer status ${row.transfer?.transfer_status ?? 0}`,
    paymentDate: row.transfer?.payment_received_on
      ? formatDate(row.transfer.payment_received_on)
      : "Not received",
    updated: formatDate(row.tc_updated_at),
  }));
}

export async function getCandidateTransferDetail(tcId: number, candidateId: number) {
  const tc = await prisma.transfer_candidate.findFirst({
    where: { tc_id: tcId, deleted: 0 },
    select: {
      tc_id: true,
      candidate_id: true,
      transfer_id: true,
      candidate_total: true,
      company_total: true,
      transfer_cost: true,
      hours: true,
      minutes: true,
      paid: true,
      currency_code: true,
      candidate_hourly_rate: true,
      company_hourly_rate: true,
      bonus: true,
      transfer_benef_name: true,
      transfer_benef_iban: true,
      tc_created_at: true,
      tc_updated_at: true,
      store: { select: { store_name: true } },
      company: { select: { company_name: true } },
      bank: { select: { bank_name: true } },
      transfer: {
        select: {
          transfer_id: true,
          transfer_status: true,
          start_date: true,
          end_date: true,
          payment_received_on: true,
          transfer_created_at: true,
          currency_code: true,
          invoice: {
            where: { deleted: 0 },
            orderBy: { invoice_date: "desc" },
            select: { invoice_id: true, invoice_date: true, invoice_status: true },
          },
        },
      },
    },
  });

  if (!tc || tc.candidate_id !== candidateId) return null;

  const t = tc.transfer;
  const currency = tc.currency_code ?? t?.currency_code ?? "KWD";

  return {
    transferCandidate: {
      id: tc.tc_id,
      transferId: tc.transfer_id,
      company: tc.company?.company_name ?? "No company",
      store: tc.store?.store_name ?? null,
      hours: `${tc.hours ?? 0}h ${tc.minutes ?? 0}m`,
      hourlyRate: formatMoney(tc.candidate_hourly_rate, currency),
      candidateTotal: formatMoney(tc.candidate_total, currency),
      companyTotal: formatMoney(tc.company_total, currency),
      cost: formatMoney(tc.transfer_cost, currency),
      bonus: formatMoney(tc.bonus, currency),
      paid: tc.paid ? "Paid" : "Unpaid",
      beneficiary: tc.transfer_benef_name ?? null,
      iban: tc.transfer_benef_iban ?? null,
      bank: tc.bank?.bank_name ?? null,
      created: formatDate(tc.tc_created_at),
      updated: formatDate(tc.tc_updated_at),
    },
    transfer: t
      ? {
          id: t.transfer_id,
          status: t.transfer_status,
          period: t.start_date
            ? `${formatDate(t.start_date)} to ${formatDate(t.end_date)}`
            : "No period",
          paymentReceived: formatDate(t.payment_received_on),
          created: formatDate(t.transfer_created_at),
        }
      : null,
    invoices: (t?.invoice ?? []).map((inv: { invoice_id: number; invoice_date: Date | null; invoice_status: string | null }) => ({
      id: inv.invoice_id,
      title: `Invoice #${inv.invoice_id}`,
      subtitle: `${inv.invoice_status ?? "No status"}`,
      meta: formatDate(inv.invoice_date),
    })),
  };
}

// ---------------------------------------------------------------------------
// Candidate IDs for Staff (shared between staff and candidate modules)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Candidate Notification Rows
// ---------------------------------------------------------------------------

export type NotificationRow = {
  id: string;
  type: string;
  typeCode: number;
  message: string;
  isNew: string;
  created: string;
};

export async function getCandidateNotificationRows(candidateId: number): Promise<NotificationRow[]> {
  const rows = await prisma.candidate_notification.findMany({
    where: { candidate_id: candidateId },
    orderBy: { created_at: "desc" },
    take: 80,
    select: {
      cn_uuid: true,
      type: true,
      message: true,
      is_new: true,
      created_at: true,
    },
  });

  return rows.map((row) => ({
    id: row.cn_uuid,
    type: getNotificationTypeLabel(row.type),
    typeCode: row.type,
    message: row.message?.slice(0, 200) ?? "",
    isNew: row.is_new ? "Unread" : "Read",
    created: formatDate(row.created_at),
  }));
}

// ---------------------------------------------------------------------------
// Candidate Notification Detail
// ---------------------------------------------------------------------------

export type NotificationDetail = {
  notification: {
    cn_uuid: string;
    type: number;
    message: string | null;
    is_new: boolean | null;
    created_at: Date | null;
    updated_at: Date | null;
    invitation_uuid: string | null;
    request_uuid: string | null;
    company_id: number | null;
    store_id: number | null;
    staff_id: number | null;
  } | null;
  typeLabel: string;
};

export async function getCandidateNotificationDetail(
  candidateId: number,
  notificationUuid: string,
): Promise<NotificationDetail> {
  const notification = await prisma.candidate_notification.findFirst({
    where: { cn_uuid: notificationUuid, candidate_id: candidateId },
    select: {
      cn_uuid: true,
      type: true,
      message: true,
      is_new: true,
      created_at: true,
      updated_at: true,
      invitation_uuid: true,
      request_uuid: true,
      company_id: true,
      store_id: true,
      staff_id: true,
    },
  });

  return {
    notification,
    typeLabel: notification ? getNotificationTypeLabel(notification.type) : "",
  };
}

// ---------------------------------------------------------------------------
// Candidate working dates (schedule)
// ---------------------------------------------------------------------------

export type WorkingDateRow = {
  id: string;
  date: string;
  store: string;
  company: string;
  startTime: string;
  endTime: string;
  totalTime: string;
  status: string;
};

export type WorkingDateDetail = {
  cwd_uuid: string;
  date: Date;
  start_time: Date;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  store: { store_name: string | null; company: { company_name: string | null } | null } | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export const WORKING_DATE_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "Cancelled",
  3: "Completed",
};

export function workingDateStatusLabel(status: number | null): string {
  return status != null ? (WORKING_DATE_STATUS_LABELS[status] ?? `Status ${status}`) : "Unknown";
}

export async function getCandidateWorkingDateRows(candidateId: number): Promise<WorkingDateRow[]> {
  const rows = await prisma.candidate_working_date.findMany({
    where: { candidate_id: candidateId },
    orderBy: { date: "desc" },
    take: 80,
    select: {
      cwd_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      store: {
        select: { store_name: true, company: { select: { company_name: true } } },
      },
    },
  });

  return rows.map((row) => ({
    id: row.cwd_uuid,
    date: formatDate(row.date),
    store: row.store?.store_name ?? "No store",
    company: row.store?.company?.company_name ?? "No company",
    startTime: formatDate(row.start_time),
    endTime: formatDate(row.end_time),
    totalTime: row.total_time != null ? `${row.total_time} min` : "—",
    status: workingDateStatusLabel(row.status),
  }));
}

export async function getCandidateWorkingDateDetail(
  candidateId: number,
  cwdUuid: string,
): Promise<WorkingDateDetail | null> {
  const row = await prisma.candidate_working_date.findFirst({
    where: { cwd_uuid: cwdUuid, candidate_id: candidateId },
    select: {
      cwd_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      created_at: true,
      updated_at: true,
      store: {
        select: { store_name: true, company: { select: { company_name: true } } },
      },
    },
  });
  return row;
}
