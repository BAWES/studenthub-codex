"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSalarySchema,
  getSalarySchema,
  createSalarySchema,
  updateSalarySchema,
  deleteSalarySchema,
  salaryItemSchema,
  listSalaryResultSchema,
  salaryActionResponseSchema,
  type ListSalaryInput,
  type GetSalaryParams,
  type CreateSalaryParams,
  type UpdateSalaryParams,
  type DeleteSalaryParams,
  type SalaryItem,
  type ListSalaryResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const salarySelect = {
  staff_salary_uuid: true,
  staff_id: true,
  salary: true,
  salary_currency: true,
  comment: true,
  salary_date: true,
  created_at: true,
  updated_at: true,
} as const;

function mapSalary(row: any): SalaryItem {
  return {
    staff_salary_uuid: row.staff_salary_uuid,
    staff_id: row.staff_id,
    staff_name: row.staff?.staff_name ?? null,
    salary: row.salary ? Number(row.salary) : null,
    salary_currency: row.salary_currency,
    comment: row.comment,
    salary_date: row.salary_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * List salary records for the admin page.
 * Returns paginated salary records ordered by salary_date desc.
 */
export async function listSalaries(
  input: ListSalaryInput = {},
): Promise<ListSalaryResult> {
  await requireCapability("admin.read");

  const parsed = listSalarySchema.safeParse(input);
  if (!parsed.success) {
    return { salaries: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.staff = { staff_name: { contains: search } };
  }

  const [rows, total] = await Promise.all([
    prisma.staff_salary.findMany({
      where: where as any,
      orderBy: { salary_date: "desc" },
      skip,
      take: limit,
      select: {
        ...salarySelect,
        staff: {
          select: { staff_name: true },
        },
      },
    }),
    prisma.staff_salary.count({ where: where as any }),
  ]);

  const salaries = rows.map(mapSalary);

  const result = {
    salaries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listSalaryResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/salary] listSalaries output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Create a new salary record.
 */
export async function createSalary(
  params: CreateSalaryParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = createSalarySchema.safeParse(params);
  if (!parsed.success) {
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
    salaryActionResponseSchema.safeParse(errorResult);
    return errorResult;
  }

  const { staffId, salary, salaryCurrency, comment, salaryDate } = parsed.data;

  try {
    await prisma.staff_salary.create({
      data: {
        staff_salary_uuid: crypto.randomUUID(),
        staff_id: staffId,
        salary,
        salary_currency: salaryCurrency,
        comment: comment ?? null,
        salary_date: new Date(salaryDate),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const successResult = {
      operation: "success",
      message: "Salary record created successfully",
    };
    salaryActionResponseSchema.safeParse(successResult);
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "Failed to create salary record. Please contact support.",
    };
    salaryActionResponseSchema.safeParse(errorResult);
    return errorResult;
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Update an existing salary record.
 */
export async function updateSalary(
  params: UpdateSalaryParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = updateSalarySchema.safeParse(params);
  if (!parsed.success) {
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };
    salaryActionResponseSchema.safeParse(errorResult);
    return errorResult;
  }

  const { salaryUuid, salary, salaryCurrency, comment, salaryDate } =
    parsed.data;

  const existing = await prisma.staff_salary.findFirst({
    where: { staff_salary_uuid: salaryUuid },
  });

  if (!existing) {
    const notFoundResult = {
      operation: "error",
      message: "Salary record not found",
    };
    salaryActionResponseSchema.safeParse(notFoundResult);
    return notFoundResult;
  }

  try {
    await prisma.staff_salary.update({
      where: { staff_salary_uuid: salaryUuid },
      data: {
        salary,
        salary_currency: salaryCurrency,
        comment: comment ?? existing.comment,
        salary_date: new Date(salaryDate),
        updated_at: new Date(),
      },
    });

    const successResult = {
      operation: "success",
      message: "Salary record updated successfully",
    };
    salaryActionResponseSchema.safeParse(successResult);
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "Failed to update salary record. Please contact support.",
    };
    salaryActionResponseSchema.safeParse(errorResult);
    return errorResult;
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Delete a salary record by UUID.
 */
export async function deleteSalary(
  params: DeleteSalaryParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = deleteSalarySchema.safeParse(params);
  if (!parsed.success) {
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid delete parameters",
    };
    salaryActionResponseSchema.safeParse(errorResult);
    return errorResult;
  }

  const { salaryUuid } = parsed.data;

  const existing = await prisma.staff_salary.findFirst({
    where: { staff_salary_uuid: salaryUuid },
  });

  if (!existing) {
    const notFoundResult = {
      operation: "error",
      message: "Salary record not found",
    };
    salaryActionResponseSchema.safeParse(notFoundResult);
    return notFoundResult;
  }

  try {
    await prisma.staff_salary.delete({
      where: { staff_salary_uuid: salaryUuid },
    });

    const successResult = {
      operation: "success",
      message: "Salary record deleted successfully",
    };
    salaryActionResponseSchema.safeParse(successResult);
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "Failed to delete salary record. Please try again.",
    };
    salaryActionResponseSchema.safeParse(errorResult);
    return errorResult;
  }
}
