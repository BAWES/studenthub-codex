1|<<<<<<< HEAD
2|// ---------------------------------------------------------------------------
3|// Admin salaries — schemas and types for the admin/salary page
4|// ---------------------------------------------------------------------------
5|
6|import { z } from "zod";
7|=======
8|import { z } from "zod";
9|
10|// ---------------------------------------------------------------------------
11|// Admin salary — schemas and types
12|// ---------------------------------------------------------------------------
13|
14|export const listSalaryInputSchema = z.object({
15|  page: z.coerce.number().int().positive().optional().default(1),
16|  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
17|});
18|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
19|
20|export const salaryItemSchema = z.object({
21|  staff_salary_uuid: z.string(),
22|  staff_name: z.string().nullable().optional(),
23|  salary: z.number().nullable().optional(),
24|  salary_currency: z.string().nullable().optional(),
25|  comment: z.string().nullable().optional(),
26|  salary_date: z.date().nullable().optional(),
27|});
28|
29|<<<<<<< HEAD
30|export type SalaryItem = z.infer<typeof salaryItemSchema>;
31|
32|export const listSalariesResultSchema = z.object({
33|  salaries: z.array(salaryItemSchema),
34|  total: z.number(),
35|});
36|
37|export type ListSalariesResult = z.infer<typeof listSalariesResultSchema>;
38|=======
39|export const listSalariesResultSchema = z.object({
40|  salaries: z.array(salaryItemSchema),
41|  total: z.number().int().nonnegative(),
42|  page: z.number().int().positive(),
43|  limit: z.number().int().positive(),
44|  totalPages: z.number().int().nonnegative(),
45|});
46|
47|export const salaryActionResponseSchema = z.object({
48|  operation: z.string().min(1),
49|  message: z.string().min(1),
50|});
51|
52|export type ListSalaryInput = z.input<typeof listSalaryInputSchema>;
53|export type SalaryItem = z.output<typeof salaryItemSchema>;
54|export type ListSalariesResult = z.output<typeof listSalariesResultSchema>;
55|export type SalaryActionResponse = z.output<typeof salaryActionResponseSchema>;
56|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
57|