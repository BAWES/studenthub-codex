"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { logoutAction } from "@/modules/auth/actions";
import type { SessionUser } from "@/modules/auth/types";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import type { CandidateSearchRow, CandidateSearchParams, getCandidateSearchWorkspace } from "./search";
import { candidateSearchFilters } from "./search";

type CandidateSearchData = Awaited<ReturnType<typeof getCandidateSearchWorkspace>>;

interface CandidateSearchPageProps {
  data: CandidateSearchData;
  basePath: "/admin/candidates" | "/staff/candidates";
  homePath: Route;
  session: SessionUser;
  params: CandidateSearchParams;
}

function candidateInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function candidateSearchHref(
  basePath: "/admin/candidates" | "/staff/candidates",
  params: CandidateSearchParams,
  overrides: Partial<Record<string, string>>
) {
  const next = new URLSearchParams();
  const values = {
    q: params.query ?? "",
    filter: params.filter && params.filter !== "all" ? params.filter : "",
    view: params.visibility === "assigned" ? "assigned" : "",
    candidate: params.candidateId ? String(params.candidateId) : "",
    selected: (params.selectedIds ?? []).join(","),
    page: params.page && params.page > 1 ? String(params.page) : "",
    country: params.country ?? "",
    university: params.university ?? "",
    company: params.company ?? "",
    skill: params.skill ?? "",
    gender: params.gender ?? "",
    profile: params.profile ?? "",
    assignment: params.assignment ?? "",
    document: params.document ?? "",
    ...overrides
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) next.set(key, value);
  }
  const suffix = next.toString();
  return (suffix ? `${basePath}?${suffix}` : basePath) as Route;
}

export function CandidateSearchPage({
  data,
  basePath,
  homePath,
  session,
  params,
}: CandidateSearchPageProps) {
  const router = useRouter();

  const columns: DataTableColumn<CandidateSearchRow>[] = [
    {
      header: "",
      className: "w-10",
      cell: (row) => (
        <div className="w-8 h-8 rounded-full bg-[#1f73b7] flex items-center justify-center text-white text-xs font-bold">
          {candidateInitials(row.name)}
        </div>
      ),
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <div className="font-medium text-[var(--ink)]">{row.name}</div>
          <div className="text-xs text-[var(--muted-foreground)]">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Status",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {row.status}
        </span>
      ),
    },
    {
      header: "Country",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-sm text-[var(--muted-foreground)]">
          {row.country}
        </span>
      ),
    },
    {
      header: "Skills",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Updated",
      className: "hidden xl:table-cell text-right",
      cell: (row) => (
        <span className="text-sm text-[var(--muted-foreground)]">
          {row.updated}
        </span>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* ── Header bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href={homePath} className="flex items-center gap-2 text-[var(--foreground)] no-underline">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1f73b7] text-white text-xs font-bold">
              SH
            </span>
            <span className="font-semibold text-sm hidden sm:inline">Candidates</span>
          </Link>

          <div className="flex-1 flex items-center gap-2">
            <form method="GET" action={basePath} className="flex-1 max-w-xl">
              <input
                name="q"
                placeholder="Search name, email, phone, ID..."
                defaultValue={data.query}
                className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[#1f73b7] focus:ring-2 focus:ring-[#1f73b7]/20"
              />
              {params.filter && params.filter !== "all" ? (
                <input name="filter" type="hidden" value={params.filter} />
              ) : null}
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          <nav className="flex items-center gap-2">
            {candidateSearchFilters.map((item) => (
              <Link
                key={item.value}
                href={candidateSearchHref(basePath, params, { filter: item.value })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  item.value === data.filter
                    ? "bg-[#1f73b7] text-white"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-2">
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Results ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            {data.matchingCount.toLocaleString("en-US")} total
            {data.query ? ` · results for "${data.query}"` : ""}
          </p>
        </div>

        <DataTable
          columns={columns}
          rows={data.rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => {
            router.push(`${basePath}/${row.id}`);
          }}
          emptyTitle="No candidates found"
          emptyDescription="Try a different search term or remove some filters."
          ariaLabel="Candidate search results"
        />

        {/* ── Pagination ───────────────────────────────────── */}
        {data.totalPages && data.totalPages > 1 ? (
          <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
            {data.page && data.page > 1 ? (
              <Link
                href={candidateSearchHref(basePath, params, { page: String(data.page - 1) })}
                className="px-3 py-1.5 rounded-md text-sm border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
              >
                Previous
              </Link>
            ) : null}
            <span className="text-sm text-[var(--muted-foreground)]">
              Page {data.page ?? 1} of {data.totalPages}
            </span>
            {data.page && data.page < data.totalPages ? (
              <Link
                href={candidateSearchHref(basePath, params, { page: String((data.page ?? 1) + 1) })}
                className="px-3 py-1.5 rounded-md text-sm border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
              >
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
