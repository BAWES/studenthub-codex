"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Full-page skeleton matching the WorkspaceShell layout for route transitions. */
export function WorkspaceShellSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <main className="shell shellEmbedded">
      <section className="workspaceStage">
        {/* Topbar */}
        <section className="topbar">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="accountBox">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </section>

        {/* Metrics */}
        <section className="metrics" aria-label="Loading metrics">
          {[1, 2, 3, 4].map((i) => (
            <article className="metric" key={i}>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-9 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </article>
          ))}
        </section>

        {/* Content area */}
        <div className="skeletonContent" style={{ padding: "18px 22px", display: "grid", gap: 14 }}>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>

        {/* Data lists */}
        <section className="lists">
          {[1, 2].map((col) => (
            <section className="dataList" key={col}>
              <div className="listHeader">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <div className="rows">
                {Array.from({ length: rowCount }).map((_, i) => (
                  <article className="row" key={i}>
                    <div className="rowMain">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="rowMeta">
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      </section>
    </main>
  );
}

/** Skeleton for data-table list pages. */
export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="skeletonTable" style={{ padding: "18px 22px", display: "grid", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filter/search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Rows */}
      <div style={{ display: "grid", gap: 1 }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: 12, padding: "10px 14px" }}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 120px 100px",
              gap: 12,
              padding: "12px 14px",
              borderTop: "1px solid var(--line)"
            }}
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
    <div style={{ padding: "18px 22px", display: "grid", gap: 14 }}>
      {/* Action bar placeholder */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* Hero section */}
      <Skeleton className="h-56 w-full rounded-lg" />

      {/* Fact panels */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(panels, 2)}, 1fr)`, gap: 12 }}>
        {Array.from({ length: panels }).map((_, i) => (
          <div key={i} style={{ display: "grid", gap: 8, padding: 16, border: "1px solid var(--line)", borderRadius: 10 }}>
            <Skeleton className="h-4 w-24" />
            {[1, 2, 3, 4].map((r) => (
              <div key={r} style={{ display: "flex", justifyContent: "space-between" }}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Related lists */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[1, 2].map((col) => (
          <div key={col} style={{ display: "grid", gap: 4, padding: 16, border: "1px solid var(--line)", borderRadius: 10 }}>
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
    <div style={{ padding: "14px 22px", display: "grid", gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-${i === 0 ? 5 : 3} w-${i === 0 ? 48 : 36}`} />
      ))}
    </div>
  );
}
