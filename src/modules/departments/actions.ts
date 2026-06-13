"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { Prisma } from "@prisma/client";
import {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  departmentItemSchema,
  listDepartmentsResultSchema,
} from "./schemas";
import type {
  ListDepartmentsParams,
  GetDepartmentParams,
  CreateDepartmentParams,
  UpdateDepartmentParams,
  DeleteDepartmentParams,
  DepartmentItem,
  ListDepartmentsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listDepartments
// ---------------------------------------------------------------------------

/**
 * List departments with pagination and optional name filter.
 */
export async function listDepartments(
  params: ListDepartmentsParams = {},
): Promise<ListDepartmentsResult> {
  await requireCapability("admin.system");

  const parsed = listDepartmentsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, page = 1, limit = 20 } = parsed.data;

  const where: Prisma.departmentWhereInput = {};
  if (nameFilter && nameFilter.trim()) {
    where.department_name_en = { contains: nameFilter.trim() };
  }

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where,
      orderBy: { department_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.department.count({ where }),
  ]);

  const result = {
    departments: departments.map((d) => ({
      department_uuid: d.department_uuid,
      department_name_en: d.department_name_en,
      department_name_ar: d.department_name_ar,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log issues without throwing
  const outputParsed = listDepartmentsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/departments] listDepartments output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDepartment
// ---------------------------------------------------------------------------

/**
 * Get a single department by UUID.
 * Returns null if not found.
 */
export async function getDepartment(
  params: GetDepartmentParams,
): Promise<DepartmentItem | null> {
  await requireCapability("admin.system");

  const parsed = getDepartmentSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid department UUID");
  }

  const { uuid } = parsed.data;

  const department = await prisma.department.findUnique({
    where: { department_uuid: uuid },
  });

  if (!department) return null;

  const result = {
    department_uuid: department.department_uuid,
    department_name_en: department.department_name_en,
    department_name_ar: department.department_name_ar,
  };

  // Output validation — log issues without throwing
  const outputParsed = departmentItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/departments] getDepartment output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createDepartment
// ---------------------------------------------------------------------------

/**
 * Create a new department.
 */
export async function createDepartment(
  params: CreateDepartmentParams,
): Promise<{ departmentUuid: string }> {
  await requireCapability("admin.system");

  const parsed = createDepartmentSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid department data");
  }

  const { departmentNameEn, departmentNameAr } = parsed.data;

  const department = await prisma.department.create({
    data: {
      department_uuid: crypto.randomUUID(),
      department_name_en: departmentNameEn.trim(),
      department_name_ar: departmentNameAr?.trim() || null,
      department_created_at: new Date(),
      department_updated_at: new Date(),
    },
  });

  return { departmentUuid: department.department_uuid };
}

// ---------------------------------------------------------------------------
// updateDepartment
// ---------------------------------------------------------------------------

/**
 * Update an existing department.
 */
export async function updateDepartment(
  params: UpdateDepartmentParams,
): Promise<{ success: boolean }> {
  await requireCapability("admin.system");

  const parsed = updateDepartmentSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid update data");
  }

  const { departmentUuid, departmentNameEn, departmentNameAr } = parsed.data;

  // Build update data — only include provided fields
  const updateData: Prisma.departmentUpdateInput = {
    department_updated_at: new Date(),
  };
  if (departmentNameEn !== undefined) {
    updateData.department_name_en = departmentNameEn.trim();
  }
  if (departmentNameAr !== undefined) {
    updateData.department_name_ar = departmentNameAr?.trim() || null;
  }

  await prisma.department.update({
    where: { department_uuid: departmentUuid },
    data: updateData,
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteDepartment
// ---------------------------------------------------------------------------

/**
 * Delete a department by UUID.
 * Throws if the department is referenced by other records.
 */
export async function deleteDepartment(
  params: DeleteDepartmentParams,
): Promise<{ success: boolean }> {
  await requireCapability("admin.system");

  const parsed = deleteDepartmentSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid delete parameters");
  }

  const { departmentUuid } = parsed.data;

  await prisma.department.delete({
    where: { department_uuid: departmentUuid },
  });

  return { success: true };
}
