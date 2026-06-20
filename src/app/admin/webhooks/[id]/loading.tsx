import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";

export default function WebhookDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <DetailPageSkeleton panels={3} />
      </section>
    </div>
  );
}
