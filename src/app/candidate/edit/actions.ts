"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
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

import {
  updatePersonalInfoSchema,
  updateProfileFieldsSchema,
  type UpdatePersonalInfoInput,
  type UpdateProfileFieldsInput,
  type CandidateProfileEditData,
  type ProfileActionResult,
  parseDate,
  parseDrivingLicense,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate row to the edit-profile API shape. */
function toProfileData(
  row: Awaited<ReturnType<typeof prisma.candidate.findUnique>>,
): CandidateProfileEditData | null {
  if (!row) return null;
  return {
    candidateName: row.candidate_name,
    candidateNameAr: row.candidate_name_ar,
    candidateEmail: row.candidate_email,
    candidatePhone: row.candidate_phone,
    candidateObjective: row.candidate_objective,
    candidateIntro: row.candidate_intro,
    candidateCivilId: row.candidate_civil_id,
    profileUrl: row.profile_url,
    candidateBirthDate: row.candidate_birth_date,
    candidateAddressLine1: row.candidate_address_line1,
    candidateGender: row.candidate_gender,
    candidateDrivingLicense: row.candidate_driving_license,
    candidateCivilExpiryDate: row.candidate_civil_expiry_date,
    candidatePreferredTime: row.candidate_preferred_time,
    countryId: row.country_id,
    universityId: row.university_id,
    bankId: row.bank_id,
    bankAccountName: row.bank_account_name,
    candidateIban: row.candidate_iban,
    candidatePersonalPhoto: row.candidate_personal_photo,
    candidateResume: row.candidate_resume,
    candidateVideo: row.candidate_video,
    civilPhotoFront: row.candidate_civil_photo_front,
    civilPhotoBack: row.candidate_civil_photo_back,
  };
}

// ---------------------------------------------------------------------------
// Data fetching — colocated from @/modules/candidates/actions
// ---------------------------------------------------------------------------

/**
 * Fetch the full candidate profile detail for the edit page.
 * Delegates to the existing data layer; colocated for the edit route.
 */
export async function getCandidateProfileEdit(input: { candidateId: number }) {
  return getCandidateDetail(Number(input.candidateId), "/candidate/invitations");
}

export async function getCountryOptions() {
  const rows = await prisma.country.findMany({
    orderBy: { country_name_en: "asc" },
    select: { country_id: true, country_name_en: true, country_nationality_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.country_id,
    label: `${r.country_name_en}${r.country_nationality_name_en && r.country_nationality_name_en !== r.country_name_en ? ` (${r.country_nationality_name_en})` : ""}`,
  }));
}

export async function getUniversityOptions() {
  const rows = await prisma.university.findMany({
    where: { deleted: 0 },
    orderBy: { university_name_en: "asc" },
    select: { university_id: true, university_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.university_id,
    label: r.university_name_en ?? `University #${r.university_id}`,
  }));
}

export async function getBankOptions() {
  const rows = await prisma.bank.findMany({
    where: { deleted: 0 },
    orderBy: { bank_name: "asc" },
    select: { bank_id: true, bank_name: true },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.bank_id,
    label: r.bank_name ?? `Bank #${r.bank_id}`,
  }));
}

export async function getDegreeOptions() {
  const rows = await prisma.degree.findMany({
    orderBy: { degree_name_en: "asc" },
    select: { degree_uuid: true, degree_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.degree_uuid,
    label: r.degree_name_en,
  }));
}

export async function getMajorOptions() {
  const rows = await prisma.major.findMany({
    orderBy: { major_name_en: "asc" },
    select: { major_uuid: true, major_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.major_uuid,
    label: r.major_name_en,
  }));
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * Get the candidate's full profile data for the edit form.
 * Mirrors the data loading in CandidateEditPage (getCandidateDetail).
 */
export async function getCandidateProfileForEdit(): Promise<CandidateProfileEditData | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const row = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
  });

  return toProfileData(row);
}

/**
 * Update personal info fields (name, email, phone, objective, intro, civilId, profileUrl).
 * Matches the fields exposed in the top section of CandidateEditForm.
 */
export async function updateCandidatePersonalInfo(
  data: UpdatePersonalInfoInput,
): Promise<ProfileActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updatePersonalInfoSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid personal info data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      candidate_name: d.name.trim(),
      candidate_name_ar: d.nameAr || undefined,
      candidate_email: d.email || undefined,
      candidate_phone: d.phone || undefined,
      candidate_objective: d.objective || undefined,
      candidate_intro: d.intro || undefined,
      candidate_civil_id: d.civilId || undefined,
      profile_url: d.profileUrl || undefined,
      candidate_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/candidate");

  return { success: true };
}

/**
 * Update additional profile fields (address, dates, gender, driving license, bank info, etc.).
 * Matches the secondary field groups in CandidateEditForm.
 */
export async function updateCandidateProfileFields(
  data: UpdateProfileFieldsInput,
): Promise<ProfileActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateProfileFieldsSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile field data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      country_id: d.countryId
        ? Number(d.countryId)
        : null,
      university_id: d.universityId
        ? Number(d.universityId)
        : null,
      bank_id: d.bankId
        ? Number(d.bankId)
        : null,
      bank_account_name: d.bankAccountName || undefined,
      candidate_iban: d.iban || undefined,
      candidate_birth_date: parseDate(d.birthDate),
      candidate_address_line1: d.address || undefined,
      candidate_gender:
        d.gender !== null && d.gender !== "" ? Number(d.gender) : null,
      candidate_driving_license: parseDrivingLicense(d.drivingLicense),
      candidate_civil_expiry_date: parseDate(d.civilExpiry),
      candidate_preferred_time: d.preferredTime || undefined,
      candidate_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/candidate");

  return { success: true };
}
