"use server";

// ---------------------------------------------------------------------------
// Admin Departments — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/DepartmentController.php
//
// Actions:
//   - listDepartments     — list all departments
//   - getDepartment       — single department detail
//   - createDepartment    — create a new department
//   - updateDepartment    — update a department
//   - deleteDepartment    — soft-delete a department
//
// Departments use UUID keys for compatibility with the employee domain.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  type ListDepartmentsInput,
  type GetDepartmentInput,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  type DeleteDepartmentInput,
  type DepartmentRow,
  type DepartmentDetail,
  type DepartmentActionResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// listDepartments
// ---------------------------------------------------------------------------

/**
 * List all departments with pagination and optional search.
 */
export async function listDepartments(
  input: ListDepartmentsInput = {},
): Promise<{
  items: DepartmentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("company.read.any");

  const parsed = listDepartmentsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, q } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q && q.trim().length > 0) {
    where.OR = [
      { department_name_en: { contains: q.trim() } },
      { department_name_ar: { contains: q.trim() } },
    ];
  }

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where: where as any,
      orderBy: { department_name_en: "asc" },
      skip,
      take: limit,
      include: {
        _count: { select: { employee: true } },
      },
    }),
    prisma.department.count({ where: where as any }),
  ]);

  return {
    items: departments.map((d): DepartmentRow => ({
      department_uuid: d.department_uuid,
      department_name_en: d.department_name_en,
      department_name_ar: d.department_name_ar ?? null,
      employee_count: d._count?.employee ?? 0,
      created_at: d.department_created_at?.toISOString() ?? null,
      updated_at: d.department_updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getDepartment
// ---------------------------------------------------------------------------

/**
 * Get a single department by UUID with employee count.
 */
export async function getDepartment(
  departmentUuid: string,
): Promise<DepartmentDetail> {
  await requireCapability("company.read.any");

  const parsed = getDepartmentSchema.safeParse({ departmentUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid department UUID");
  }

  const department = await prisma.department.findUnique({
    where: { department_uuid: parsed.data.departmentUuid },
    include: {
      _count: { select: { employee: true } },
    },
  });

  if (!department) {
    return { department: null, employee_count: 0 };
  }

  return {
    department: {
      department_uuid: department.department_uuid,
      department_name_en: department.department_name_en,
      department_name_ar: department.department_name_ar ?? null,
      department_created_at: department.department_created_at?.toISOString() ?? null,
      department_updated_at: department.department_updated_at?.toISOString() ?? null,
    },
    employee_count: department._count?.employee ?? 0,
  };
}

// ---------------------------------------------------------------------------
// createDepartment
// ---------------------------------------------------------------------------

/**
 * Create a new department.
 * Uses a generated UUID for the primary key.
 */
export async function createDepartment(
  input: CreateDepartmentInput,
): Promise<DepartmentActionResponse> {
  await requireCapability("company.manage");

  const parsed = createDepartmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const now = new Date();
    const department = await prisma.department.create({
      data: {
        department_uuid: crypto.randomUUID(),
        department_name_en: parsed.data.departmentNameEn,
        department_name_ar: parsed.data.departmentNameAr ?? null,
        department_created_at: now,
        department_updated_at: now,
      },
      include: {
        _count: { select: { employee: true } },
      },
    });

    revalidatePath("/admin/departments");

    return {
      operation: "success",
      message: `Department "${department.department_name_en}" created`,
      data: {
        department_uuid: department.department_uuid,
        department_name_en: department.department_name_en,
        department_name_ar: department.department_name_ar ?? null,
        employee_count: department._count?.employee ?? 0,
        created_at: department.department_created_at?.toISOString() ?? null,
        updated_at: department.department_updated_at?.toISOString() ?? null,
      },
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create department",
    };
  }
}

// ---------------------------------------------------------------------------
// updateDepartment
// ---------------------------------------------------------------------------

/**
 * Update a department's name fields. Only provided fields are modified.
 */
export async function updateDepartment(
  input: UpdateDepartmentInput,
): Promise<DepartmentActionResponse> {
  await requireCapability("company.manage");

  const parsed = updateDepartmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.department.findUnique({
    where: { department_uuid: parsed.data.departmentUuid },
    select: { department_uuid: true },
  });

  if (!existing) {
    return { operation: "error", message: "Department not found" };
  }

  const updateData: Record<string, unknown> = {
    department_updated_at: new Date(),
  };

  if (parsed.data.departmentNameEn !== undefined) updateData.department_name_en = parsed.data.departmentNameEn;
  if (parsed.data.departmentNameAr !== undefined) updateData.department_name_ar = parsed.data.departmentNameAr;

  try {
    const department = await prisma.department.update({
      where: { department_uuid: parsed.data.departmentUuid },
      data: updateData as any,
      include: {
        _count: { select: { employee: true } },
      },
    });

    revalidatePath("/admin/departments");
    revalidatePath(`/admin/departments/${parsed.data.departmentUuid}`);

    return {
      operation: "success",
      message: `Department "${department.department_name_en}" updated`,
      data: {
        department_uuid: department.department_uuid,
        department_name_en: department.department_name_en,
        department_name_ar: department.department_name_ar ?? null,
        employee_count: department._count?.employee ?? 0,
        created_at: department.department_created_at?.toISOString() ?? null,
        updated_at: department.department_updated_at?.toISOString() ?? null,
      },
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update department",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteDepartment
// ---------------------------------------------------------------------------

/**
 * Delete a department. Only succeeds if no employees are assigned.
 */
export async function deleteDepartment(
  input: DeleteDepartmentInput,
): Promise<DepartmentActionResponse> {
  await requireCapability("company.manage");

  const parsed = deleteDepartmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.department.findUnique({
    where: { department_uuid: parsed.data.departmentUuid },
    include: {
      _count: { select: { employee: true } },
    },
  });

  if (!existing) {
    return { operation: "error", message: "Department not found" };
  }

  if ((existing._count?.employee ?? 0) > 0) {
    return {
      operation: "error",
      message: `Cannot delete department with ${existing._count.employee} employee(s) assigned. Reassign or remove employees first.`,
    };
  }

  try {
    await prisma.department.delete({
      where: { department_uuid: parsed.data.departmentUuid },
    });

    revalidatePath("/admin/departments");

    return { operation: "success", message: "Department deleted" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to delete department",
    };
  }
}
