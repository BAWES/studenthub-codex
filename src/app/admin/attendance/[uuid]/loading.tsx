import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";

export default function AttendanceDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <DetailPageSkeleton panels={3} />
      </section>
    </div>
  );
}
