import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateSearchPage } from "@/modules/candidates/CandidateSearchPage";
import { getCandidateSearchWorkspaceTypesense as getCandidateSearchWorkspace, parseFilter, parseCandidateId, parseCandidateIds, parseSearchPage } from "@/modules/candidates/search-typesense";
import { parseVisibility } from "@/modules/candidates/search";

export const dynamic = "force-dynamic";

export default async function StaffCandidatesSearchPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    view?: string;
    candidate?: string;
    tabs?: string;
    selected?: string;
    page?: string;
    country?: string;
    university?: string;
    company?: string;
    skill?: string;
    gender?: string;
    profile?: string;
    assignment?: string;
    document?: string;
  }>;
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
    tabIds: parseCandidateIds(params.tabs),
    selectedIds: parseCandidateIds(params.selected, 100),
    page: parseSearchPage(params.page),
    country: params.country,
    university: params.university,
    company: params.company,
    skill: params.skill,
    gender: params.gender,
    profile: params.profile,
    assignment: params.assignment,
    document: params.document
  };
  const data = await getCandidateSearchWorkspace(search);

  return <CandidateSearchPage basePath="/staff/candidates" data={data} homePath="/staff" params={search} session={session} />;
}
