import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function AdminAttendanceLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <section className="topbar">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-48" />
          </div>
        </section>
        <DataTableSkeleton rows={8} />
      </section>
    </div>
  );
}
