"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listEmployeesSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  status: z.coerce.number().int().optional(),
  department_uuid: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getEmployeeSchema = z.object({
  uuid: z.string().min(1, "Employee UUID is required"),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email().max(255),
  phone: z.string().max(45).optional(),
  salary: z.number().positive().optional(),
  status: z.number().int().optional().default(10),
  designation_uuid: z.string().optional(),
  department_uuid: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  uuid: z.string().min(1, "Employee UUID is required"),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(45).optional(),
  salary: z.number().positive().optional(),
  status: z.number().int().optional(),
  designation_uuid: z.string().optional(),
  department_uuid: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListEmployeesParams = z.input<typeof listEmployeesSchema>;
export type GetEmployeeParams = z.input<typeof getEmployeeSchema>;
export type CreateEmployeeParams = z.input<typeof createEmployeeSchema>;
export type UpdateEmployeeParams = z.input<typeof updateEmployeeSchema>;

export type EmployeeItem = {
  employee_uuid: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string | null;
  employee_salary: number | null;
  employee_status: number;
  employee_created_at: string;
  employee_updated_at: string;
  designation_uuid: string | null;
  department_uuid: string | null;
};

export type EmployeeDetail = EmployeeItem | null;

export type ListEmployeesResult = {
  items: EmployeeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Prisma row type (internal)
// ---------------------------------------------------------------------------

type PrismaEmployeeRow = {
  employee_uuid: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string | null;
  employee_salary: unknown | null;
  employee_status: number;
  employee_created_at: Date;
  employee_updated_at: Date;
  designation_uuid: string | null;
  department_uuid: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma employee row to the shared item shape. */
function toItem(row: PrismaEmployeeRow): EmployeeItem {
  return {
    employee_uuid: row.employee_uuid,
    employee_name: row.employee_name,
    employee_email: row.employee_email,
    employee_phone: row.employee_phone ?? null,
    employee_salary: row.employee_salary ? Number(row.employee_salary) : null,
    employee_status: row.employee_status,
    employee_created_at: row.employee_created_at.toISOString(),
    employee_updated_at: row.employee_updated_at.toISOString(),
    designation_uuid: row.designation_uuid ?? null,
    department_uuid: row.department_uuid ?? null,
  };
}

/** Build Prisma where clause for listEmployees filters. */
function buildEmployeeWhere(params: {
  name?: string;
  email?: string;
  status?: number;
  department_uuid?: string;
}) {
  const where: Record<string, unknown> = { deleted: 0 };

  if (params.name && params.name.trim()) {
    where.employee_name = { contains: params.name, mode: "insensitive" };
  }
  if (params.email && params.email.trim()) {
    where.employee_email = { contains: params.email, mode: "insensitive" };
  }
  if (params.status !== undefined) {
    where.employee_status = params.status;
  }
  if (params.department_uuid) {
    where.department_uuid = params.department_uuid;
  }

  return where;
}

// ---------------------------------------------------------------------------
// listEmployees
// ---------------------------------------------------------------------------

/**
 * List employees with optional filters and pagination.
 * Excludes soft-deleted employees (deleted = 0).
 * Requires `staff.read` capability.
 *
 * Maps from Yii2 EmployeeController::actionIndex().
 */
export async function listEmployees(
  params: ListEmployeesParams = {},
): Promise<ListEmployeesResult> {
  await requireCapability("staff.read");

  const parsed = listEmployeesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { name, email, status, department_uuid, page, limit } = parsed.data;
  const where = buildEmployeeWhere({ name, email, status, department_uuid });
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.employee.findMany({
      where: where as any,
      orderBy: { employee_created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.employee.count({ where: where as any }),
  ]);

  return {
    items: rows.map(toItem),
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
 * Get a single employee by UUID.
 * Requires `staff.read` capability.
 *
 * Maps from Yii2 EmployeeController::actionView().
 */
export async function getEmployee(
  params: GetEmployeeParams,
): Promise<EmployeeDetail> {
  await requireCapability("staff.read");

  const parsed = getEmployeeSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid employee UUID");
  }

  const row = await prisma.employee.findUnique({
    where: { employee_uuid: parsed.data.uuid },
  });

  if (!row) return null;
  return toItem(row as PrismaEmployeeRow);
}

// ---------------------------------------------------------------------------
// createEmployee
// ---------------------------------------------------------------------------

/**
 * Create a new employee record.
 * Requires `setting.write` capability (employee management is an admin function).
 *
 * Maps from Yii2 EmployeeController::actionCreate().
 */
export async function createEmployee(
  data: CreateEmployeeParams,
): Promise<{ employee_uuid: string }> {
  await requireCapability("setting.write");

  const parsed = createEmployeeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid employee data");
  }

  const now = new Date();
  const employee = await prisma.employee.create({
    data: {
      employee_name: parsed.data.name,
      employee_email: parsed.data.email,
      employee_phone: parsed.data.phone ?? null,
      employee_salary: parsed.data.salary ?? null,
      employee_status: parsed.data.status,
      employee_created_at: now,
      employee_updated_at: now,
      designation_uuid: parsed.data.designation_uuid ?? null,
      department_uuid: parsed.data.department_uuid ?? null,
    } as any,
  });

  revalidatePath("/employees");
  return { employee_uuid: employee.employee_uuid };
}

// ---------------------------------------------------------------------------
// updateEmployee
// ---------------------------------------------------------------------------

/**
 * Update an existing employee record.
 * Only provided fields are updated — partial update semantics.
 * Requires `setting.write` capability.
 *
 * Maps from Yii2 EmployeeController::actionUpdate().
 */
export async function updateEmployee(
  data: UpdateEmployeeParams,
): Promise<{ employee_uuid: string }> {
  await requireCapability("setting.write");

  const parsed = updateEmployeeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid employee data");
  }

  const { uuid, ...fields } = parsed.data;

  const updateData: Record<string, unknown> = { employee_updated_at: new Date() };
  if (fields.name !== undefined) updateData.employee_name = fields.name;
  if (fields.email !== undefined) updateData.employee_email = fields.email;
  if (fields.phone !== undefined) updateData.employee_phone = fields.phone;
  if (fields.salary !== undefined) updateData.employee_salary = fields.salary;
  if (fields.status !== undefined) updateData.employee_status = fields.status;
  if (fields.designation_uuid !== undefined) updateData.designation_uuid = fields.designation_uuid;
  if (fields.department_uuid !== undefined) updateData.department_uuid = fields.department_uuid;

  await prisma.employee.update({
    where: { employee_uuid: uuid },
    data: updateData as any,
  });

  revalidatePath("/employees");
  return { employee_uuid: uuid };
}
