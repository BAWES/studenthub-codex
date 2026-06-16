import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function EmployerApplicationsLoading() {
  return (
    <div className="p-6">
      <DataTableSkeleton rows={8} />
    </div>
  );
}
