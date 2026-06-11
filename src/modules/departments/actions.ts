"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listDepartmentsSchema,
  getDepartmentSchema,
  listDepartmentsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListDepartmentsParams = z.input<typeof listDepartmentsSchema>;

export type GetDepartmentParams = z.input<typeof getDepartmentSchema>;

export type DepartmentItem = {
  department_uuid: string;
  department_name_en: string;
  department_name_ar: string | null;
};

export type ListDepartmentsResult = {
  departments: DepartmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listDepartments
// ---------------------------------------------------------------------------

/**
 * List departments with pagination and optional name filter.
 *
 * Mirrors the legacy Yii2 department reference concept used across
 * staff, candidate evaluation, and request modules.
 * - Filters by name (case-insensitive) when nameFilter is provided
 * - Paginated with configurable page/limit
 * - Sorted alphabetically by English name
 */
export async function listDepartments(
  params: ListDepartmentsParams = {},
): Promise<ListDepartmentsResult> {
  await requireCapability("admin.read");

  const parsed = listDepartmentsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page, limit, nameFilter } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { department_name_en: { contains: nameFilter, mode: "insensitive" } },
      { department_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where: where as any,
      orderBy: { department_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.department.count({ where: where as any }),
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
  await requireCapability("admin.read");

  const parsed = getDepartmentSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid department UUID");
  }

  const { uuid } = parsed.data;

  const department = await prisma.department.findUnique({
    where: { department_uuid: uuid },
  });

  if (!department) return null;

  return {
    department_uuid: department.department_uuid,
    department_name_en: department.department_name_en,
    department_name_ar: department.department_name_ar,
  };
}
