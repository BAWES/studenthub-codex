import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStoryLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="rounded-lg border">
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
