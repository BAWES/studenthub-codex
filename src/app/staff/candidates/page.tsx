import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateSearchOS } from "@/modules/candidates/CandidateSearchOS";
import { getCandidateSearchWorkspace, type CandidateSearchFilter, type CandidateSearchVisibility } from "@/modules/candidates/search";

export const dynamic = "force-dynamic";

const filterValues: CandidateSearchFilter[] = ["all", "active", "needs-review", "incomplete", "civil-id"];

function parseFilter(value: string | string[] | undefined): CandidateSearchFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  return filterValues.includes(filter as CandidateSearchFilter) ? (filter as CandidateSearchFilter) : "all";
}

function parseCandidateId(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const id = Number(candidate);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function parseCandidateTabs(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => Number(item))
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, 8);
}

function parseVisibility(value: string | string[] | undefined): CandidateSearchVisibility {
  const visibility = Array.isArray(value) ? value[0] : value;
  return visibility === "assigned" ? "assigned" : "all";
}

export default async function StaffCandidatesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; filter?: string; view?: string; candidate?: string; tabs?: string; country?: string; university?: string; company?: string; skill?: string }>;
}) {
  const session = await requireRoleCapability("staff", "candidate.search");
  const params = await searchParams;
  const search = {
    role: "staff" as const,
    staffId: Number(session.id),
    query: params.q ?? "",
    filter: parseFilter(params.filter),
    visibility: parseVisibility(params.view),
    candidateId: parseCandidateId(params.candidate),
    tabIds: parseCandidateTabs(params.tabs),
    country: params.country,
    university: params.university,
    company: params.company,
    skill: params.skill
  };
  const data = await getCandidateSearchWorkspace(search);

  return (
    <CandidateSearchOS basePath="/staff/candidates" data={data} detailPath="/staff/candidates" homePath="/staff" params={search} session={session} />
  );
}
