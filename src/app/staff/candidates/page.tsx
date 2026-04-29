import type { Route } from "next";
import Link from "next/link";
import { requireRole } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffCandidateDirectoryRows, type StaffCandidateFilter } from "@/modules/workspace/data";

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

export default async function StaffCandidatesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const session = await requireRole("staff");
  const params = await searchParams;
  const query = params.q ?? "";
  const filter = parseFilter(params.filter);
  const data = await getStaffCandidateDirectoryRows({ search: query, filter });

  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="Candidate workspace" metrics={data.metrics}>
      <section className="commandSurface">
        <form className="searchForm">
          <label>
            Search candidates
            <input name="q" placeholder="Name, email, or candidate ID" defaultValue={query} />
          </label>
          <input type="hidden" name="filter" value={filter} />
          <button type="submit">Search</button>
        </form>
        <div className="filterRail" aria-label="Candidate filters">
          {filters.map((item) => {
            const href = `/staff/candidates?filter=${item.value}${query ? `&q=${encodeURIComponent(query)}` : ""}` as Route;
            return (
              <Link className={item.value === filter ? "active" : ""} href={href} key={item.value}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <DataTable
        title="Candidate Directory"
        description="Searchable staff candidate workspace from the production clone."
        rows={data.rows}
        rowHref={(row) => `/staff/candidates/${row.id}` as Route}
        columns={[
          {
            key: "name",
            label: "Candidate",
            render: (row) => (
              <span className="stackedCell">
                <strong>{row.name}</strong>
                <small>{row.uid}</small>
              </span>
            )
          },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "country", label: "Country", render: (row) => row.country },
          {
            key: "assignment",
            label: "Assignment",
            render: (row) => (
              <span className="stackedCell">
                <strong>{row.company}</strong>
                <small>{row.store}</small>
              </span>
            )
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span className="statusCell">
                <strong>{row.status}</strong>
                {row.flags.map((flag) => (
                  <small key={flag}>{flag}</small>
                ))}
              </span>
            )
          },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
