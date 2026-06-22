import { DetailPageSkeleton } from "@/modules/workspace/Skeletons";

export default function AttendanceDetailLoading() {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <DetailPageSkeleton panels={3} />
      </section>
    </div>
  );
}
