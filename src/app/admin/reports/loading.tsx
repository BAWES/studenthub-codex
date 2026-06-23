import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function AdminReportsLoading() {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="sticky top-2.5 z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="h-4 w-40 mb-2 rounded bg-white/5 animate-pulse" />
              <div className="h-3 w-full mb-4 rounded bg-white/5 animate-pulse" />
              <div className="h-9 w-36 rounded-lg bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
