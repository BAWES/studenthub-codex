"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSalariesSchema,
  getSalarySchema,
  listSalariesResultSchema,
  salaryListItemSchema,
  type SalaryListItem,
  type ListSalariesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listSalaries
// ---------------------------------------------------------------------------

/**
 * List staff salary records with pagination and optional search on staff name/comment.
 */
export async function listSalaries(
  params: FormData | z.input<typeof listSalariesSchema> = {},
): Promise<ListSalariesResult> {
  await requireCapability("admin.system");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
        }
      : params;

  const parsed = listSalariesSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search && search.trim()) {
    where.OR = [
      { comment: { contains: search, mode: "insensitive" } },
      { staff: { staff_name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.staff_salary.findMany({
      where: where as any,
      orderBy: { salary_date: "desc" },
      skip,
      take: limit,
      include: {
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.staff_salary.count({ where: where as any }),
  ]);

  const result: ListSalariesResult = {
    records: records.map((r): SalaryListItem => ({
      staff_salary_uuid: r.staff_salary_uuid,
      staff_id: r.staff_id ?? null,
      staff_name: r.staff?.staff_name ?? null,
      salary: r.salary ? Number(r.salary) : null,
      salary_currency: r.salary_currency ?? null,
      comment: r.comment ?? null,
      salary_date: r.salary_date?.toISOString() ?? null,
      created_at: r.created_at?.toISOString() ?? null,
      updated_at: r.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listSalariesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/salaries] listSalaries output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getSalary
// ---------------------------------------------------------------------------

/**
 * Get a single salary record by UUID.
 * Returns null if not found.
 */
export async function getSalary(
  salaryUuid: string,
): Promise<SalaryListItem | null> {
  await requireCapability("admin.system");

  const parsed = getSalarySchema.safeParse({ salaryUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary UUID");
  }

  const record = await prisma.staff_salary.findFirst({
    where: { staff_salary_uuid: parsed.data.salaryUuid },
    include: {
      staff: { select: { staff_name: true, staff_email: true, staff_job_title: true } },
    },
  });

  if (!record) return null;

  const result: SalaryListItem = {
    staff_salary_uuid: record.staff_salary_uuid,
    staff_id: record.staff_id ?? null,
    staff_name: record.staff?.staff_name ?? null,
    salary: record.salary ? Number(record.salary) : null,
    salary_currency: record.salary_currency ?? null,
    comment: record.comment ?? null,
    salary_date: record.salary_date?.toISOString() ?? null,
    created_at: record.created_at?.toISOString() ?? null,
    updated_at: record.updated_at?.toISOString() ?? null,
  };

  const outputParsed = salaryListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/salaries] getSalary output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
