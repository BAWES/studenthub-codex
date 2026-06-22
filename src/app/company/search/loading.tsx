import { Skeleton } from "@/components/ui/skeleton";

export default function CompanySearchLoading() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <Skeleton variant="pulse" className="mb-2 h-8 w-40" />
        <Skeleton variant="pulse" className="h-4 w-72" />
      </div>
      <div className="mb-6 flex gap-2">
        <Skeleton variant="pulse" className="h-11 flex-1 rounded-lg" />
        <Skeleton variant="pulse" className="h-11 w-24 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
            <Skeleton variant="pulse" className="h-5 w-40" />
            <Skeleton variant="pulse" className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
