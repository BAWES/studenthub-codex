import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateSearchOS } from "@/modules/candidates/CandidateSearchOS";
import { getCandidateSearchWorkspace, type CandidateSearchFilter, type CandidateSearchVisibility } from "@/modules/candidates/search";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

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

function parseVisibility(value: string | string[] | undefined): CandidateSearchVisibility {
  const visibility = Array.isArray(value) ? value[0] : value;
  return visibility === "assigned" ? "assigned" : "all";
}

export default async function StaffCandidatesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; filter?: string; view?: string; candidate?: string; country?: string; university?: string; company?: string; skill?: string }>;
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
    country: params.country,
    university: params.university,
    company: params.company,
    skill: params.skill
  };
  const data = await getCandidateSearchWorkspace(search);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff workspace"
      title="Search and work candidates from one operating desk."
      metrics={data.metrics}
    >
      <CandidateSearchOS basePath="/staff/candidates" data={data} detailPath="/staff/candidates" params={search} />
    </WorkspaceShell>
  );
}
