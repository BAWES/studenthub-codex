import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function AdminDegreeDetailLoading() {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="sticky top-2.5 z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="grid gap-3.5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
