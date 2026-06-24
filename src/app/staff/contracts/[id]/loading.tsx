import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";
import { WorkspaceShellSkeleton } from "@/modules/workspace/Skeletons";

export default function StaffContractsIdLoading() {
  return (
    <div className="block">
      <WorkspaceShellSkeleton rowCount={3} />
      <DetailPageSkeleton panels={2} />
    </div>
  );
}
