import type { Prisma } from "@prisma/client";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import { getCandidateDetail } from "@/modules/workspace/data";

export type CandidateSearchRole = "admin" | "staff";
export type CandidateSearchFilter = "all" | "active" | "needs-review" | "incomplete" | "civil-id";
export type CandidateSearchVisibility = "all" | "assigned";

export type CandidateSearchFacetKey = "country" | "university" | "company" | "skill";

export type CandidateSearchParams = {
  role: CandidateSearchRole;
  staffId?: number;
  query?: string;
  filter?: CandidateSearchFilter;
  visibility?: CandidateSearchVisibility;
  candidateId?: number;
  tabIds?: number[];
  country?: string;
  university?: string;
  company?: string;
  skill?: string;
};

export type CandidateSearchFacet = {
  key: CandidateSearchFacetKey;
  label: string;
  options: { label: string; value: string; count: number; active: boolean }[];
};

export type CandidateSearchRow = {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  signal: string;
  country: string;
  university: string;
  company: string;
  store: string;
  rate: string;
  updated: string;
  flags: string[];
  skills: string[];
  score: number;
};

export const candidateSearchFilters: { label: string; value: CandidateSearchFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Needs review", value: "needs-review" },
  { label: "Incomplete", value: "incomplete" },
  { label: "Civil ID", value: "civil-id" }
];

export async function getCandidateSearchWorkspace(params: CandidateSearchParams) {
  const query = params.query?.trim() ?? "";
  const filter = params.filter ?? "all";
  const visibility = params.role === "staff" ? params.visibility ?? "all" : "all";
  const staffCandidateIds = params.role === "staff" ? await candidateIdsForStaff(params.staffId ?? 0) : null;
  const scopedCandidateIds = params.role === "staff" && visibility === "assigned" ? staffCandidateIds : null;
  const scopeWhere = scopedCandidateIds ? candidateIdScope(scopedCandidateIds) : {};
  const facetParams = {
    country: parsePositiveInt(params.country),
    university: parsePositiveInt(params.university),
    company: parsePositiveInt(params.company),
    skill: params.skill?.trim() || undefined
  };
  const where = buildCandidateWhere({ scopeWhere, query, filter, ...facetParams });
  const facetWhere = buildCandidateWhere({ scopeWhere, query, filter });

  const [rows, metrics, facetRows] = await Promise.all([
    prisma.candidate.findMany({
      where,
      orderBy: [{ candidate_updated_at: "desc" }, { candidate_id: "desc" }],
      take: 60,
      select: candidateSearchSelect
    }),
    getCandidateSearchMetrics(scopeWhere),
    prisma.candidate.findMany({
      where: facetWhere,
      orderBy: { candidate_updated_at: "desc" },
      take: 500,
      select: {
        country_id: true,
        university_id: true,
        store: { select: { company_id: true, company: { select: { company_name: true } } } },
        country: { select: { country_name_en: true } },
        university: { select: { university_name_en: true } },
        candidate_skill: {
          where: { deleted: 0 },
          take: 6,
          select: { skill: true }
        }
      }
    })
  ]);

  const searchRows = rows.map(toCandidateSearchRow);
  const selectedId = await resolveSelectedCandidateId({
    requestedId: params.candidateId,
    rows: searchRows,
    scopedCandidateIds
  });
  const selected = selectedId
    ? await getCandidateDetail(selectedId, params.role === "admin" ? "/admin/requests" : "/staff/requests")
    : null;
  const openTabIds = uniqueCandidateIds([...(params.tabIds ?? []), ...(selectedId ? [selectedId] : [])]).slice(0, 8);
  const openTabs = openTabIds.length
    ? await prisma.candidate.findMany({
        where: {
          deleted: 0,
          candidate_id: { in: openTabIds },
          ...(scopedCandidateIds ? candidateIdScope(scopedCandidateIds) : {})
        },
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_email: true,
          approved: true,
          candidate_status: true
        }
      })
    : [];
  const orderedTabs = openTabIds
    .map((id) => openTabs.find((tab) => tab.candidate_id === id))
    .filter((tab): tab is NonNullable<(typeof openTabs)[number]> => Boolean(tab))
    .map((tab) => ({
      id: tab.candidate_id,
      title: tab.candidate_name,
      subtitle: tab.candidate_email,
      status: tab.approved === 0 ? "Needs review" : tab.candidate_status === 10 ? "Active" : `Status ${tab.candidate_status}`
    }));

  return {
    role: params.role,
    query,
    filter,
    visibility,
    assignedCount: staffCandidateIds?.length ?? null,
    selectedId,
    selectedBlocked: Boolean(params.candidateId && !selectedId),
    openTabs: orderedTabs,
    params: {
      country: params.country ?? "",
      university: params.university ?? "",
      company: params.company ?? "",
      skill: params.skill ?? ""
    },
    rows: searchRows,
    metrics,
    facets: buildFacets(facetRows, params),
    source: {
      current: "Live MySQL",
      target: "Meilisearch index",
      note: "The UI is already shaped around facets and scoped filters so we can swap the read adapter without changing the workflow."
    },
    selected,
    selectedActions: buildSelectedActions(params.role, selected?.candidate ?? null)
  };
}

const candidateSearchSelect = {
  candidate_id: true,
  candidate_uid: true,
  candidate_name: true,
  candidate_email: true,
  candidate_phone: true,
  candidate_status: true,
  approved: true,
  candidate_hourly_rate: true,
  currency_code: true,
  candidate_job_search_status: true,
  candidate_civil_need_verification: true,
  is_incomplete_profile: true,
  candidate_updated_at: true,
  country: { select: { country_name_en: true } },
  university: { select: { university_name_en: true } },
  store: { select: { store_name: true, company: { select: { company_name: true } } } },
  candidate_skill: {
    where: { deleted: 0 },
    orderBy: { candidate_skill_created_at: "desc" },
    take: 5,
    select: { skill: true }
  },
  candidate_tag: {
    where: { deleted: 0 },
    orderBy: { created_at: "desc" },
    take: 3,
    select: { tag: true }
  }
} satisfies Prisma.candidateSelect;

function buildCandidateWhere({
  scopeWhere,
  query,
  filter,
  country,
  university,
  company,
  skill
}: {
  scopeWhere: Prisma.candidateWhereInput;
  query: string;
  filter: CandidateSearchFilter;
  country?: number;
  university?: number;
  company?: number;
  skill?: string;
}): Prisma.candidateWhereInput {
  const numeric = Number(query);
  return {
    deleted: 0,
    ...scopeWhere,
    ...(filter === "active" ? { candidate_status: 10, approved: { not: 0 } } : {}),
    ...(filter === "needs-review" ? { approved: 0 } : {}),
    ...(filter === "incomplete" ? { is_incomplete_profile: true } : {}),
    ...(filter === "civil-id" ? { candidate_civil_need_verification: true } : {}),
    ...(country ? { country_id: country } : {}),
    ...(university ? { university_id: university } : {}),
    ...(company ? { store: { company_id: company } } : {}),
    ...(skill ? { candidate_skill: { some: { deleted: 0, skill } } } : {}),
    ...(query
      ? {
          OR: [
            { candidate_name: { contains: query } },
            { candidate_name_ar: { contains: query } },
            { candidate_email: { contains: query } },
            { candidate_phone: { contains: query } },
            { candidate_uid: { contains: query } },
            { candidate_skill: { some: { deleted: 0, skill: { contains: query } } } },
            { candidate_tag: { some: { deleted: 0, tag: { contains: query } } } },
            ...(Number.isInteger(numeric) ? [{ candidate_id: numeric }] : [])
          ]
        }
      : {})
  };
}

async function getCandidateSearchMetrics(scopeWhere: Prisma.candidateWhereInput) {
  const [total, active, needsReview, incomplete, civilId] = await prisma.$transaction([
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, candidate_status: 10, approved: { not: 0 } } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, approved: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, is_incomplete_profile: true } }),
    prisma.candidate.count({ where: { deleted: 0, ...scopeWhere, candidate_civil_need_verification: true } })
  ]);

  return [
    { label: "Candidates", value: total, note: "Visible to this login" },
    { label: "Active", value: active, note: "Approved and active" },
    { label: "Needs review", value: needsReview, note: "Approval queue" },
    { label: "Incomplete", value: incomplete, note: "Profile cleanup" },
    { label: "Civil ID", value: civilId, note: "Document review" }
  ];
}

function toCandidateSearchRow(row: Prisma.candidateGetPayload<{ select: typeof candidateSearchSelect }>): CandidateSearchRow {
  const isIncomplete = Boolean(row.is_incomplete_profile);
  const needsCivilId = Boolean(row.candidate_civil_need_verification);
  const flags = [
    row.approved === 0 ? "Needs review" : null,
    isIncomplete ? "Incomplete" : null,
    needsCivilId ? "Civil ID" : null,
    row.candidate_status !== 10 ? `Status ${row.candidate_status}` : null,
    ...row.candidate_tag.map((tag) => tag.tag).slice(0, 2)
  ].filter((flag): flag is string => Boolean(flag));
  const score =
    (row.approved === 0 ? 42 : 0) +
    (isIncomplete ? 28 : 0) +
    (needsCivilId ? 22 : 0) +
    (row.candidate_status !== 10 ? 10 : 0) +
    Math.min(row.candidate_skill.length * 3, 12);

  return {
    id: row.candidate_id,
    uid: row.candidate_uid ?? `#${row.candidate_id}`,
    name: row.candidate_name,
    email: row.candidate_email,
    phone: row.candidate_phone ?? "No phone",
    status: row.approved === 0 ? "Needs review" : row.candidate_status === 10 ? "Active" : `Status ${row.candidate_status}`,
    signal:
      row.approved === 0
        ? "Approval decision"
        : isIncomplete
          ? "Profile cleanup"
          : needsCivilId
            ? "Civil ID review"
            : row.candidate_status === 10
              ? "Ready"
              : "Watch",
    country: row.country?.country_name_en ?? "No country",
    university: row.university?.university_name_en ?? "No university",
    company: row.store?.company?.company_name ?? "No company",
    store: row.store?.store_name ?? "No store",
    rate: formatMoney(row.candidate_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.candidate_updated_at),
    flags,
    skills: row.candidate_skill.map((skill) => skill.skill).filter(Boolean),
    score
  };
}

function buildFacets(
  rows: {
    country_id: number | null;
    university_id: number | null;
    store: { company_id: number | null; company: { company_name: string } | null } | null;
    country: { country_name_en: string } | null;
    university: { university_name_en: string | null } | null;
    candidate_skill: { skill: string }[];
  }[],
  params: CandidateSearchParams
): CandidateSearchFacet[] {
  const facets: CandidateSearchFacet[] = [
    {
      key: "country",
      label: "Country",
      options: topFacet(
        rows
          .filter((row) => row.country_id && row.country?.country_name_en)
          .map((row) => ({ value: String(row.country_id), label: row.country?.country_name_en ?? "Country" })),
        params.country
      )
    },
    {
      key: "university",
      label: "University",
      options: topFacet(
        rows
          .filter((row) => row.university_id && row.university?.university_name_en)
          .map((row) => ({ value: String(row.university_id), label: row.university?.university_name_en ?? "University" })),
        params.university
      )
    },
    {
      key: "company",
      label: "Company",
      options: topFacet(
        rows
          .filter((row) => row.store?.company_id && row.store.company?.company_name)
          .map((row) => ({ value: String(row.store?.company_id), label: row.store?.company?.company_name ?? "Company" })),
        params.company
      )
    },
    {
      key: "skill",
      label: "Skills",
      options: topFacet(
        rows.flatMap((row) => row.candidate_skill.map((skill) => ({ value: skill.skill, label: skill.skill }))),
        params.skill
      )
    }
  ];
  return facets.filter((facet) => facet.options.length);
}

function topFacet(values: { value: string; label: string }[], activeValue?: string): CandidateSearchFacet["options"] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const item of values) {
    const key = item.value.trim();
    if (!key) continue;
    const existing = counts.get(key);
    counts.set(key, { label: existing?.label ?? item.label, count: (existing?.count ?? 0) + 1 });
  }
  return [...counts.entries()]
    .map(([value, item]) => ({ value, label: item.label, count: item.count, active: value === activeValue }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 8);
}

async function resolveSelectedCandidateId({
  requestedId,
  rows,
  scopedCandidateIds
}: {
  requestedId?: number;
  rows: CandidateSearchRow[];
  scopedCandidateIds: number[] | null;
}) {
  if (requestedId) {
    if (scopedCandidateIds && !scopedCandidateIds.includes(requestedId)) return null;
    const exists = await prisma.candidate.findFirst({ where: { candidate_id: requestedId, deleted: 0 }, select: { candidate_id: true } });
    return exists?.candidate_id ?? null;
  }
  return rows[0]?.id ?? null;
}

function buildSelectedActions(role: CandidateSearchRole, candidate: Awaited<ReturnType<typeof getCandidateDetail>>["candidate"]) {
  if (!candidate) return [];
  const base = role === "admin" ? "/admin/candidates" : "/staff/candidates";
  return [
    { label: "Open full record", href: `${base}/${candidate.candidate_id}` as Route },
    candidate.candidate_email ? { label: "Email", href: `mailto:${candidate.candidate_email}` } : null,
    candidate.candidate_phone ? { label: "Call", href: `tel:${candidate.candidate_phone}` } : null
  ].filter((item): item is { label: string; href: string } => Boolean(item));
}

async function candidateIdsForStaff(staffId: number) {
  if (!staffId) return [];
  const rows = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 2000,
    select: { candidate_id: true }
  });
  return rows.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));
}

function candidateIdScope(candidateIds: number[]): Prisma.candidateWhereInput {
  return candidateIds.length ? { candidate_id: { in: candidateIds } } : { candidate_id: -1 };
}

function parsePositiveInt(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function uniqueCandidateIds(ids: number[]) {
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
}
