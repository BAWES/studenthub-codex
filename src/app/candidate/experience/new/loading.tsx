import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function CandidateExperienceNewLoading() {
  return (
    <div className="block">
      <DataTableSkeleton rows={8} />
    </div>
  );
}
