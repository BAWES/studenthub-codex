"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Shimmer skeleton block. */
function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      data-slot="skeleton"
      className={className}
      aria-hidden="true"
    />
  );
}

/** Full-page skeleton matching the WorkspaceShell layout for route transitions. */
export function WorkspaceShellSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <div className="min-h-0">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        {/* Topbar — matches WorkspaceShell Tailwind layout */}
        <section className="flex items-center justify-between gap-4 border-b border-border pb-3 mb-1">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="min-w-[140px] max-w-[220px] grid content-center gap-0.5 rounded-lg border border-border bg-card p-2.5 text-right">
            <Skeleton className="h-3 w-12 ml-auto" />
            <Skeleton className="h-4 w-28 ml-auto" />
            <Skeleton className="h-3 w-40 ml-auto" />
          </div>
        </section>

        {/* Metrics — matches WorkspaceShell Tailwind grid */}
        <section className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3" aria-label="Loading metrics">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border rounded-lg bg-card p-4 grid gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </section>

        {/* Content area */}
        <div className="grid gap-3.5 p-0">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full rounded-lg border border-border" />
        </div>

        {/* Data lists — matches WorkspaceShell WorkspaceList layout */}
        <section className="grid gap-4">
          {[1, 2].map((col) => (
            <section key={col} className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="flex items-center justify-between gap-2.5 border-b border-border px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: rowCount }).map((_, i) => (
                  <article key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 grid gap-0.5">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="shrink-0">
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      </section>
    </div>
  );
}

/** Skeleton for data-table list pages. Uses card container with shimmer. */
export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-lg bg-card p-5 grid gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Filter/search bar */}
      <div className="flex gap-2.5">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Rows */}
      <div className="grid gap-px">
        {/* Header row */}
        <div
          className="grid gap-3 px-3.5 py-2.5 border-b border-border"
          style={{ gridTemplateColumns: "1fr 1fr 120px 100px" }}
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid gap-3 px-3.5 py-3 border-b border-border"
            style={{ gridTemplateColumns: "1fr 1fr 120px 100px" }}
          >
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact skeleton for detail pages with fact panels. */
export function DetailPageSkeleton({ panels = 3 }: { panels?: number }) {
  return (
    <div className="p-4 grid gap-3.5">
      {/* Action bar placeholder */}
      <div className="border border-border rounded-lg bg-card p-5">
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Hero section */}
      <div className="border border-border rounded-lg bg-card p-5">
        <Skeleton className="h-48 w-full" />
      </div>

      {/* Fact panels */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(panels, 2)}, 1fr)` }}
      >
        {Array.from({ length: panels }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg bg-card p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            {[1, 2, 3, 4].map((r) => (
              <div key={r} className="flex justify-between mb-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Related lists */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((col) => (
          <div key={col} className="border border-border rounded-lg bg-card p-4">
            <Skeleton className="h-4 w-32 mb-3" />
            {[1, 2, 3, 4].map((r) => (
              <Skeleton key={r} className="h-10 w-full mb-2" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Lightweight top-of-page pulse skeleton for Suspense fallbacks. */
export function QuickSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="p-3.5 grid gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-${i === 0 ? 5 : 3} w-${i === 0 ? 48 : 36}`} />
      ))}
    </div>
  );
}
