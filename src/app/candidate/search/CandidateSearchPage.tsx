"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import type { SessionUser } from "@/modules/auth/types";
import MatchScoreBadge from "@/components/matching/MatchScoreBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

// ─── Debounce hook ────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debouncedValue;
}

// ─── Skeleton card for loading state ──────────────────────────────────

function SearchResultSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
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

export function CandidateSearchPage({ session, initialData }: { session: SessionUser; initialData?: SearchResponse | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [activeFacets, setActiveFacets] = useState<Record<string, string>>({});

  // Determine profile link prefix from pathname
  const candidateProfilePrefix = pathname.startsWith("/admin") ? "/admin/candidates" : "/staff/candidates";

  // Debounced query for auto-search
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const isTyping = query !== debouncedQuery;

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

  // Fetch search results with AbortController for stale request cancellation
  const doSearch = useCallback(async (q: string, p: number, facets: Record<string, string>) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

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

      const res = await fetch(`/api/candidates/search?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Search failed (${res.status})`);
      }
      const data: SearchResponse = await res.json();
      // Only update if this request wasn't aborted
      if (!controller.signal.aborted) {
        setResults(data);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return; // Silently ignore aborted requests
      }
      setError(e instanceof Error ? e.message : String(e));
      setResults(null);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced auto-search: fires on mount and when debouncedQuery settles
  useEffect(() => {
    doSearch(debouncedQuery, 1, activeFacets);
    updateUrl(debouncedQuery, 1, activeFacets);
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search form submit (manual / Enter key)
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
  const updateUrl = useCallback((q: string, p: number, facets: Record<string, string>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    for (const [key, val] of Object.entries(facets)) {
      if (val) params.set(key, val);
    }
    const qs = params.toString();
    router.replace(`/candidate/search${qs ? `?${qs}` : ""}` as Route, { scroll: false });
  }, [router]);

  const totalPages = results ? Math.ceil(results.matchingCount / ITEMS_PER_PAGE) : 0;

  const [focused, setFocused] = useState(false);

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Search header */}
      <div className="mb-6">
        <h1 className="text-[1.625rem] font-bold text-foreground m-0">
          Search Candidates
        </h1>
        <p className="text-sm text-muted-foreground m-0 mt-1">
          Find candidates by name, skills, or keyword — powered by Typesense
        </p>
      </div>

      {/* Search form */}
      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Search by name, email, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
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
          <aside className="sticky top-6 self-start rounded-xl border border-border bg-card p-4">
            {results.facets.map((group) => (
              <div key={group.key} className="mb-5 last:mb-0">
                <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-1">
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition-all duration-100",
                        option.active
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-transparent text-foreground hover:border-border hover:bg-muted",
                      )}
                      onClick={() => toggleFacet(group.key, option.value)}
                    >
                      <span className="flex-1">{option.label}</span>
                      <span
                        className={cn(
                          "ml-2 rounded-full px-1.5 py-0.5 text-[0.6875rem]",
                          option.active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
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
          {/* Source indicator / typing indicator */}
          {results && (
            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {isTyping ? (
                  <>
                    <span className="inline-block align-middle mr-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Searching...
                  </>
                ) : (
                  <>
                    {results.matchingCount.toLocaleString()} candidate
                    {results.matchingCount !== 1 ? "s" : ""} found
                  </>
                )}
              </span>
              {!isTyping && (
                <span className="rounded-md px-2 py-0.5 text-muted-foreground bg-muted">
                  {results.source.current}
                </span>
              )}
            </div>
          )}

          {/* Loading state — skeleton cards */}
          {loading && <SearchResultSkeletons count={5} />}

          {/* Empty state */}
          {!loading && !isTyping && results && results.rows.length === 0 && (
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
          {!loading && !isTyping && results && results.rows.length > 0 && (
            <>
              <div className="flex flex-col gap-3">
                {results.rows.map((row) => (
                  <Link
                    key={row.id}
                    href={`${candidateProfilePrefix}/${row.id}`}
                    className="block rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-px"
                    onClick={(e) => {
                      // Allow middle-click / cmd+click for new tab
                      if (e.button === 1 || e.metaKey || e.ctrlKey) return;
                    }}
                  >
                    {/* Result header */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="m-0 text-base font-semibold text-foreground">
                          {row.name}
                        </h3>
                        <span className="font-mono text-[0.6875rem] text-muted-foreground">
                          {row.uid}
                        </span>
                      </div>
                      <MatchScoreBadge score={row.score} />
                    </div>

                    {/* Details grid */}
                    <div className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Email
                        </span>
                        <span className="text-xs text-foreground">
                          {row.email}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Phone
                        </span>
                        <span className="text-xs text-foreground">
                          {row.phone}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Location
                        </span>
                        <span className="text-xs text-foreground">
                          {row.country}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          University
                        </span>
                        <span className="text-xs text-foreground">
                          {row.university}
                        </span>
                      </div>
                      {row.company !== "No company" && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                            Company
                          </span>
                          <span className="text-xs text-foreground">
                            {row.company}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Rate
                        </span>
                        <span className="text-xs text-foreground">
                          {row.rate}
                        </span>
                      </div>
                    </div>

                    {/* Skills — shadcn Badge */}
                    {row.skills.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {row.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Flags — shadcn Badge */}
                    {row.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {row.flags.map((flag) => (
                          <Badge key={flag} variant="warning">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    &larr; Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next &rarr;
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
