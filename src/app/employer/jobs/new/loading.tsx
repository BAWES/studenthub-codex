import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerJobNewLoading() {
  return (
    <div className="workspaceContent" aria-busy="true">
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
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  );
}
