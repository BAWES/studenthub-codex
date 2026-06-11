"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SessionUser } from "@/modules/auth/types";
import MatchScoreBadge from "@/components/matching/MatchScoreBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────

type SearchResultRow = {
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

type FacetOption = {
  label: string;
  value: string;
  count: number;
  active: boolean;
};

type FacetGroup = {
  key: string;
  label: string;
  options: FacetOption[];
};

type SearchResponse = {
  rows: SearchResultRow[];
  facets: FacetGroup[];
  matchingCount: number;
  query: string;
  filter: string;
  source: { current: string; target: string; note: string };
};

const ITEMS_PER_PAGE = 60;

// ─── Skeleton card for loading state ──────────────────────────────────

function SearchResultSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton variant="pulse" className="h-5 w-40" />
          <Skeleton variant="pulse" className="h-3 w-20" />
        </div>
        <Skeleton variant="pulse" className="h-6 w-14 rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
        <Skeleton variant="pulse" className="h-8 w-full" />
        <Skeleton variant="pulse" className="h-8 w-full" />
        <Skeleton variant="pulse" className="h-8 w-full" />
        <Skeleton variant="pulse" className="h-8 w-full" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton variant="pulse" className="h-5 w-16 rounded-md" />
        <Skeleton variant="pulse" className="h-5 w-20 rounded-md" />
        <Skeleton variant="pulse" className="h-5 w-14 rounded-md" />
      </div>
    </div>
  );
}

function SearchResultSkeletons({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────

export function CandidateSearchPage({ session }: { session: SessionUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [activeFacets, setActiveFacets] = useState<Record<string, string>>({});

  // Parse initial facets from URL
  useEffect(() => {
    const facets: Record<string, string> = {};
    const facetKeys = ["country", "university", "company", "skill", "gender", "profile", "assignment", "document"];
    for (const key of facetKeys) {
      const val = searchParams.get(key);
      if (val) facets[key] = val;
    }
    setActiveFacets(facets);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch search results
  const doSearch = useCallback(async (q: string, p: number, facets: Record<string, string>) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(p));
      params.set("role", "candidate");

      for (const [key, val] of Object.entries(facets)) {
        if (val) params.set(key, val);
      }

      const res = await fetch(`/api/candidates/search?${params.toString()}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Search failed (${res.status})`);
      }
      const data: SearchResponse = await res.json();
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial search
  useEffect(() => {
    doSearch(query, page, activeFacets);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, 1, activeFacets);
    updateUrl(query, 1, activeFacets);
  };

  // Toggle a facet filter
  const toggleFacet = (key: string, value: string) => {
    const next = { ...activeFacets };
    if (next[key] === value) {
      delete next[key];
    } else {
      next[key] = value;
    }
    setActiveFacets(next);
    setPage(1);
    doSearch(query, 1, next);
    updateUrl(query, 1, next);
  };

  // Pagination
  const goToPage = (p: number) => {
    setPage(p);
    doSearch(query, p, activeFacets);
    updateUrl(query, p, activeFacets);
  };

  // Update URL without full navigation
  const updateUrl = (q: string, p: number, facets: Record<string, string>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    for (const [key, val] of Object.entries(facets)) {
      if (val) params.set(key, val);
    }
    const qs = params.toString();
    router.replace(`/candidate/search${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const totalPages = results ? Math.ceil(results.matchingCount / ITEMS_PER_PAGE) : 0;

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Search header */}
      <div className="mb-6">
        <h1 className="m-0 text-[1.625rem] font-bold" style={{ color: "var(--ink)" }}>
          Search Candidates
        </h1>
        <p className="m-0 mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Find candidates by name, skills, or keyword — powered by Typesense
        </p>
      </div>

      {/* Search form */}
      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 rounded-lg border px-4 py-2.5 text-[0.9375rem] outline-none transition-[border-color] duration-150"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--ink)",
            }}
            placeholder="Search by name, email, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#eb6651";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            className="rounded-lg px-6 py-2.5 text-[0.9375rem] font-semibold text-white transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
            style={{ background: "#eb6651" }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mb-4">
          <EmptyState
            variant="error"
            title="Search error"
            description={error}
            actionLabel="Retry"
            onAction={() => doSearch(query, page, activeFacets)}
          />
        </div>
      )}

      {/* Results area */}
      <div className="grid grid-cols-[240px_1fr] gap-6 max-md:grid-cols-1">
        {/* Facet sidebar */}
        {results && results.facets.length > 0 && (
          <aside
            className="sticky top-6 self-start rounded-xl border p-4"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            {results.facets.map((group) => (
              <div key={group.key} className="mb-5 last:mb-0">
                <h3
                  className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  {group.label}
                </h3>
                <div className="flex flex-col gap-1">
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "flex items-center justify-between rounded-md border border-transparent px-2.5 py-1.5 text-left text-xs transition-all duration-100",
                        option.active
                          ? "font-semibold"
                          : "hover:border-[var(--border)] hover:bg-[var(--accent)]",
                      )}
                      style={
                        option.active
                          ? {
                              background: "rgba(235, 102, 81, 0.08)",
                              borderColor: "#eb6651",
                              color: "#eb6651",
                            }
                          : {
                              color: "var(--ink)",
                            }
                      }
                      onClick={() => toggleFacet(group.key, option.value)}
                    >
                      <span className="flex-1">{option.label}</span>
                      <span
                        className={cn(
                          "ml-2 rounded-full px-1.5 py-0.5 text-[0.6875rem]",
                          option.active
                            ? "bg-[rgba(235,102,81,0.12)] text-[#eb6651]"
                            : "bg-[var(--accent)]",
                        )}
                        style={option.active ? {} : { color: "var(--muted)" }}
                      >
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        )}

        {/* Results list */}
        <main className="min-h-[400px]">
          {/* Source indicator */}
          {results && (
            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: "var(--ink)" }}>
                {results.matchingCount.toLocaleString()} candidate
                {results.matchingCount !== 1 ? "s" : ""} found
              </span>
              <span
                className="rounded-md px-2 py-0.5"
                style={{ color: "var(--muted)", background: "var(--accent)" }}
              >
                {results.source.current}
              </span>
            </div>
          )}

          {/* Loading state — skeleton cards */}
          {loading && <SearchResultSkeletons count={5} />}

          {/* Empty state */}
          {!loading && results && results.rows.length === 0 && (
            <EmptyState
              variant="search"
              title="No candidates found"
              description="Try adjusting your search query or clearing facet filters."
              actionLabel="Clear filters"
              onAction={() => {
                setActiveFacets({});
                setPage(1);
                doSearch(query, 1, {});
                updateUrl(query, 1, {});
              }}
            />
          )}

          {/* Results */}
          {!loading && results && results.rows.length > 0 && (
            <>
              <div className="flex flex-col gap-3">
                {results.rows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border p-4 transition-shadow duration-150 hover:shadow-sm"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {/* Result header */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="m-0 text-base font-semibold" style={{ color: "var(--ink)" }}>
                          {row.name}
                        </h3>
                        <span className="font-mono text-[0.6875rem]" style={{ color: "var(--muted)" }}>
                          {row.uid}
                        </span>
                      </div>
                      <MatchScoreBadge score={row.score} />
                    </div>

                    {/* Details grid */}
                    <div className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          Email
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink)" }}>
                          {row.email}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          Phone
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink)" }}>
                          {row.phone}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          Location
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink)" }}>
                          {row.country}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          University
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink)" }}>
                          {row.university}
                        </span>
                      </div>
                      {row.company !== "No company" && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                            Company
                          </span>
                          <span className="text-xs" style={{ color: "var(--ink)" }}>
                            {row.company}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          Rate
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink)" }}>
                          {row.rate}
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    {row.skills.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {row.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
                            style={{
                              background: "rgba(235, 102, 81, 0.08)",
                              color: "#eb6651",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Flags */}
                    {row.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {row.flags.map((flag) => (
                          <span
                            key={flag}
                            className="rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
                            style={{ background: "rgba(234, 179, 8, 0.12)", color: "#a16207" }}
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4 py-4">
                  <button
                    type="button"
                    className="rounded-lg border px-5 py-2 text-sm font-medium transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--card)",
                      color: "var(--ink)",
                    }}
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    onMouseEnter={(e) => {
                      if (!(e.currentTarget as HTMLButtonElement).disabled) {
                        e.currentTarget.style.borderColor = "#eb6651";
                        e.currentTarget.style.color = "#eb6651";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--ink)";
                    }}
                  >
                    &larr; Previous
                  </button>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    Page {page} of {totalPages}
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border px-5 py-2 text-sm font-medium transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--card)",
                      color: "var(--ink)",
                    }}
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    onMouseEnter={(e) => {
                      if (!(e.currentTarget as HTMLButtonElement).disabled) {
                        e.currentTarget.style.borderColor = "#eb6651";
                        e.currentTarget.style.color = "#eb6651";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--ink)";
                    }}
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
