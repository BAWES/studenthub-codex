import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailLoading() {
  return (
    <div className="block" aria-busy="true">
      {/* Header skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-h-[88px] p-4 rounded-lg bg-card border border-border">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Detail panels skeleton */}
      <div className="rounded-lg border border-border bg-card">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="grid grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div className="min-h-[88px] px-[18px] py-4 border-r border-b border-border" key={i}>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="grid grid-cols-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="min-h-[88px] px-[18px] py-4 border-r border-b border-border" key={i}>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Payouts skeleton */}
      <div className="rounded-lg border border-border bg-card">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="rows compactRows">
          {Array.from({ length: 3 }).map((_, i) => (
            <article className="row" key={i}>
              <div className="rowMain">
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
