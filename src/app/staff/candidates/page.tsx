import { requireRole } from "@/modules/auth/session";
import { StaffCandidateConsole } from "@/modules/workspace/StaffCandidateConsole";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffCandidateConsole, type StaffCandidateFilter } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

const filters: { label: string; value: StaffCandidateFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Needs review", value: "needs-review" },
  { label: "Incomplete", value: "incomplete" },
  { label: "Civil ID", value: "civil-id" }
];

function parseFilter(value: string | string[] | undefined): StaffCandidateFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  return filters.some((item) => item.value === filter) ? (filter as StaffCandidateFilter) : "all";
}

function parseCandidateId(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const id = Number(candidate);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export default async function StaffCandidatesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; filter?: string; candidate?: string }>;
}) {
  const session = await requireRole("staff");
  const params = await searchParams;
  const query = params.q ?? "";
  const filter = parseFilter(params.filter);
  const data = await getStaffCandidateConsole({
    staffId: Number(session.id),
    search: query,
    filter,
    candidateId: parseCandidateId(params.candidate)
  });

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff workspace"
      title="Work candidates from one focused operating desk."
      metrics={data.metrics}
    >
      <StaffCandidateConsole data={data} filter={filter} filters={filters} query={query} />
    </WorkspaceShell>
  );
}
