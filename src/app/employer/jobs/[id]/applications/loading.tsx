import { DataTableSkeleton } from "@/modules/workspace/Skeletons";

export default function EmployerJobApplicationsLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <section className="topbar">
          <div>
            <div className="h-3 w-32 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <DataTableSkeleton rows={8} />
      </section>
    </div>
  );
}
