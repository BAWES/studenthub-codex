import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";

export default function DiscountCategoryDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <DetailPageSkeleton panels={3} />
      </section>
    </div>
  );
}
