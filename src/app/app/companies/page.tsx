import type { Route } from "next";
import { redirect } from "next/navigation";
import { requireSession } from "@/modules/auth/session";
import { CandidateSearchOS } from "@/modules/candidates/CandidateSearchOS";
import { getCandidateSearchWorkspace, type CandidateSearchFilter, type CandidateSearchVisibility } from "@/modules/candidates/search";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminCompanyRows, getCompanyAccountRows } from "@/modules/workspace/data";

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

function parseCandidateIds(value: string | string[] | undefined, limit = 8) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => Number(item))
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, limit);
}

function parseVisibility(value: string | string[] | undefined): CandidateSearchVisibility {
  const visibility = Array.isArray(value) ? value[0] : value;
  return visibility === "assigned" ? "assigned" : "all";
}

export default async function AppCompaniesPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    view?: string;
    candidate?: string;
    tabs?: string;
    selected?: string;
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
  const session = await requireSession();

  if (session.role === "admin") {
    const rows = await getAdminCompanyRows();
    return (
      <WorkspaceShell session={session} eyebrow="Directory" title="Companies" metrics={[]}>
        <DataTable
          title="Company Accounts"
          description="Companies, ownership, active request counts, and commercial status."
          rows={rows}
          rowHref={(row) => `/app/companies/${row.id}` as Route}
          columns={[
            { key: "name", label: "Company", render: (row) => <strong>{row.name}</strong> },
            { key: "email", label: "Email", render: (row) => row.email },
            { key: "owner", label: "Owner", render: (row) => row.owner },
            { key: "requests", label: "Requests", render: (row) => row.requests },
            { key: "status", label: "Status", render: (row) => row.status },
            { key: "updated", label: "Updated", render: (row) => row.updated }
          ]}
        />
      </WorkspaceShell>
    );
  }

  if (session.role === "company") {
    const rows = await getCompanyAccountRows(session.id);
    return (
      <WorkspaceShell session={session} eyebrow="Directory" title="Linked Companies" metrics={[]}>
        <DataTable
          title="Company Accounts"
          description="Company records this contact can access through the imported production relationships."
          rows={rows}
          rowHref={(row) => `/app/companies/${row.id}` as Route}
          columns={[
            { key: "name", label: "Company", render: (row) => <strong>{row.name}</strong> },
            { key: "email", label: "Email", render: (row) => row.email },
            { key: "country", label: "Country", render: (row) => row.country },
            { key: "requests", label: "Requests", render: (row) => row.requests },
            { key: "status", label: "Status", render: (row) => row.status },
            { key: "updated", label: "Updated", render: (row) => row.updated }
          ]}
        />
      </WorkspaceShell>
    );
  }

  if (session.role === "staff") {
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
    return <CandidateSearchOS basePath="/app/companies" data={data} homePath="/app" params={search} session={session} />;
  }

  redirect("/app");
}
