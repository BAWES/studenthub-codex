"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listEmployeesSchema = z.object({
  name: z.string().optional(),
  status: z.coerce.number().int().optional(),
  departmentUuid: z.string().optional(),
  designationUuid: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getEmployeeSchema = z.object({
  employeeUuid: z.string().min(1, "Employee UUID is required"),
});

export const createEmployeeSchema = z.object({
  employeeName: z
    .string({ required_error: "Employee name is required" })
    .min(1, "Employee name is required")
    .max(255),
  employeeEmail: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .max(255),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional().default(10),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  employeeUuid: z.string().min(1, "Employee UUID is required"),
  employeeName: z.string().min(1).max(255).optional(),
  employeeEmail: z.string().email().max(255).optional(),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional(),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListEmployeesInput = z.input<typeof listEmployeesSchema>;
export type CreateEmployeeInput = z.input<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.input<typeof updateEmployeeSchema>;

export type EmployeeItem = {
  employee_uuid: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string | null;
  employee_salary: number | null;
  employee_status: number;
  employee_created_at: Date;
  employee_updated_at: Date;
  designation_uuid: string | null;
  department_uuid: string | null;
};

export type EmployeeDetail = EmployeeItem | null;

export type ListEmployeesResult = {
  employees: EmployeeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateEmployeeResult = {
  employee_uuid: string;
};

export type UpdateEmployeeResult = {
  employee_uuid: string;
};

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

  return {
    employees: employees as EmployeeItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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

  return employee as EmployeeItem;
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
  return { employee_uuid: employeeUuid };
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
  return { employee_uuid: employeeUuid };
}
