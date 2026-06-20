import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function AdminReportsLoading() {
  return (
<<<<<<< Updated upstream
    <div className="min-h-screen p-6">
      <section className="space-y-6">
        <section className="flex items-center justify-between gap-4">
=======
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="topbar">
>>>>>>> Stashed changes
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
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
