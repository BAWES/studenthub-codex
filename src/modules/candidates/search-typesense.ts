/**
 * Typesense-powered candidate search adapter.
 *
 * Matches the same return shapes as search.ts (getCandidateSearchWorkspace)
 * but queries Typesense instead of MySQL/Prisma for the main search.
 *
 * Fallback: if Typesense is down or has no documents, falls back to the
 * MySQL-based search automatically.
 */

import { getTypesenseClient, CANDIDATES_COLLECTION, type CandidateDocument, isTypesenseAvailable } from "@/lib/typesense";
import { prisma } from "@/lib/prisma";
import { getCandidateDetail } from "@/modules/candidates/candidate-detail";
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

  // Quick health check with 60s cache — avoids 1s timeout on every SSR request
  // when Typesense is simply not running (e.g. CI, local dev).
  const available = await isTypesenseAvailable();
  if (!available) return null;

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
        query_by_weights: "4,1,1,1,1,2,3",
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
