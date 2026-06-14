import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function EmployerJobApplicationsLoading() {
  return (
    <div className="py-6" aria-busy="true">
      <DataTableSkeleton rows={6} />
    </div>
  );
}
