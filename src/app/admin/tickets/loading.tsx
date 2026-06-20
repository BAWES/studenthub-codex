import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function AdminTicketsLoading() {
  return (
    <div className="min-h-0">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="topbar">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <DataTableSkeleton rows={8} />
      </section>
    </div>
  );
}
