"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { Prisma } from "@prisma/client";
import {
  salaryScaleListItemSchema,
  listSalaryScalesResultSchema,
  salaryScaleIdResultSchema,
  listSalaryScalesSchema,
  createSalaryScaleSchema,
  updateSalaryScaleSchema,
} from "./schemas";
import type {
  SalaryScaleListItem,
  ListSalaryScalesResult,
  SalaryScaleIdResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function logOutputError(source: string, error: unknown): Promise<void> {
  console.error(`[modules/admin/salary-scales] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// listSalaryScales
// ---------------------------------------------------------------------------

export async function listSalaryScales(
  params: FormData | Record<string, unknown> = {},
): Promise<ListSalaryScalesResult> {
  await requireCapability("admin.system");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
        }
      : params;

  const parsed = listSalaryScalesSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { salary_scale_name_en: { contains: search } },
      { salary_scale_name_ar: { contains: search } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.salary_scale.findMany({
      where: where as Prisma.salary_scaleWhereInput,
      orderBy: [{ salary_scale_name_en: "asc" }],
      skip,
      take: limit,
    }),
    prisma.salary_scale.count({ where: where as Prisma.salary_scaleWhereInput }),
  ]);

  const result: ListSalaryScalesResult = {
    records: records.map((r): SalaryScaleListItem => ({
      salary_scale_id: r.salary_scale_id,
      salary_scale_name_en: r.salary_scale_name_en ?? "",
      salary_scale_name_ar: r.salary_scale_name_ar ?? null,
      salary_scale_min_amount: r.salary_scale_min_amount
        ? Number(r.salary_scale_min_amount)
        : null,
      salary_scale_max_amount: r.salary_scale_max_amount
        ? Number(r.salary_scale_max_amount)
        : null,
      candidate_count: null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listSalaryScalesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listSalaryScales", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getSalaryScale
// ---------------------------------------------------------------------------

export async function getSalaryScale(
  salaryScaleId: number,
): Promise<SalaryScaleListItem | null> {
  await requireCapability("admin.system");

  const record = await prisma.salary_scale.findFirst({
    where: { salary_scale_id: salaryScaleId },
  });

  if (!record) return null;

  const result: SalaryScaleListItem = {
    salary_scale_id: record.salary_scale_id,
    salary_scale_name_en: record.salary_scale_name_en ?? "",
    salary_scale_name_ar: record.salary_scale_name_ar ?? null,
    salary_scale_min_amount: record.salary_scale_min_amount
      ? Number(record.salary_scale_min_amount)
      : null,
    salary_scale_max_amount: record.salary_scale_max_amount
      ? Number(record.salary_scale_max_amount)
      : null,
    candidate_count: null,
  };

  const outputParsed = salaryScaleListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getSalaryScale", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// createSalaryScale
// ---------------------------------------------------------------------------

export async function createSalaryScale(
  data: Record<string, unknown>,
): Promise<SalaryScaleIdResult> {
  await requireCapability("admin.system");

  const parsed = createSalaryScaleSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary scale data");
  }

  const {
    salary_scale_name_en,
    salary_scale_name_ar,
    salary_scale_min_amount,
    salary_scale_max_amount,
  } = parsed.data;

  const record = await prisma.salary_scale.create({
    data: {
      salary_scale_name_en,
      salary_scale_name_ar: salary_scale_name_ar || null,
      salary_scale_min_amount: salary_scale_min_amount ?? null,
      salary_scale_max_amount: salary_scale_max_amount ?? null,
      salary_scale_created_at: new Date(),
      salary_scale_updated_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/salary-scales");
  const result: SalaryScaleIdResult = { salary_scale_id: record.salary_scale_id };

  const outputParsed = salaryScaleIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createSalaryScale", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateSalaryScale
// ---------------------------------------------------------------------------

export async function updateSalaryScale(
  data: Record<string, unknown>,
): Promise<SalaryScaleIdResult> {
  await requireCapability("admin.system");

  const parsed = updateSalaryScaleSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary scale data");
  }

  const {
    salary_scale_id,
    salary_scale_name_en,
    salary_scale_name_ar,
    salary_scale_min_amount,
    salary_scale_max_amount,
  } = parsed.data;

  const existing = await prisma.salary_scale.findFirst({
    where: { salary_scale_id },
  });
  if (!existing) {
    throw new Error(`Salary scale record not found: ${salary_scale_id}`);
  }

  const updateData: Record<string, unknown> = {
    salary_scale_updated_at: new Date(),
  };
  if (salary_scale_name_en !== undefined) updateData.salary_scale_name_en = salary_scale_name_en;
  if (salary_scale_name_ar !== undefined) updateData.salary_scale_name_ar = salary_scale_name_ar || null;
  if (salary_scale_min_amount !== undefined) updateData.salary_scale_min_amount = salary_scale_min_amount;
  if (salary_scale_max_amount !== undefined) updateData.salary_scale_max_amount = salary_scale_max_amount;

  await prisma.salary_scale.update({
    where: { salary_scale_id },
    data: updateData as any,
  });

  revalidatePath("/admin/salary-scales");
  const result: SalaryScaleIdResult = { salary_scale_id };

  const outputParsed = salaryScaleIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateSalaryScale", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteSalaryScale
// ---------------------------------------------------------------------------

export async function deleteSalaryScale(
  salaryScaleId: number,
): Promise<SalaryScaleIdResult> {
  await requireCapability("admin.system");

  const existing = await prisma.salary_scale.findFirst({
    where: { salary_scale_id: salaryScaleId },
  });
  if (!existing) {
    throw new Error(`Salary scale record not found: ${salaryScaleId}`);
  }

  await prisma.salary_scale.delete({
    where: { salary_scale_id: salaryScaleId },
  });

  revalidatePath("/admin/salary-scales");
  const result: SalaryScaleIdResult = { salary_scale_id: salaryScaleId };

  const outputParsed = salaryScaleIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteSalaryScale", outputParsed.error.issues);
  }

  return result;
}
