"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSalarySchema,
  createSalarySchema,
  updateSalarySchema,
  deleteSalarySchema,
  listSalaryResultSchema,
  salaryActionResponseSchema,
  getSalaryInputSchema,
} from "./schemas";
import type {
  ListSalaryInput,
  ListSalaryResult,
  SalaryActionResponse,
  SalaryDetailResult,
} from "./schemas";

export async function listSalaries(
  input: ListSalaryInput = {},
): Promise<ListSalaryResult> {
  await requireCapability("admin.read");
  const parsed = listSalarySchema.safeParse(input);
  if (!parsed.success)
    return { salaries: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.staff = {
      staff_name: { contains: search },
    };
  }

  const [rows, total] = await Promise.all([
    prisma.staff_salary.findMany({
      where,
      orderBy: { salary_date: "desc" },
      skip,
      take: limit,
      include: {
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.staff_salary.count({ where }),
  ]);

  const salaries = rows.map((row) => ({
    staff_salary_uuid: row.staff_salary_uuid,
    staff_id: row.staff_id,
    staff_name: row.staff?.staff_name ?? null,
    salary: row.salary ? Number(row.salary) : null,
    salary_currency: row.salary_currency,
    comment: row.comment,
    salary_date: row.salary_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

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

export async function createSalary(
  _prev: unknown,
  formData: FormData,
): Promise<SalaryActionResponse> {
  await requireCapability("admin.write");
  const parsed = createSalarySchema.safeParse({
    staffId: formData.get("staffId"),
    salary: formData.get("salary"),
    salaryCurrency: formData.get("salaryCurrency") || "KWD",
    comment: formData.get("comment") || undefined,
    salaryDate: formData.get("salaryDate"),
  });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const data = parsed.data;
    await prisma.staff_salary.create({
      data: {
        staff_salary_uuid: crypto.randomUUID(),
        staff_id: data.staffId,
        salary: data.salary,
        salary_currency: data.salaryCurrency,
        comment: data.comment ?? null,
        salary_date: data.salaryDate,
      },
    });
    revalidatePath("/admin/salary");
    const result = {
      operation: "success",
      message: "Salary record created successfully",
    };
    const outputParsed = salaryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/salary] createSalary output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem creating the salary record, please contact us for assistance.",
    };
    const outputParsed = salaryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/salary] createSalary output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function updateSalary(
  _prev: unknown,
  formData: FormData,
): Promise<SalaryActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateSalarySchema.safeParse({
    salaryUuid: formData.get("salaryUuid"),
    salary: formData.get("salary"),
    salaryCurrency: formData.get("salaryCurrency") || "KWD",
    comment: formData.get("comment") || undefined,
    salaryDate: formData.get("salaryDate"),
  });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const data = parsed.data;
    const existing = await prisma.staff_salary.findUnique({
      where: { staff_salary_uuid: data.salaryUuid },
      select: { staff_salary_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Salary record not found" };

    await prisma.staff_salary.update({
      where: { staff_salary_uuid: data.salaryUuid },
      data: {
        salary: data.salary,
        salary_currency: data.salaryCurrency,
        comment: data.comment ?? null,
        salary_date: data.salaryDate,
      },
    });
    revalidatePath("/admin/salary");
    const result = {
      operation: "success",
      message: "Salary record updated successfully",
    };
    const outputParsed = salaryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/salary] updateSalary output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem updating the salary record, please contact us for assistance.",
    };
    const outputParsed = salaryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/salary] updateSalary output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function deleteSalary(
  salaryUuid: string,
): Promise<SalaryActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteSalarySchema.safeParse({ salaryUuid });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid salary UUID",
    };

  try {
    const existing = await prisma.staff_salary.findUnique({
      where: { staff_salary_uuid: parsed.data.salaryUuid },
      select: { staff_salary_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Salary record not found" };

    await prisma.staff_salary.delete({
      where: { staff_salary_uuid: parsed.data.salaryUuid },
    });
    revalidatePath("/admin/salary");
    const result = {
      operation: "success",
      message: "Salary record deleted successfully",
    };
    const outputParsed = salaryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/salary] deleteSalary output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem deleting the salary record, please contact us for assistance.",
    };
    const outputParsed = salaryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/salary] deleteSalary output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function getSalary(
  salaryUuid: string,
): Promise<SalaryDetailResult> {
  await requireCapability("admin.read");
  const parsed = getSalaryInputSchema.safeParse({ salaryUuid });
  if (!parsed.success) return { salary: null, staff_name: null };

  const row = await prisma.staff_salary.findUnique({
    where: { staff_salary_uuid: parsed.data.salaryUuid },
    include: {
      staff: { select: { staff_name: true } },
    },
  });

  if (!row) return { salary: null, staff_name: null };

  const result: SalaryDetailResult = {
    salary: {
      staff_salary_uuid: row.staff_salary_uuid,
      staff_id: row.staff_id,
      staff_name: row.staff?.staff_name ?? null,
      salary: row.salary ? Number(row.salary) : null,
      salary_currency: row.salary_currency,
      comment: row.comment,
      salary_date: row.salary_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    staff_name: row.staff?.staff_name ?? null,
  };

  return result;
}

export async function listStaff(): Promise<
  { staff_id: number; staff_name: string }[]
> {
  await requireCapability("admin.read");
  const rows = await prisma.staff.findMany({
    where: { deleted: 0 },
    orderBy: { staff_name: "asc" },
    select: { staff_id: true, staff_name: true },
  });
  return rows;
}
