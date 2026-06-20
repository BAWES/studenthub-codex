1|import { requireRoleCapability } from "@/modules/auth/session";
2|import { listSalaries } from "./actions";
3|<<<<<<< HEAD
4|import { AdminSalaryTable } from "./_components/admin-salary-table";
5|=======
6|import { AdminSalaryTable } from "./_components";
7|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
8|
9|export const dynamic = "force-dynamic";
10|
11|export default async function AdminSalaryListPage() {
12|  const session = await requireRoleCapability("admin", "admin.read");
13|<<<<<<< HEAD
14|  const { salaries, total } = await listSalaries();
15|
16|  return (
17|    <AdminSalaryTable session={session} salaries={salaries} total={total} />
18|=======
19|  const result = await listSalaries({ limit: 100 });
20|
21|  return (
22|    <AdminSalaryTable
23|      session={session}
24|      salaries={result.salaries}
25|      total={result.total}
26|    />
27|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
28|  );
29|}
30|