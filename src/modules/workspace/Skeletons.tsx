"use client";

/** Shimmer glass skeleton block used by DataTable. */
function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      data-slot="skeleton"
      className={`shTableSkeleton ${className}`}
      aria-hidden="true"
    />
  );
}

/** Full-page skeleton matching the WorkspaceShell layout for route transitions. */
export function WorkspaceShellSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <main className="shell shellEmbedded">
      <section className="workspaceStage">
        {/* Topbar */}
        <section className="topbar">
          <div>
            <ShimmerBlock className="h-3 w-24 mb-2" />
            <ShimmerBlock className="h-7 w-64" />
          </div>
          <div className="accountBox">
            <ShimmerBlock className="h-3 w-12" />
            <ShimmerBlock className="h-4 w-28" />
            <ShimmerBlock className="h-3 w-40" />
          </div>
        </section>

        {/* Metrics */}
        <section className="metrics" aria-label="Loading metrics">
          {[1, 2, 3, 4].map((i) => (
            <article className="metric" key={i}>
              <ShimmerBlock className="h-3 w-16 mb-2" />
              <ShimmerBlock className="h-9 w-20 mb-1" />
              <ShimmerBlock className="h-3 w-12" />
            </article>
          ))}
        </section>

        {/* Content area */}
        <div className="skeletonContent" style={{ padding: "18px 22px", display: "grid", gap: 14 }}>
          <ShimmerBlock className="h-6 w-48" />
          <ShimmerBlock className="h-40 w-full rounded-lg" />
        </div>

        {/* Data lists */}
        <section className="lists">
          {[1, 2].map((col) => (
            <section className="dataList" key={col}>
              <div className="listHeader">
                <ShimmerBlock className="h-4 w-32" />
                <ShimmerBlock className="h-5 w-8 rounded-full" />
              </div>
              <div className="rows">
                {Array.from({ length: rowCount }).map((_, i) => (
                  <article className="row" key={i}>
                    <div className="rowMain">
                      <ShimmerBlock className="h-4 w-48 mb-1" />
                      <ShimmerBlock className="h-3 w-64" />
                    </div>
                    <div className="rowMeta">
                      <ShimmerBlock className="h-3 w-16" />
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

/** Skeleton for data-table list pages. Uses glass container with shimmer. */
export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="shTableGlass" style={{ padding: "18px 22px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <ShimmerBlock className="h-6 w-40" />
        <ShimmerBlock className="h-8 w-28" />
      </div>

      {/* Filter/search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
        <ShimmerBlock className="h-9 flex-1" />
        <ShimmerBlock className="h-9 w-24" />
      </div>

      {/* Rows */}
      <div style={{ display: "grid", gap: 1 }}>
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 120px 100px",
            gap: 12,
            padding: "10px 14px",
            borderBottom: "1px solid var(--sh-glass-border)",
          }}
        >
          <ShimmerBlock className="h-3 w-20" />
          <ShimmerBlock className="h-3 w-24" />
          <ShimmerBlock className="h-3 w-16" />
          <ShimmerBlock className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 120px 100px",
              gap: 12,
              padding: "12px 14px",
              borderBottom: "1px solid var(--sh-glass-border)",
            }}
          >
            <ShimmerBlock className="h-4 w-44" />
            <ShimmerBlock className="h-3 w-56" />
            <ShimmerBlock className="h-5 w-20" />
            <ShimmerBlock className="h-4 w-16" />
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
      <div className="shTableGlass" style={{ padding: 20 }}>
        <ShimmerBlock className="h-24 w-full" />
      </div>

      {/* Hero section */}
      <div className="shTableGlass" style={{ padding: 20 }}>
        <ShimmerBlock className="h-48 w-full" />
      </div>

      {/* Fact panels */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(panels, 2)}, 1fr)`, gap: 12 }}>
        {Array.from({ length: panels }).map((_, i) => (
          <div key={i} className="shTableGlass" style={{ padding: 16 }}>
            <ShimmerBlock className="h-4 w-24 mb-3" />
            {[1, 2, 3, 4].map((r) => (
              <div key={r} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <ShimmerBlock className="h-3 w-16" />
                <ShimmerBlock className="h-3 w-32" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Related lists */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[1, 2].map((col) => (
          <div key={col} className="shTableGlass" style={{ padding: 16 }}>
            <ShimmerBlock className="h-4 w-32 mb-3" />
            {[1, 2, 3, 4].map((r) => (
              <ShimmerBlock key={r} className="h-10 w-full mb-2" />
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
        <ShimmerBlock key={i} className={`h-${i === 0 ? 5 : 3} w-${i === 0 ? 48 : 36}`} />
      ))}
    </div>
  );
}
