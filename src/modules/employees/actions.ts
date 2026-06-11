"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import crypto from "crypto";
import {
  listEmployeesSchema,
  getEmployeeSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesResultSchema,
  employeeDetailSchema,
  createEmployeeResultSchema,
  updateEmployeeResultSchema,
  type ListEmployeesInput,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type EmployeeItem,
  type EmployeeDetail,
  type ListEmployeesResult,
  type CreateEmployeeResult,
  type UpdateEmployeeResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a UUID string for use as a primary key. */
function generateUuid(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// listEmployees
// ---------------------------------------------------------------------------

/**
 * List employees with optional filters and pagination.
 * Requires `staff.read` capability.
 */
export async function listEmployees(
  params: ListEmployeesInput = {},
): Promise<ListEmployeesResult> {
  await requireCapability("staff.read");

  const parsed = listEmployeesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { name, status, departmentUuid, designationUuid, page, limit } =
    parsed.data;

  const where: Record<string, unknown> = { deleted: 0 };

  if (name && name.trim()) {
    where.employee_name = { contains: name, mode: "insensitive" };
  }
  if (status !== undefined) {
    where.employee_status = status;
  }
  if (departmentUuid !== undefined) {
    where.department_uuid = departmentUuid;
  }
  if (designationUuid !== undefined) {
    where.designation_uuid = designationUuid;
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where: where as any,
      orderBy: { employee_created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.employee.count({ where: where as any }),
  ]);

  const result = {
    employees: employees as EmployeeItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listEmployeesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/employees] listEmployees output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getEmployee
// ---------------------------------------------------------------------------

/**
 * Get a single employee by UUID. Returns null if not found.
 * Requires `staff.read` capability.
 */
export async function getEmployee(
  employeeUuid: string,
): Promise<EmployeeDetail> {
  await requireCapability("staff.read");

  const parsed = getEmployeeSchema.safeParse({ employeeUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid employee UUID");
  }

  const employee = await prisma.employee.findUnique({
    where: { employee_uuid: parsed.data.employeeUuid },
  });

  if (!employee) return null;

  const result = employee as EmployeeItem;

  // Validate output shape
  const outputParsed = employeeDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/employees] getEmployee output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createEmployee
// ---------------------------------------------------------------------------

/**
 * Create a new employee record.
 * Requires `staff.write` capability.
 */
export async function createEmployee(
  data: CreateEmployeeInput,
): Promise<CreateEmployeeResult> {
  await requireCapability("admin.write");

  const parsed = createEmployeeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid employee data",
    );
  }

  const now = new Date();
  const employeeUuid = generateUuid();

  await prisma.employee.create({
    data: {
      employee_uuid: employeeUuid,
      employee_name: parsed.data.employeeName,
      employee_email: parsed.data.employeeEmail,
      employee_phone: parsed.data.employeePhone ?? null,
      employee_salary: parsed.data.employeeSalary
        ? parsed.data.employeeSalary
        : 0,
      employee_status: parsed.data.employeeStatus,
      employee_created_at: now,
      employee_updated_at: now,
      deleted: 0,
      designation_uuid: parsed.data.designationUuid ?? null,
      department_uuid: parsed.data.departmentUuid ?? null,
    } as any,
  });

  revalidatePath("/employees");
  const createResult = { employee_uuid: employeeUuid };

  // Validate output shape
  const createOutputParsed = createEmployeeResultSchema.safeParse(createResult);
  if (!createOutputParsed.success) {
    console.error(
      "[modules/employees] createEmployee output validation failed:",
      createOutputParsed.error.issues,
    );
  }

  return createResult;
}

// ---------------------------------------------------------------------------
// updateEmployee
// ---------------------------------------------------------------------------

/**
 * Update an existing employee record. Partial update — only provided fields change.
 * Requires `staff.write` capability.
 */
export async function updateEmployee(
  data: UpdateEmployeeInput,
): Promise<UpdateEmployeeResult> {
  await requireCapability("admin.write");

  const parsed = updateEmployeeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid employee data",
    );
  }

  const { employeeUuid, ...fields } = parsed.data;

  // Build update payload with only provided fields
  const updateData: Record<string, unknown> = {
    employee_updated_at: new Date(),
  };

  if (fields.employeeName !== undefined)
    updateData.employee_name = fields.employeeName;
  if (fields.employeeEmail !== undefined)
    updateData.employee_email = fields.employeeEmail;
  if (fields.employeePhone !== undefined)
    updateData.employee_phone = fields.employeePhone;
  if (fields.employeeSalary !== undefined)
    updateData.employee_salary = fields.employeeSalary;
  if (fields.employeeStatus !== undefined)
    updateData.employee_status = fields.employeeStatus;
  if (fields.designationUuid !== undefined)
    updateData.designation_uuid = fields.designationUuid;
  if (fields.departmentUuid !== undefined)
    updateData.department_uuid = fields.departmentUuid;

  await prisma.employee.update({
    where: { employee_uuid: employeeUuid },
    data: updateData as any,
  });

  revalidatePath("/employees");
  const updateResult = { employee_uuid: employeeUuid };

  // Validate output shape
  const updateOutputParsed = updateEmployeeResultSchema.safeParse(updateResult);
  if (!updateOutputParsed.success) {
    console.error(
      "[modules/employees] updateEmployee output validation failed:",
      updateOutputParsed.error.issues,
    );
  }

  return updateResult;
}
