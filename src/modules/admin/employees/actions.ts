"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import crypto from "crypto";
import {
  listEmployeesSchema,
  createEmployeeSchema,
  listEmployeesResultSchema,
  actionResponseSchema,
  getEmployeeByIdSchema,
  employeeDetailSchema,
  type ListEmployeesInput,
  type ListEmployeesResult,
  type CreateEmployeeInput,
  type ActionResponse,
  type GetEmployeeByIdInput,
} from "./schemas";

function generateUuid(): string {
  return crypto.randomUUID();
}

export async function listAdminEmployees(
  input: ListEmployeesInput = {},
): Promise<ListEmployeesResult> {
  await requireCapability("admin.read");
  const parsed = listEmployeesSchema.safeParse(input);
  if (!parsed.success) {
    return { employees: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  const { page, limit, name } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
  if (name && name.trim()) {
    where.employee_name = { contains: name, mode: "insensitive" };
  }

  const rows = await prisma.employee.findMany({
      where: where as any,
      orderBy: { employee_created_at: "desc" },
      skip,
      take: limit,
    });

  const employees = rows.map((r: any) => ({
    employee_uuid: r.employee_uuid,
    employee_name: r.employee_name,
    employee_email: r.employee_email,
    employee_phone: r.employee_phone,
    employee_salary: r.employee_salary ? Number(r.employee_salary) : null,
    employee_status: r.employee_status,
    employee_created_at: r.employee_created_at,
    employee_updated_at: r.employee_updated_at,
    designation_uuid: r.designation_uuid,
    department_uuid: r.department_uuid,
    deleted: r.deleted,
  }));

  const total = await prisma.employee.count({ where: where as any });

  const result = { employees, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listEmployeesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/employees] listAdminEmployees output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function createAdminEmployee(
  data: CreateEmployeeInput,
): Promise<ActionResponse> {
  await requireCapability("admin.write");
  const parsed = createEmployeeSchema.safeParse(data);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const now = new Date();
    await prisma.employee.create({
      data: {
        employee_uuid: generateUuid(),
        employee_name: parsed.data.employeeName,
        employee_email: parsed.data.employeeEmail,
        employee_phone: parsed.data.employeePhone ?? null,
        employee_salary: parsed.data.employeeSalary ?? 0,
        employee_status: parsed.data.employeeStatus,
        employee_created_at: now,
        employee_updated_at: now,
        deleted: 0,
        designation_uuid: parsed.data.designationUuid ?? null,
        department_uuid: parsed.data.departmentUuid ?? null,
      } as any,
    });
    revalidatePath("/admin/employees");
    const result: ActionResponse = { operation: "success", message: "Employee created" };
    actionResponseSchema.parse(result);
    return result;
  } catch {
    return { operation: "error", message: "Failed to create employee" };
  }
}

export async function deleteAdminEmployee(
  uuid: string,
): Promise<ActionResponse> {
  await requireCapability("admin.write");
  try {
    await prisma.employee.update({
      where: { employee_uuid: uuid },
      data: { deleted: 1, employee_updated_at: new Date() },
    });
    revalidatePath("/admin/employees");
    const result: ActionResponse = { operation: "success", message: "Employee deactivated" };
    actionResponseSchema.parse(result);
    return result;
  } catch {
    return { operation: "error", message: "Failed to deactivate employee" };
  }
}

export async function getDepartments(): Promise<{ uuid: string; name: string }[]> {
  await requireCapability("admin.read");
  const rows = await prisma.department.findMany({
    orderBy: { department_name_en: "asc" },
    select: { department_uuid: true, department_name_en: true },
  });
  return rows.map((r: any) => ({ uuid: r.department_uuid, name: r.department_name_en }));
}

export async function getDesignations(): Promise<{ uuid: string; nameEn: string }[]> {
  await requireCapability("admin.read");
  const rows = await prisma.designation.findMany({
    orderBy: { designation_name_en: "asc" },
    select: { designation_uuid: true, designation_name_en: true },
  });
  return rows.map((r: any) => ({ uuid: r.designation_uuid, nameEn: r.designation_name_en }));
}

// ---------------------------------------------------------------------------
// getEmployeeById
// ---------------------------------------------------------------------------

/**
 * Get a single employee by UUID with designation and department names.
 * Requires `admin.read` capability.
 */
export async function getEmployeeById(
  input: GetEmployeeByIdInput,
): Promise<z.output<typeof employeeDetailSchema> | null> {
  await requireCapability("admin.read");

  const parsed = getEmployeeByIdSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid employee UUID");
  }

  const row = await prisma.employee.findUnique({
    where: { employee_uuid: parsed.data.uuid },
    include: {
      designation: { select: { designation_name_en: true } },
      department: { select: { department_name_en: true } },
    },
  });

  if (!row) return null;

  const result = {
    employee_uuid: row.employee_uuid,
    employee_name: row.employee_name,
    employee_email: row.employee_email,
    employee_phone: row.employee_phone,
    employee_salary: row.employee_salary ? Number(row.employee_salary) : null,
    employee_status: row.employee_status,
    employee_created_at: row.employee_created_at,
    employee_updated_at: row.employee_updated_at,
    designation_uuid: row.designation_uuid,
    department_uuid: row.department_uuid,
    designation_name_en: row.designation?.designation_name_en ?? null,
    department_name_en: row.department?.department_name_en ?? null,
  };

  // Validate output shape
  const outputParsed = employeeDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/employees] getEmployeeById output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
