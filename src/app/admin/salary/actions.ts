// ---------------------------------------------------------------------------
// Admin salary list — server action
// ---------------------------------------------------------------------------

import "server-only";

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

import {
  listSalariesResultSchema,
  type ListSalariesResult,
} from "@/modules/admin/salary/schemas";

/**
 * List all salaries for the admin page.
 * Returns the most recent 100 salary records with staff names.
 */
export async function listSalaries(): Promise<ListSalariesResult> {
  await requireRoleCapability("admin", "admin.read");

  const [raw, total] = await Promise.all([
    prisma.staff_salary.findMany({
      orderBy: { salary_date: "desc" },
      take: 100,
    }),
    prisma.staff_salary.count(),
  ]);

  const salaries = raw.map((s) => ({
    staff_salary_uuid: s.staff_salary_uuid,
    salary: s.salary ? Number(s.salary) : null,
    salary_currency: s.salary_currency,
    comment: s.comment,
    salary_date: s.salary_date,
  }));

  const result: ListSalariesResult = { salaries, total };
  const parsed = listSalariesResultSchema.safeParse(result);
  if (!parsed.success) {
    console.error("[admin/salary] output validation failed:", parsed.error.issues);
  }

  return result;
}
