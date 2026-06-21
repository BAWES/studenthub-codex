import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function AdminStoriesLoading() {
  return (
    <div className="min-h-svh">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="grid grid-cols-[1fr_minmax(220px,300px)] items-center gap-4.5 border border-border rounded-lg bg-card p-4">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-muted animate-pulse" />
            <div className="h-7 w-48 rounded bg-muted animate-pulse" />
          </div>
        </section>
        <DataTableSkeleton rows={6} />
      </section>
    </div>
  );
}
