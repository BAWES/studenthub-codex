import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";

export default function CandidateDocumentDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <DetailPageSkeleton panels={1} />
      </section>
    </div>
  );
}
