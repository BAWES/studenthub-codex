1|<<<<<<< HEAD
2|// ---------------------------------------------------------------------------
3|// Admin salary list — server action
4|// ---------------------------------------------------------------------------
5|
6|import "server-only";
7|
8|import { prisma } from "@/lib/prisma";
9|import { requireRoleCapability } from "@/modules/auth/session";
10|
11|import {
12|  listSalariesResultSchema,
13|  type ListSalariesResult,
14|} from "@/modules/admin/salary/schemas";
15|
16|/**
17| * List all salaries for the admin page.
18| * Returns the most recent 100 salary records with staff names.
19| */
20|export async function listSalaries(): Promise<ListSalariesResult> {
21|  await requireRoleCapability("admin", "admin.read");
22|
23|  const [raw, total] = await Promise.all([
24|    prisma.staff_salary.findMany({
25|      orderBy: { salary_date: "desc" },
26|      take: 100,
27|    }),
28|    prisma.staff_salary.count(),
29|  ]);
30|
31|  const salaries = raw.map((s) => ({
32|    staff_salary_uuid: s.staff_salary_uuid,
33|    salary: s.salary ? Number(s.salary) : null,
34|    salary_currency: s.salary_currency,
35|    comment: s.comment,
36|    salary_date: s.salary_date,
37|  }));
38|
39|  const result: ListSalariesResult = { salaries, total };
40|  const parsed = listSalariesResultSchema.safeParse(result);
41|  if (!parsed.success) {
42|    console.error("[admin/salary] output validation failed:", parsed.error.issues);
43|  }
44|
45|  return result;
46|}
47|=======
48|export { listSalaries } from "@/modules/admin/salary/actions";
49|export type { SalaryItem, ListSalariesResult } from "@/modules/admin/salary/schemas";
50|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
51|