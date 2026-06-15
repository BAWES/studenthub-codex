import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";

export default function CandidateDocumentDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <DetailPageSkeleton panels={1} />
      </section>
    </div>
  );
}
