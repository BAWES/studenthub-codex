import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function CompanyCompaniesLoading() {
  return (
    <div className="min-h-screen p-6">
      <section className="space-y-6">
        <section className="flex items-center justify-between gap-4">
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
