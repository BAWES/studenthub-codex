"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getEmployeeByIdSchema, employeeDetailSchema } from "./schemas";
import type { EmployeeDetail, GetEmployeeByIdInput } from "./schemas";

/**
 * Get a single employee by UUID with designation and department names.
 * Requires `admin.read` capability.
 */
export async function getEmployeeById(
  input: GetEmployeeByIdInput,
): Promise<EmployeeDetail | null> {
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

  const result: EmployeeDetail = {
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

  const outputParsed = employeeDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/employees/[id]] getEmployeeById output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
