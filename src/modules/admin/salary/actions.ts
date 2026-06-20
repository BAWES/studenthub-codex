"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSalaryInputSchema,
  listSalariesResultSchema,
} from "./schemas";
import type { ListSalaryInput, ListSalariesResult } from "./schemas";

/**
 * List salary records for the admin page.
 * Returns paginated salary records ordered by salary_date desc.
 */
export async function listSalaries(
  input: ListSalaryInput = {},
): Promise<ListSalariesResult> {
  await requireCapability("admin.read");

  const parsed = listSalaryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { salaries: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.staff_salary.findMany({
      orderBy: { salary_date: "desc" },
      skip,
      take: limit,
      select: {
        staff_salary_uuid: true,
        staff_id: true,
        salary: true,
        salary_currency: true,
        comment: true,
        salary_date: true,
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.staff_salary.count(),
  ]);

  const salaries = rows.map((row) => ({
    staff_salary_uuid: row.staff_salary_uuid,
    staff_name: row.staff?.staff_name ?? null,
    salary: row.salary ? Number(row.salary) : null,
    salary_currency: row.salary_currency,
    comment: row.comment,
    salary_date: row.salary_date,
  }));

  const result = {
    salaries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listSalariesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/salary] listSalaries output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
