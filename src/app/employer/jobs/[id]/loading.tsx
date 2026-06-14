import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerJobDetailLoading() {
  return (
    <div className="workspaceContent" aria-busy="true">
      {/* Form skeleton */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
      {/* Applications link skeleton */}
      <div className="mt-8 pt-6 border-t border-[var(--border)]">
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
    </div>
  );
}
