import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStoryDetailLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}
