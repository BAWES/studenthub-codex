1|<<<<<<< HEAD
2|export default function AdminSalaryListLoading() {
3|  return (
4|    <div className="flex items-center justify-center min-h-[400px]">
5|      <div className="text-sm text-muted-foreground">Loading salaries...</div>
6|=======
7|import { DataTableSkeleton } from "@/modules/workspace/Skeletons";
8|
9|export default function AdminSalaryLoading() {
10|  return (
11|    <div className="shell shellEmbedded">
12|      <section className="workspaceStage">
13|        <section className="topbar">
14|          <div>
15|            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
16|            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
17|          </div>
18|        </section>
19|        <DataTableSkeleton rows={6} />
20|      </section>
21|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
22|    </div>
23|  );
24|}
25|