import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function CandidateCertificationsLoading() {
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
        <DataTableSkeleton rows={8} />
      </section>
    </div>
  );
}
