"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceShellSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <main className="block min-h-0">
      <section className="min-w-0 w-[calc(100vw-236px)] overflow-x-hidden grid content-start gap-3.5 p-3.5 max-md:w-auto max-md:p-2.5 max-md:pb-[76px]">
        <section className="grid grid-cols-[minmax(0,1fr)_minmax(220px,300px)] items-center gap-[18px] border border-[#dfe4ed] rounded-lg bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-4">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="min-w-0 grid gap-1.5 p-3.5 border border-[var(--line)] bg-[var(--surface)] rounded-lg">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </section>
        <section className="grid grid-cols-4 gap-3 max-[1040px]:grid-cols-1" aria-label="Loading metrics">
          {[1, 2, 3, 4].map((i) => (
            <article className="min-h-[118px] p-[18px] border border-[var(--line)] bg-[var(--surface)]" key={i}>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-9 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </article>
          ))}
        </section>
        <div className="px-[22px] py-[18px] grid gap-3.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <section className="grid grid-cols-2 gap-3 max-[1040px]:grid-cols-1">
          {[1, 2].map((col) => (
            <section className="border border-[var(--line)] bg-[var(--surface)]" key={col}>
              <div className="min-h-[62px] flex items-center justify-between gap-4 px-[18px] py-[18px] pb-3.5 border-b border-[var(--line)]">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <div className="grid">
                {Array.from({ length: rowCount }).map((_, i) => (
                  <article
                    className="min-h-[72px] grid grid-cols-[minmax(0,1fr)_minmax(126px,auto)] gap-4 px-[18px] py-3.5 border-b border-[var(--line)] last:border-b-0"
                    key={i}
                  >
                    <div className="min-w-0 grid content-center gap-1.5">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="min-w-0 grid content-center justify-items-end text-right gap-1.5">
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

export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="px-[22px] py-[18px] grid gap-3">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="flex gap-2.5 mb-1">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="grid gap-px">
        <div className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-3.5 py-2.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-3.5 py-3 border-t border-[var(--line)]"
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

export function DetailPageSkeleton({ panels = 3 }: { panels?: number }) {
  return (
    <div className="p-[22px] grid gap-3.5">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(panels, 2)}, 1fr)` }}
      >
        {Array.from({ length: panels }).map((_, i) => (
          <div key={i} className="grid gap-2 p-4 border border-[var(--line)] rounded-[10px]">
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
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((col) => (
          <div key={col} className="grid gap-1 p-4 border border-[var(--line)] rounded-[10px]">
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

export function QuickSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="py-3.5 px-[22px] grid gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-${i === 0 ? 5 : 3} w-${i === 0 ? 48 : 36}`} />
      ))}
    </div>
  );
}
