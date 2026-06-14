import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDetailLoading() {
  return (
    <div className="workspaceContent" aria-busy="true">
      {/* Header metrics skeleton */}
      <div className="metricGrid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="metricCard">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Detail panels skeleton */}
      <div className="detailPanel">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="factGrid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="fact" key={i}>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="detailPanel">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="factGrid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="fact" key={i}>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
