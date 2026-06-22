"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/modules/auth/types";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────

type SearchResultRow = {
  id: number;
  name: string;
  email: string;
  status: string;
  type: "company" | "store" | "contact";
  subtitle: string;
  meta: string;
  href: string;
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
};

const ITEMS_PER_PAGE = 25;

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

// ─── Type badge ───────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    company: "bg-blue-500/10 text-blue-600",
    store: "bg-success/10 text-success",
    contact: "bg-primary/10 text-primary",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.6875rem] font-medium", colors[type] ?? "bg-muted text-muted-foreground")}>
      {type}
    </span>
  );
}

// ─── Component ─────────────────────────────────────────────────────────

export function CompanySearchPage({
  session,
  initialData,
  searchAction,
}: {
  session: SessionUser;
  initialData?: SearchResponse | null;
  searchAction: (contactUuid: string, params: Record<string, unknown>) => Promise<SearchResponse>;
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
  const [activeType, setActiveType] = useState<string>(searchParams.get("type") ?? "all");

  // Debounced query for auto-search
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const isTyping = query !== debouncedQuery;

  // Fetch search results
  const doSearch = useCallback(
    async (q: string, p: number, typeFilter: string) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params: Record<string, unknown> = {
          query: q || undefined,
          page: p,
        };
        if (typeFilter && typeFilter !== "all") {
          params.type = typeFilter;
        }

        const data = await searchAction(session.id, params);
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
    [session.id, searchAction],
  );

  // Auto-search on debounced query
  useEffect(() => {
    doSearch(debouncedQuery, 1, activeType);
    updateUrl(debouncedQuery, 1, activeType);
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, 1, activeType);
    updateUrl(query, 1, activeType);
  };

  const setTypeFilter = (typeVal: string) => {
    setActiveType(typeVal);
    setPage(1);
    doSearch(query, 1, typeVal);
    updateUrl(query, 1, typeVal);
  };

  const goToPage = (p: number) => {
    setPage(p);
    doSearch(query, p, activeType);
    updateUrl(query, p, activeType);
  };

  const updateUrl = (q: string, p: number, typeFilter: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);
    const qs = params.toString();
    router.replace(`/company/search${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const totalPages = results ? Math.ceil(results.matchingCount / ITEMS_PER_PAGE) : 0;

  // Parse facets from results
  const facets = results?.facets ?? [];

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Search form */}
      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Search companies, stores, contacts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
            onAction={() => doSearch(query, page, activeType)}
          />
        </div>
      )}

      {/* Results area */}
      <div className="grid grid-cols-[240px_1fr] gap-6 max-md:grid-cols-1">
        {/* Facet sidebar — type filter */}
        {facets.length > 0 && (
          <aside className="sticky top-6 self-start rounded-xl border border-border bg-card p-4">
            {facets.map((group) => (
              <div key={group.key} className="mb-5 last:mb-0">
                <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-1">
                  {group.options.map((option) => {
                    const isActive = option.value === activeType;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition-all duration-100",
                          isActive
                            ? "border-primary bg-primary/10 font-semibold text-primary"
                            : "border-transparent text-foreground hover:border-border hover:bg-muted",
                        )}
                        onClick={() => setTypeFilter(option.value)}
                      >
                        <span className="flex-1">{option.label}</span>
                        <span
                          className={cn(
                            "ml-2 rounded-full px-1.5 py-0.5 text-[0.6875rem]",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {option.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>
        )}

        {/* Results list */}
        <main className="min-h-[400px]">
          {/* Count indicator */}
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
                    {results.matchingCount.toLocaleString()} result
                    {results.matchingCount !== 1 ? "s" : ""} found
                  </>
                )}
              </span>
            </div>
          )}

          {/* Loading state — skeleton cards */}
          {loading && <SearchResultSkeletons count={5} />}

          {/* Empty state */}
          {!loading && !isTyping && results && results.rows.length === 0 && (
            <EmptyState
              variant="search"
              title="No results found"
              description="Try adjusting your search query or clearing type filters."
              actionLabel="Clear filters"
              onAction={() => {
                setActiveType("all");
                setPage(1);
                doSearch(query, 1, "all");
                updateUrl(query, 1, "all");
              }}
            />
          )}

          {/* Results */}
          {!loading && !isTyping && results && results.rows.length > 0 && (
            <>
              <div className="flex flex-col gap-3">
                {results.rows.map((row, idx) => (
                  <Link
                    key={`${row.type}-${row.id}-${idx}`}
                    href={row.href as any}
                    className="block rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-px"
                    onClick={(e) => {
                      if (e.button === 1 || e.metaKey || e.ctrlKey) return;
                    }}
                  >
                    {/* Result header */}
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="m-0 text-base font-semibold text-foreground">
                          {row.name}
                        </h3>
                        <TypeBadge type={row.type} />
                      </div>
                      {row.status && (
                        <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                          {row.status}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
                      {row.subtitle && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                            Details
                          </span>
                          <span className="text-xs truncate text-foreground">
                            {row.subtitle}
                          </span>
                        </div>
                      )}
                      {row.meta && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                            Info
                          </span>
                          <span className="text-xs truncate text-foreground">
                            {row.meta}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
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
