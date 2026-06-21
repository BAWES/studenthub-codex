"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/** Full-page skeleton matching the WorkspaceShell layout for route transitions. */
export function WorkspaceShellSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <main className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
      {/* Topbar */}
      <section className="grid grid-cols-[1fr_minmax(220px,300px)] items-center gap-4.5 border border-border rounded-lg bg-card p-4">
        <div>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="min-w-0 grid gap-1.5 p-3.5 border border-border rounded-lg bg-card">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Loading metrics">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-9 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Content area */}
      <div className="grid gap-3.5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>

      {/* Data lists */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2].map((col) => (
          <Card key={col}>
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-border">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="grid">
              {Array.from({ length: rowCount }).map((_, i) => (
                <article
                  key={i}
                  className="min-h-[72px] grid grid-cols-[1fr_minmax(126px,auto)] gap-4 px-4 py-3.5 border-b border-border last:border-b-0"
                >
                  <div className="min-w-0 grid gap-1.5 content-center">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <div className="flex items-center justify-end">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </article>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}

/** Skeleton for data-table list pages. */
export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filter/search bar */}
      <div className="flex gap-2.5 mb-1">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Rows */}
      <div className="grid gap-px">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-[14px] py-[10px]">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-[14px] py-3 border-t border-border"
          >
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-5 w-20 rounded-full" />
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
    <div className="grid gap-3.5">
      {/* Action bar placeholder */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* Hero section */}
      <Skeleton className="h-56 w-full rounded-lg" />

      {/* Fact panels */}
      <div className={`grid ${Math.min(panels, 2) === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
        {Array.from({ length: panels }).map((_, i) => (
          <div key={i} className="grid gap-2 p-4 border border-border rounded-lg bg-card">
            <Skeleton className="h-4 w-24" />
            {[1, 2, 3, 4].map((r) => (
              <div key={r} className="flex justify-between">
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
          <div key={col} className="grid gap-1 p-4 border border-border rounded-lg bg-card">
            <Skeleton className="h-4 w-32 mb-2" />
            {[1, 2, 3, 4].map((r) => (
              <Skeleton key={r} className="h-10 w-full" />
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
    <div className="grid gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === 0 ? "h-5 w-48" : "h-3 w-36"} />
      ))}
    </div>
  );
}
