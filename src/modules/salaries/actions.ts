"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSalariesSchema,
  getSalarySchema,
  listSalariesResultSchema,
  salaryListItemSchema,
  createSalarySchema,
  updateSalarySchema,
  deleteSalarySchema,
  salaryIdResultSchema,
  type SalaryListItem,
  type ListSalariesResult,
  type SalaryIdResult,
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

// ---------------------------------------------------------------------------
// createSalary — create a new salary record
// ---------------------------------------------------------------------------

export async function createSalary(
  data: z.input<typeof createSalarySchema>,
): Promise<SalaryIdResult> {
  await requireCapability("admin.system");

  const parsed = createSalarySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary data");
  }

  const { staff_id, salary, salary_currency, comment, salary_date } =
    parsed.data;

  const record = await prisma.staff_salary.create({
    data: {
      staff_salary_uuid: crypto.randomUUID(),
      staff_id: staff_id ?? null,
      salary: salary ?? null,
      salary_currency: salary_currency || "KWD",
      comment: comment || null,
      salary_date: salary_date ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/admin/salary");
  const result: SalaryIdResult = {
    staff_salary_uuid: record.staff_salary_uuid,
  };

  const outputParsed = salaryIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/salaries] createSalary output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateSalary — update an existing salary record
// ---------------------------------------------------------------------------

export async function updateSalary(
  data: z.input<typeof updateSalarySchema>,
): Promise<SalaryIdResult> {
  await requireCapability("admin.system");

  const parsed = updateSalarySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary data");
  }

  const {
    staff_salary_uuid,
    staff_id,
    salary,
    salary_currency,
    comment,
    salary_date,
  } = parsed.data;

  const existing = await prisma.staff_salary.findFirst({
    where: { staff_salary_uuid },
  });
  if (!existing) {
    throw new Error(`Salary record not found: ${staff_salary_uuid}`);
  }

  const updateData: Record<string, unknown> = {};
  if (staff_id !== undefined) updateData.staff_id = staff_id ?? null;
  if (salary !== undefined) updateData.salary = salary ?? null;
  if (salary_currency !== undefined)
    updateData.salary_currency = salary_currency || "KWD";
  if (comment !== undefined) updateData.comment = comment || null;
  if (salary_date !== undefined) updateData.salary_date = salary_date ?? null;
  updateData.updated_at = new Date();

  await prisma.staff_salary.update({
    where: { staff_salary_uuid },
    data: updateData as any,
  });

  revalidatePath("/admin/salary");
  const result: SalaryIdResult = { staff_salary_uuid };

  const outputParsed = salaryIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/salaries] updateSalary output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteSalary — delete a salary record
// ---------------------------------------------------------------------------

export async function deleteSalary(
  staff_salary_uuid: string,
): Promise<SalaryIdResult> {
  await requireCapability("admin.system");

  const parsed = deleteSalarySchema.safeParse({ staff_salary_uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary UUID");
  }

  const existing = await prisma.staff_salary.findFirst({
    where: { staff_salary_uuid: parsed.data.staff_salary_uuid },
  });
  if (!existing) {
    throw new Error(
      `Salary record not found: ${parsed.data.staff_salary_uuid}`,
    );
  }

  await prisma.staff_salary.delete({
    where: { staff_salary_uuid: parsed.data.staff_salary_uuid },
  });

  revalidatePath("/admin/salary");
  const result: SalaryIdResult = {
    staff_salary_uuid: parsed.data.staff_salary_uuid,
  };

  const outputParsed = salaryIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/salaries] deleteSalary output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
