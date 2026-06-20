1|"use client";
2|
3|import { useRouter } from "next/navigation";
4|import { DataTable } from "@/modules/workspace/DataTable";
5|import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
6|
7|import type { SessionUser } from "@/modules/auth/types";
8|<<<<<<< HEAD
9|import type { SalaryItem } from "@/modules/admin/salary/schemas";
10|=======
11|import type { SalaryItem } from "../schemas";
12|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
13|
14|type Props = {
15|  session: SessionUser;
16|  salaries: SalaryItem[];
17|  total: number;
18|};
19|
20|export function AdminSalaryTable({ session, salaries, total }: Props) {
21|  const router = useRouter();
22|
23|  return (
24|    <WorkspaceShell
25|      session={session}
26|      eyebrow="Admin settings"
27|      title="Salaries — staff salary records."
28|      metrics={[
29|        { label: "Total salaries", value: total, note: "Salary records in the system" },
30|      ]}
31|    >
32|      <DataTable
33|        title="Salaries"
34|        description="All salary records. Click a row to view details."
35|        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
36|        rowHref={undefined}
37|        columns={[
38|          {
39|            key: "salary",
40|            label: "Salary",
41|            render: (row) => (
42|              <span className="text-sm font-medium">
43|                {row.salary != null
44|                  ? `${row.salary.toLocaleString()} ${row.salary_currency ?? ""}`
45|<<<<<<< HEAD
46|                  : "—"}
47|=======
48|                  : "\u2014"}
49|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
50|              </span>
51|            ),
52|          },
53|          {
54|            key: "comment",
55|            label: "Comment",
56|            render: (row) => (
57|              <span className="text-sm text-muted-foreground">
58|<<<<<<< HEAD
59|                {row.comment ?? "—"}
60|=======
61|                {row.comment ?? "\u2014"}
62|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
63|              </span>
64|            ),
65|          },
66|          {
67|            key: "salary_date",
68|            label: "Date",
69|            render: (row) => (
70|              <span className="text-sm text-muted-foreground">
71|                {row.salary_date
72|                  ? new Date(row.salary_date).toLocaleDateString()
73|<<<<<<< HEAD
74|                  : "—"}
75|=======
76|                  : "\u2014"}
77|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
78|              </span>
79|            ),
80|          },
81|        ]}
82|      />
83|    </WorkspaceShell>
84|  );
85|}
86|