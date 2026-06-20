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
    <div className="shell shellEmbedded">
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
        <div className="skeletonContent p-[18px_22px] grid gap-[14px]">
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
    </div>
  );
}

/** Skeleton for data-table list pages. Uses glass container with shimmer. */
export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="shTableGlass p-[18px_22px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <ShimmerBlock className="h-6 w-40" />
        <ShimmerBlock className="h-8 w-28" />
      </div>

      {/* Filter/search bar */}
      <div className="flex gap-2.5 mb-1">
        <ShimmerBlock className="h-9 flex-1" />
        <ShimmerBlock className="h-9 w-24" />
      </div>

      {/* Rows */}
      <div className="grid gap-px">
        {/* Header row */}
        <div
          className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-[14px] py-[10px] border-b border-[var(--sh-glass-border)]"
        >
          <ShimmerBlock className="h-3 w-20" />
          <ShimmerBlock className="h-3 w-24" />
          <ShimmerBlock className="h-3 w-16" />
          <ShimmerBlock className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-[14px] py-3 border-b border-[var(--sh-glass-border)]"
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
    <div className="p-[18px_22px] grid gap-[14px]">
      {/* Action bar placeholder */}
      <div className="shTableGlass p-5">
        <ShimmerBlock className="h-24 w-full" />
      </div>

      {/* Hero section */}
      <div className="shTableGlass p-5">
        <ShimmerBlock className="h-48 w-full" />
      </div>

      {/* Fact panels */}
      <div className="grid grid-cols-[repeat(${Math.min(panels,2)},1fr)] gap-3">
        {Array.from({ length: panels }).map((_, i) => (
          <div key={i} className="shTableGlass p-4">
            <ShimmerBlock className="h-4 w-24 mb-3" />
            {[1, 2, 3, 4].map((r) => (
              <div key={r} className="flex justify-between mb-2">
                <ShimmerBlock className="h-3 w-16" />
                <ShimmerBlock className="h-3 w-32" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Related lists */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((col) => (
          <div key={col} className="shTableGlass p-4">
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
    <div className="p-[14px_22px] grid gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBlock key={i} className={`h-${i === 0 ? 5 : 3} w-${i === 0 ? 48 : 36}`} />
      ))}
    </div>
  );
}
