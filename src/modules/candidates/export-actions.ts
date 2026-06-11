"use server";

import { requireCapability } from "@/modules/auth/session";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// CV / document bundle export
// ---------------------------------------------------------------------------

export async function exportCandidateBundle(formData: FormData) {
  const session = await requireCapability("document.export");

  const rawIds = String(formData.get("candidateIds") ?? "");
  const requestTitle = String(formData.get("requestTitle") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();

  const candidateIds = rawIds
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!candidateIds.length) {
    return new Response("No candidate IDs provided.", { status: 400 });
  }

  // Staff: only export candidates in their scope
  let scopedIds = candidateIds;
  if (session.role === "staff") {
    const staffId = Number(session.id);
    const accessRows = await prisma.candidate_work_history.findMany({
      where: {
        staff_id: staffId,
        candidate_id: { in: candidateIds },
      },
      select: { candidate_id: true },
    });
    const accessibleIds = new Set(
      accessRows
        .map((row) => row.candidate_id)
        .filter((id): id is number => Boolean(id)),
    );
    scopedIds = candidateIds.filter((id) => accessibleIds.has(id));

    if (!scopedIds.length) {
      return new Response(
        "None of the selected candidates are in your scope.",
        { status: 403 },
      );
    }
  }

  // Fetch full details for each candidate
  const details = await Promise.all(
    scopedIds.map((id) => getCandidateDetail(id)),
  );

  const html = renderExportHtml({
    details,
    requestTitle: requestTitle || undefined,
    companyName: companyName || undefined,
    exportedBy: session.name,
    exportedAt: new Date().toISOString(),
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidate-cv-bundle-${new Date().toISOString().slice(0, 10)}.html"`,
    },
  });
}

// ---------------------------------------------------------------------------
// HTML renderer
// ---------------------------------------------------------------------------

function renderExportHtml({
  details,
  requestTitle,
  companyName,
  exportedBy,
  exportedAt,
}: {
  details: Awaited<ReturnType<typeof getCandidateDetail>>[];
  requestTitle?: string;
  companyName?: string;
  exportedBy: string;
  exportedAt: string;
}) {
  const candidates = details.filter((d) => d.candidate !== null);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Candidate CV Bundle${requestTitle ? ` — ${escapeHtml(requestTitle)}` : ""}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1a1a2e;
    background: #fff;
    max-width: 210mm;
    margin: 0 auto;
    padding: 12mm 15mm;
  }

  .cover {
    text-align: center;
    padding: 18mm 0 12mm;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 10mm;
  }
  .cover h1 { font-size: 20pt; font-weight: 700; color: #0f172a; margin-bottom: 4mm; }
  .cover .meta { font-size: 10pt; color: #64748b; }
  .cover .meta span { display: inline-block; margin: 0 2mm; }
  .cover .context { margin-top: 6mm; font-size: 11pt; color: #334155; }
  .cover .context strong { color: #0f172a; }

  .candidate-section {
    page-break-inside: avoid;
    margin-bottom: 10mm;
    padding-bottom: 8mm;
    border-bottom: 1px solid #e2e8f0;
  }
  .candidate-section:last-child { border-bottom: none; }

  .candidate-header {
    display: flex;
    align-items: flex-start;
    gap: 4mm;
    margin-bottom: 4mm;
  }
  .candidate-avatar {
    width: 14mm;
    height: 14mm;
    border-radius: 50%;
    background: #6366f1;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14pt;
    font-weight: 700;
    flex-shrink: 0;
  }
  .candidate-title h2 { font-size: 14pt; font-weight: 700; color: #0f172a; }
  .candidate-title p { font-size: 9pt; color: #64748b; margin-top: 0.5mm; }

  .candidate-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5mm 6mm;
    margin: 3mm 0;
    font-size: 9pt;
  }
  .candidate-meta dt { font-weight: 600; color: #475569; }
  .candidate-meta dd { color: #1e293b; }

  .candidate-intro {
    font-size: 10pt;
    color: #334155;
    margin: 3mm 0;
    padding: 2.5mm 3mm;
    background: #f8fafc;
    border-left: 3px solid #6366f1;
    border-radius: 2px;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #334155;
    margin: 4mm 0 2mm;
    padding-bottom: 1mm;
    border-bottom: 1px solid #f1f5f9;
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5mm;
  }
  .skill-tag {
    font-size: 8.5pt;
    padding: 1mm 3mm;
    background: #eef2ff;
    color: #4338ca;
    border-radius: 3px;
    font-weight: 500;
  }

  .row-list { font-size: 9.5pt; }
  .row-item {
    padding: 1.5mm 0;
    border-bottom: 1px dotted #f1f5f9;
  }
  .row-item:last-child { border-bottom: none; }
  .row-item strong { display: block; color: #1e293b; }
  .row-item span { color: #64748b; font-size: 8.5pt; }

  .footer {
    text-align: center;
    font-size: 8pt;
    color: #94a3b8;
    margin-top: 8mm;
    padding-top: 4mm;
    border-top: 1px solid #e2e8f0;
  }

  @media print {
    body { padding: 8mm 12mm; }
    .candidate-section { page-break-inside: avoid; }
    @page { margin: 10mm; }
  }
</style>
</head>
<body>

<div class="cover">
  <h1>Candidate CV Bundle</h1>
  ${requestTitle ? `<div class="context"><strong>Request:</strong> ${escapeHtml(requestTitle)}</div>` : ""}
  ${companyName ? `<div class="context"><strong>Company:</strong> ${escapeHtml(companyName)}</div>` : ""}
  <div class="meta">
    <span>${candidates.length} candidate${candidates.length === 1 ? "" : "s"}</span>
    <span>Exported by ${escapeHtml(exportedBy)}</span>
    <span>${formatDate(new Date(exportedAt))}</span>
  </div>
</div>

${candidates
  .map((detail) => renderCandidateSection(detail))
  .join("\n")}

<div class="footer">
  Generated by StudentHub &middot; ${formatDate(new Date(exportedAt))}
</div>

</body>
</html>`;
}

function renderCandidateSection(
  detail: NonNullable<Awaited<ReturnType<typeof getCandidateDetail>>>,
) {
  const c = detail.candidate!;
  const initials = c.candidate_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return `
<div class="candidate-section">
  <div class="candidate-header">
    <div class="candidate-avatar">${escapeHtml(initials)}</div>
    <div class="candidate-title">
      <h2>${escapeHtml(c.candidate_name)}</h2>
      ${c.candidate_objective ? `<p>${escapeHtml(c.candidate_objective)}</p>` : ""}
    </div>
  </div>

  <dl class="candidate-meta">
    <dt>Email</dt><dd>${escapeHtml(c.candidate_email)}</dd>
    <dt>Phone</dt><dd>${escapeHtml(c.candidate_phone ?? "—")}</dd>
    <dt>Country</dt><dd>${escapeHtml(c.country?.country_name_en ?? "—")}</dd>
    <dt>University</dt><dd>${escapeHtml(c.university?.university_name_en ?? "—")}</dd>
    <dt>Status</dt><dd>${c.approved === 0 ? "Needs review" : c.candidate_status === 10 ? "Active" : `Status ${c.candidate_status}`}</dd>
    <dt>Rate</dt><dd>${escapeHtml(String(detail.metrics[1]?.value ?? "—"))}</dd>
  </dl>

  ${c.candidate_intro ? `<div class="candidate-intro">${escapeHtml(c.candidate_intro)}</div>` : ""}

  ${
    detail.skills.length
      ? `
  <h3>Skills</h3>
  <div class="skill-tags">
    ${detail.skills.map((s) => `<span class="skill-tag">${escapeHtml(s.title)}</span>`).join("")}
  </div>`
      : ""
  }

  ${
    detail.experiences.length
      ? `
  <h3>Experience</h3>
  <div class="row-list">
    ${detail.experiences
      .map(
        (e) => `
    <div class="row-item">
      <strong>${escapeHtml(e.title)}</strong>
      <span>${escapeHtml(e.subtitle)}${e.meta ? ` · ${escapeHtml(e.meta)}` : ""}</span>
    </div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${
    detail.education.length
      ? `
  <h3>Education</h3>
  <div class="row-list">
    ${detail.education
      .map(
        (e) => `
    <div class="row-item">
      <strong>${escapeHtml(e.title)}</strong>
      <span>${escapeHtml(e.subtitle)}${e.meta ? ` · ${escapeHtml(e.meta)}` : ""}</span>
    </div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${
    detail.certificates.length
      ? `
  <h3>Certificates</h3>
  <div class="row-list">
    ${detail.certificates
      .map(
        (cert) => `
    <div class="row-item">
      <strong>${escapeHtml(cert.title)}</strong>
      <span>${escapeHtml(cert.subtitle)}${cert.meta ? ` · ${escapeHtml(cert.meta)}` : ""}</span>
    </div>`,
      )
      .join("")}
  </div>`
      : ""
  }
</div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --- inlined from @/modules/workspace/data/candidate/detail.ts ---
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
