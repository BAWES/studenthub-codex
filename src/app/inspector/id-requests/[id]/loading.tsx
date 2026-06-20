import { Skeleton } from "@/components/ui/skeleton";

export default function InspectorIdRequestDetailLoading() {
  return (
    <div className="workspaceContent" aria-busy="true">
      {/* Header skeleton */}
      <div className="metricGrid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="metricCard">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Detail panels */}
      <div className="rounded-lg border border-border bg-card">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="factGrid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="fact" key={i}>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-3 mt-6">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
