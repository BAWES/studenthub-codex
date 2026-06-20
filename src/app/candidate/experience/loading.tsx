import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function CandidateExperienceLoading() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="h-3 w-24 mb-2 rounded bg-muted animate-pulse" />
        <div className="h-7 w-48 rounded bg-muted animate-pulse" />
      </div>
      <DataTableSkeleton rows={8} />
    </div>
  );
}
