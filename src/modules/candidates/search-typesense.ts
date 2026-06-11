/**
 * Typesense-powered candidate search adapter.
 *
 * Matches the same return shapes as search.ts (getCandidateSearchWorkspace)
 * but queries Typesense instead of MySQL/Prisma for the main search.
 *
 * Fallback: if Typesense is down or has no documents, falls back to the
 * MySQL-based search automatically.
 */

import { getTypesenseClient, CANDIDATES_COLLECTION, type CandidateDocument } from "@/lib/typesense";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import type { CandidateSearchRow, CandidateSearchParams, CandidateSearchFacet, CandidateSearchFilter } from "./search";
import { candidateIdsForStaff, buildSelectedActions, uniqueCandidateIds } from "./search";

// Re-exported from search.ts for page compatibility
export { parseFilter, parseCandidateId, parseCandidateIds, parseSearchPage } from "./search";

// Exported for testing
export { buildFlags, buildTypesenseFacets, resolveSelectedCandidateId };

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function getCandidateSearchWorkspaceTypesense(params: CandidateSearchParams) {
  const query = params.query?.trim() ?? "";
  const filter = params.filter ?? "all";
  const visibility = params.role === "staff" ? params.visibility ?? "all" : "all";
  const staffCandidateIds = params.role === "staff" ? await candidateIdsForStaff(params.staffId ?? 0) : null;
  const scopedCandidateIds = params.role === "staff" && visibility === "assigned" ? staffCandidateIds : null;

  // Try Typesense first
  const tsResult = await searchTypesense({ query, filter, params, scopedCandidateIds, visibility });

  if (tsResult) {
    return tsResult;
  }

  // Fallback to MySQL
  const { getCandidateSearchWorkspace } = await import("./search");
  return getCandidateSearchWorkspace(params);
}

// ---------------------------------------------------------------------------
// Typesense search
// ---------------------------------------------------------------------------

async function searchTypesense({
  query,
  filter,
  params,
  scopedCandidateIds,
  visibility,
}: {
  query: string;
  filter: CandidateSearchFilter;
  params: CandidateSearchParams;
  scopedCandidateIds: number[] | null;
  visibility: string;
}): Promise<any> {
  const client = getTypesenseClient();

  // Health check
  try {
    const health = await client.health.retrieve();
    if (!health.ok) return null;
  } catch {
    return null;
  }

  // Verify collection exists and has docs
  try {
    const coll = await client.collections(CANDIDATES_COLLECTION).retrieve();
    if (!coll.num_documents || coll.num_documents === 0) return null;
  } catch {
    return null;
  }

  // ---- Build filter expression ----
  const filterByParts: string[] = [];

  if (scopedCandidateIds) {
    filterByParts.push(`candidate_id: [${scopedCandidateIds.join(",")}]`);
  }

  if (filter === "active") {
    filterByParts.push("candidate_status: 10 && approved: != 0");
  } else if (filter === "needs-review") {
    filterByParts.push("approved: 0");
  } else if (filter === "incomplete") {
    filterByParts.push("is_incomplete_profile: true");
  } else if (filter === "civil-id") {
    filterByParts.push("candidate_civil_need_verification: true");
  }

  if (params.country) filterByParts.push(`country_id: ${params.country}`);
  if (params.university) filterByParts.push(`university_id: ${params.university}`);
  if (params.company) filterByParts.push(`company_id: ${params.company}`);
  if (params.skill) filterByParts.push(`skills: [${params.skill}]`);
  if (params.gender) filterByParts.push(`candidate_gender: ${params.gender}`);
  if (params.profile === "complete") filterByParts.push("is_incomplete_profile: false");
  else if (params.profile === "incomplete") filterByParts.push("is_incomplete_profile: true");
  if (params.assignment === "assigned") filterByParts.push("store_id: != 0");
  else if (params.assignment === "unassigned") filterByParts.push("store_id: 0");
  if (params.document === "resume") filterByParts.push("has_resume: true");
  else if (params.document === "no-resume") filterByParts.push("has_resume: false");
  else if (params.document === "civil-id") filterByParts.push("candidate_civil_need_verification: true");

  const filterBy = filterByParts.length > 0 ? filterByParts.join(" && ") : undefined;
  const searchQuery = query || "*";

  // ---- Execute search ----
  const searchResult = await client
    .collections(CANDIDATES_COLLECTION)
    .documents()
    .search(
      {
        q: searchQuery,
        query_by: "candidate_name,candidate_name_ar,candidate_email,candidate_phone,candidate_uid,skills,tags",
        filter_by: filterBy,
        facet_by: "country_name,university_name,company_name,skills,candidate_gender",
        max_facet_values: 25,
        sort_by: "candidate_updated_at:desc",
        per_page: 60,
        page: params.page ?? 1,
      },
      {},
    );

  const hits = searchResult.hits ?? [];
  const found = searchResult.found ?? 0;
  const facetCounts = searchResult.facet_counts ?? [];

  // ---- Build rows ----
  const rows: CandidateSearchRow[] = hits.map((hit: any) => {
    const doc = hit.document as CandidateDocument;
    const flags = buildFlags(doc);
    const score =
      (doc.approved === 0 ? 42 : 0) +
      (doc.is_incomplete_profile ? 28 : 0) +
      (doc.candidate_civil_need_verification ? 22 : 0) +
      (doc.candidate_status !== 10 ? 10 : 0) +
      Math.min(doc.skills.length * 3, 12);

    return {
      id: doc.candidate_id as number,
      uid: doc.candidate_uid || `#${doc.candidate_id}`,
      name: doc.candidate_name,
      email: doc.candidate_email,
      phone: doc.candidate_phone || "No phone",
      status: doc.approved === 0 ? "Needs review" : doc.candidate_status === 10 ? "Active" : `Status ${doc.candidate_status}`,
      signal:
        doc.approved === 0
          ? "Approval decision"
          : doc.is_incomplete_profile
            ? "Profile cleanup"
            : doc.candidate_civil_need_verification
              ? "Civil ID review"
              : doc.candidate_status === 10
                ? "Ready"
                : "Watch",
      country: doc.country_name || "No country",
      university: doc.university_name || "No university",
      company: doc.company_name || "No company",
      store: doc.store_name || "No store",
      rate: formatMoney(doc.candidate_hourly_rate, doc.currency_code || "KWD"),
      updated: formatDate(new Date(doc.candidate_updated_at * 1000)),
      flags,
      skills: doc.skills,
      score,
    };
  });

  // ---- Metrics (from MySQL -- fast counts) ----
  const scopeWhere = scopedCandidateIds ? { candidate_id: { in: scopedCandidateIds } } : {};
  const [total, active, needsReview, incompleteStatus, civilIdCount] = await prisma.$transaction([
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, candidate_status: 10, approved: { not: 0 } } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, approved: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, is_incomplete_profile: true } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, candidate_civil_need_verification: true } }),
  ]);
  const metrics = [
    { label: "Candidates", value: total, note: "Visible to this login" },
    { label: "Active", value: active, note: "Approved and active" },
    { label: "Needs review", value: needsReview, note: "Approval queue" },
    { label: "Incomplete", value: incompleteStatus, note: "Profile cleanup" },
    { label: "Civil ID", value: civilIdCount, note: "Document review" },
  ];

  // ---- Facets ----
  const facets = buildTypesenseFacets(facetCounts, params);

  // ---- Selected candidate ----
  const selectedId = await resolveSelectedCandidateId({
    requestedId: params.candidateId,
    rows,
    scopedCandidateIds,
  });

  const selected = selectedId
    ? await getCandidateDetail(selectedId, params.role === "admin" ? "/admin/requests" : "/staff/requests")
    : null;

  // ---- Open tabs ----
  const openTabIds = uniqueCandidateIds([...(params.tabIds ?? []), ...(selectedId ? [selectedId] : [])]).slice(0, 8);
  const openTabs = openTabIds.length
    ? await prisma.candidate.findMany({
        where: {
          deleted: 0,
          candidate_id: { in: openTabIds },
          ...(scopedCandidateIds ? { candidate_id: { in: scopedCandidateIds } } : {}),
        },
        select: { candidate_id: true, candidate_name: true, candidate_email: true, approved: true, candidate_status: true },
      })
    : [];

  const orderedTabs = openTabIds
    .map((id: number) => openTabs.find((tab) => tab.candidate_id === id))
    .filter((tab): tab is NonNullable<(typeof openTabs)[number]> => Boolean(tab))
    .map((tab): { id: number; title: string; subtitle: string; status: string } => ({
      id: tab.candidate_id,
      title: tab.candidate_name,
      subtitle: tab.candidate_email,
      status: tab.approved === 0 ? "Needs review" : tab.candidate_status === 10 ? "Active" : `Status ${tab.candidate_status}`,
    }));

  return {
    role: params.role,
    query,
    filter,
    visibility,
    page: params.page ?? 1,
    totalPages: Math.max(1, Math.ceil(found / 60)),
    assignedCount: scopedCandidateIds?.length ?? null,
    matchingCount: found,
    selectedId,
    selectedBlocked: Boolean(params.candidateId && !selectedId),
    openTabs: orderedTabs,
    params: {
      country: params.country ?? "",
      university: params.university ?? "",
      company: params.company ?? "",
      skill: params.skill ?? "",
      gender: params.gender ?? "",
      profile: params.profile ?? "",
      assignment: params.assignment ?? "",
      document: params.document ?? "",
    },
    rows,
    metrics,
    facets,
    source: {
      current: "Typesense",
      target: "Typesense",
      note: "Powered by Typesense search engine on port 8108.",
    },
    selected,
    selectedActions: buildSelectedActions(params.role, selected?.candidate ?? null),
  };
}

// ---------------------------------------------------------------------------
// Facet builder
// ---------------------------------------------------------------------------

function buildTypesenseFacets(facetCounts: any[], params: CandidateSearchParams): CandidateSearchFacet[] {
  const result: CandidateSearchFacet[] = [];

  // Parse facet counts from Typesense response into a lookup
  const facetMap = new Map<string, { label: string; value: string; count: number }[]>();
  for (const fc of facetCounts) {
    const key = fc.field_name;
    const options = (fc.counts ?? []).map((c: any) => ({
      label: String(c.value),
      value: String(c.value),
      count: c.count,
    }));
    if (options.length > 0) {
      facetMap.set(key, options);
    }
  }

  // Gender (numeric -> label)
  const genderOpts = (facetMap.get("candidate_gender") ?? []).map((o) => ({
    ...o,
    label: o.value === "1" ? "Male" : o.value === "2" ? "Female" : o.value === "3" ? "Other" : "Not set",
    active: o.value === params.gender,
  }));
  if (genderOpts.length > 0) {
    result.push({ key: "gender", label: "Gender", options: genderOpts });
  }

  // Static facets that the existing UI expects (profile, assignment, document)
  result.push({
    key: "profile",
    label: "Profile",
    options: [
      { label: "Complete", value: "complete", count: 0, active: params.profile === "complete" },
      { label: "Incomplete", value: "incomplete", count: 0, active: params.profile === "incomplete" },
    ],
  });

  result.push({
    key: "assignment",
    label: "Assignment",
    options: [
      { label: "Assigned", value: "assigned", count: 0, active: params.assignment === "assigned" },
      { label: "Unassigned", value: "unassigned", count: 0, active: params.assignment === "unassigned" },
    ],
  });

  result.push({
    key: "document",
    label: "Documents",
    options: [
      { label: "Has resume", value: "resume", count: 0, active: params.document === "resume" },
      { label: "No resume", value: "no-resume", count: 0, active: params.document === "no-resume" },
      { label: "Civil ID review", value: "civil-id", count: 0, active: params.document === "civil-id" },
    ],
  });

  // Country
  const countryOpts = (facetMap.get("country_name") ?? []).map((o) => ({
    ...o,
    active: o.value === params.country,
  }));
  if (countryOpts.length > 0) {
    result.push({ key: "country", label: "Country", options: countryOpts });
  }

  // University
  const uniOpts = (facetMap.get("university_name") ?? []).map((o) => ({
    ...o,
    active: o.value === params.university,
  }));
  if (uniOpts.length > 0) {
    result.push({ key: "university", label: "University", options: uniOpts });
  }

  // Company
  const companyOpts = (facetMap.get("company_name") ?? []).map((o) => ({
    ...o,
    active: o.value === params.company,
  }));
  if (companyOpts.length > 0) {
    result.push({ key: "company", label: "Company", options: companyOpts });
  }

  // Skills
  const skillsOpts = (facetMap.get("skills") ?? []).map((o) => ({
    ...o,
    active: o.value === params.skill,
  }));
  if (skillsOpts.length > 0) {
    result.push({ key: "skill", label: "Skills", options: skillsOpts });
  }

  return result.filter((f) => f.options.length > 0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFlags(doc: CandidateDocument): string[] {
  const flags: string[] = [];
  if (doc.approved === 0) flags.push("Needs review");
  if (doc.is_incomplete_profile) flags.push("Incomplete");
  if (doc.candidate_civil_need_verification) flags.push("Civil ID");
  if (doc.candidate_status !== 10) flags.push(`Status ${doc.candidate_status}`);
  return flags;
}

async function resolveSelectedCandidateId({
  requestedId,
  rows,
  scopedCandidateIds,
}: {
  requestedId?: number;
  rows: CandidateSearchRow[];
  scopedCandidateIds: number[] | null;
}): Promise<number | undefined> {
  if (!requestedId) return undefined;
  if (scopedCandidateIds && !scopedCandidateIds.includes(requestedId)) return undefined;

  const foundInRows = rows.some((r) => r.id === requestedId);
  if (foundInRows) return requestedId;

  const db = await prisma.candidate.findFirst({
    where: { candidate_id: requestedId, deleted: 0 },
    select: { candidate_id: true },
  });
  return db?.candidate_id ?? undefined;
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
