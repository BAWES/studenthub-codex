import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";

export default function CurrencyDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <DetailPageSkeleton panels={3} />
      </section>
    </div>
  );
}
