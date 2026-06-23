"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSalaryScalesSchema,
  listSalaryScalesResultSchema,
  createSalaryScaleSchema,
} from "./schemas";
import type { ListSalaryScalesInput, ListSalaryScalesResult } from "./schemas";

// ---------------------------------------------------------------------------
// listSalaryScales — paginated listing for the page
// ---------------------------------------------------------------------------

export async function listSalaryScales(
  input: ListSalaryScalesInput = {},
): Promise<ListSalaryScalesResult> {
  await requireCapability("admin.read");
  const parsed = listSalaryScalesSchema.safeParse(input);
  if (!parsed.success)
    return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.salary_scale.findMany({
      orderBy: { salary_scale_sort_order: "asc" },
      skip,
      take: limit,
    }),
    prisma.salary_scale.count(),
  ]);

  const items = rows.map((row) => ({
    ...row,
    salary_scale_min_salary: row.salary_scale_min_salary
      ? Number(row.salary_scale_min_salary)
      : null,
    salary_scale_mid_salary: row.salary_scale_mid_salary
      ? Number(row.salary_scale_mid_salary)
      : null,
    salary_scale_max_salary: row.salary_scale_max_salary
      ? Number(row.salary_scale_max_salary)
      : null,
  }));

  const result = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listSalaryScalesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/salary-scales] listSalaryScales output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createSalaryScale — for inline CRUD
// ---------------------------------------------------------------------------

export async function createSalaryScale(
  data: {
    salary_scale_name_en: string;
    salary_scale_name_ar?: string;
    salary_scale_min_salary?: number;
    salary_scale_mid_salary?: number;
    salary_scale_max_salary?: number;
    salary_scale_currency?: string;
    salary_scale_sort_order?: number;
  },
): Promise<{ salary_scale_uuid: string }> {
  await requireCapability("admin.write");

  const parsed = createSalaryScaleSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid salary scale data",
    );
  }

  const {
    salary_scale_name_en,
    salary_scale_name_ar,
    salary_scale_min_salary,
    salary_scale_mid_salary,
    salary_scale_max_salary,
    salary_scale_currency,
    salary_scale_sort_order,
  } = parsed.data;

  const uuid = crypto.randomUUID();

  await prisma.salary_scale.create({
    data: {
      salary_scale_uuid: uuid,
      salary_scale_name_en,
      salary_scale_name_ar: salary_scale_name_ar || null,
      salary_scale_min_salary: salary_scale_min_salary ?? null,
      salary_scale_mid_salary: salary_scale_mid_salary ?? null,
      salary_scale_max_salary: salary_scale_max_salary ?? null,
      salary_scale_currency: salary_scale_currency || null,
      salary_scale_sort_order: salary_scale_sort_order ?? null,
      salary_scale_created_at: new Date(),
      salary_scale_updated_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/salary-scales");

  return { salary_scale_uuid: uuid };
}

// ---------------------------------------------------------------------------
// updateSalaryScale — for inline CRUD
// ---------------------------------------------------------------------------

export async function updateSalaryScale(
  salaryScaleUuid: string,
  data: {
    salary_scale_name_en: string;
    salary_scale_name_ar: string | undefined;
    salary_scale_min_salary: number | null;
    salary_scale_mid_salary: number | null;
    salary_scale_max_salary: number | null;
    salary_scale_currency: string | null;
    salary_scale_sort_order: number | null;
  },
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireCapability("admin.write");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }

  if (
    !data.salary_scale_name_en ||
    data.salary_scale_name_en.trim().length === 0
  ) {
    return { error: "Salary scale name (English) is required" };
  }

  try {
    const updateData: Record<string, unknown> = {
      salary_scale_name_en: data.salary_scale_name_en,
      salary_scale_name_ar: data.salary_scale_name_ar || null,
      salary_scale_min_salary: data.salary_scale_min_salary ?? null,
      salary_scale_mid_salary: data.salary_scale_mid_salary ?? null,
      salary_scale_max_salary: data.salary_scale_max_salary ?? null,
      salary_scale_currency: data.salary_scale_currency || null,
      salary_scale_sort_order: data.salary_scale_sort_order ?? null,
    };

    await prisma.salary_scale.update({
      where: { salary_scale_uuid: salaryScaleUuid },
      data: updateData as any,
    });

    revalidatePath("/admin/salary-scales");
    revalidatePath(`/admin/salary-scales/${salaryScaleUuid}`);

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update salary scale",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteSalaryScale — for inline CRUD
// ---------------------------------------------------------------------------

export async function deleteSalaryScale(
  salaryScaleUuid: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireCapability("admin.write");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }

  try {
    await prisma.salary_scale.delete({
      where: { salary_scale_uuid: salaryScaleUuid },
    });

    revalidatePath("/admin/salary-scales");

    return { success: true };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to delete salary scale",
    };
  }
}
