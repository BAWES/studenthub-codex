"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/modules/auth/types";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";

// ─── Types ────────────────────────────────────────────────────────────

type SearchResultRow = {
  jobListingId: number;
  title: string;
  description: string;
  location: string | null;
  employmentType: string | null;
  salaryRange: string | null;
  status: string | null;
  companyName: string;
  createdAt: string;
  score?: number;
};

type SearchResponse = {
  query: string;
  page: number;
  matchingCount: number;
  rows: SearchResultRow[];
  source: { current: string; target: string };
};

const ITEMS_PER_PAGE = 20;

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
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <Skeleton variant="pulse" className="h-5 w-40" />
        <Skeleton variant="pulse" className="h-5 w-16 rounded-md" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
        <Skeleton variant="pulse" className="h-8 w-full" />
        <Skeleton variant="pulse" className="h-8 w-full" />
      </div>
    </div>
  );
}

function SearchResultSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────

export function EmployerJobsSearchPage({
  session,
  initialData,
  searchAction,
}: {
  session: SessionUser;
  initialData?: SearchResponse | null;
  searchAction: (params: Record<string, unknown>) => Promise<SearchResponse>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Debounced query for auto-search
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const isTyping = query !== debouncedQuery;

  // Fetch search results with AbortController for stale request cancellation
  const doSearch = useCallback(
    async (q: string, p: number) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params: Record<string, unknown> = {
          q: q || undefined,
          page: p,
        };

        const data = await searchAction(params);
        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
        setResults(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [searchAction],
  );

  // Auto-search on debounced query
  useEffect(() => {
    doSearch(debouncedQuery, 1);
    updateUrl(debouncedQuery, 1);
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, 1);
    updateUrl(query, 1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    doSearch(query, p);
    updateUrl(query, p);
  };

  const updateUrl = (q: string, p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    router.replace(`/employer/jobs${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const totalPages = results ? Math.ceil(results.matchingCount / ITEMS_PER_PAGE) : 0;

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="sr-only">Job Postings</h1>
      {/* Search form */}
      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 rounded-lg border border-border bg-card text-foreground px-4 py-2.5 text-[0.9375rem] outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-[--sh-coral] focus-visible:shadow-[--sh-coral-glow]"
            placeholder="Search job postings by title, description, requirements..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="rounded-lg bg-[--sh-coral] px-6 py-2.5 text-[0.9375rem] font-semibold text-white transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
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
            onAction={() => doSearch(query, page)}
          />
        </div>
      )}

      {/* Results area */}
      <div>
        {/* Count indicator */}
        {results && (
          <div className="mb-4 flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              {isTyping ? (
                <>
                  <span className="inline-block align-middle mr-1.5 h-2 w-2 rounded-full bg-[var(--sh-coral)] animate-pulse" />
                  Searching...
                </>
              ) : (
                <>
                  {results.matchingCount.toLocaleString()} job
                  {results.matchingCount !== 1 ? "s" : ""} found
                </>
              )}
            </span>
            {!isTyping && (
              <span
                className="rounded-md px-2 py-0.5 text-muted-foreground bg-accent"
              >
                {results.source.current}
              </span>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && <SearchResultSkeletons count={3} />}

        {/* Empty state */}
        {!loading && !isTyping && results && results.rows.length === 0 && (
          <EmptyState
            variant="search"
            title="No jobs found"
            description="Try adjusting your search query or clear filters."
            actionLabel="Clear search"
            onAction={() => {
              setQuery("");
              setPage(1);
              doSearch("", 1);
              updateUrl("", 1);
              inputRef.current?.focus();
            }}
          />
        )}

        {/* Results list */}
        {!loading && !isTyping && results && results.rows.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {results.rows.map((row) => (
                <Link
                  key={row.jobListingId}
                  href={`/employer/jobs/${row.jobListingId}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-px"
                  onClick={(e) => {
                    if (e.button === 1 || e.metaKey || e.ctrlKey) return;
                  }}
                >
                  {/* Result header */}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="m-0 text-base font-semibold text-foreground">
                        {row.title}
                      </h3>
                      {row.status && (
                        <StatusBadge
                          variant={genericStatusVariant(row.status)}
                          label={row.status}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>

                  {/* Description excerpt */}
                  {row.description && (
                    <p className="m-0 mb-2 text-sm text-muted-foreground line-clamp-2">
                      {row.description}
                    </p>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
                    {row.employmentType && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Type
                        </span>
                        <span className="text-xs text-foreground">
                          {row.employmentType}
                        </span>
                      </div>
                    )}
                    {row.location && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Location
                        </span>
                        <span className="text-xs text-foreground">
                          {row.location}
                        </span>
                      </div>
                    )}
                    {row.salaryRange && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Salary
                        </span>
                        <span className="text-xs text-foreground">
                          {row.salaryRange}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                        Posted
                      </span>
                      <span className="text-xs text-foreground">
                        {row.createdAt}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-30"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-xs font-medium",
                        p === page
                          ? "border-[--sh-coral] bg-[--sh-coral-light] text-[--sh-coral]"
                          : "border-border text-foreground",
                      )}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-30"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
