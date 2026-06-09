"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SalaryRecord = {
  staff_salary_uuid: string;
  staff_id: number | null;
  salary: number | null;
  salary_currency: string | null;
  comment: string | null;
  salary_date: Date | null;
  created_at: Date | null;
};

export type SalaryListResult = {
  salaries: SalaryRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateSalaryResult = {
  operation: string;
  message: string;
  createdCount?: number;
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listSalariesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  month: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListSalariesParams = z.input<typeof listSalariesSchema>;

const getSalarySchema = z.object({
  id: z.string().min(1),
});

export type GetSalaryParams = z.input<typeof getSalarySchema>;

const createSalarySchema = z.object({
  staffIds: z.array(z.number().int().positive()).min(1),
  month: z.string().optional(),
});

export type CreateSalaryParams = z.input<typeof createSalarySchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SalaryWhereInput = {
  staff_id?: number;
  salary_date?: { gte?: Date; lte?: Date };
};

/**
 * Build a Prisma where clause from filter params.
 */
function buildSalaryFilter(params: {
  staffId?: number;
  month?: string;
}): SalaryWhereInput {
  const where: SalaryWhereInput = {};

  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }

  if (params.month && params.month.trim()) {
    const [year, month] = params.month.split("-").map(Number);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      where.salary_date = {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59, 999),
      };
    }
  }

  return where;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List staff salary records with optional filters (staffId, month) and
 * pagination. Ordered by created_at descending.
 * Mirrors the legacy Yii2 StaffSalaryController::actionList().
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated salary list with total count
 */
export async function listSalaries(
  params: ListSalariesParams = {},
): Promise<SalaryListResult> {
  await requireCapability("staff.salary.read");

  const parsed = listSalariesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { staffId, month, page = 1, limit = 20 } = parsed.data;
  const where = buildSalaryFilter({ staffId, month });

  const [rows, total] = await Promise.all([
    prisma.staff_salary.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        staff_salary_uuid: true,
        staff_id: true,
        salary: true,
        salary_currency: true,
        comment: true,
        salary_date: true,
        created_at: true,
      },
    }),
    prisma.staff_salary.count({ where: where as any }),
  ]);

  const salaries: SalaryRecord[] = rows.map((r) => ({
    staff_salary_uuid: r.staff_salary_uuid,
    staff_id: r.staff_id,
    salary: r.salary ? Number(r.salary) : null,
    salary_currency: r.salary_currency,
    comment: r.comment,
    salary_date: r.salary_date,
    created_at: r.created_at,
  }));

  return {
    salaries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single staff salary record by UUID. Returns null if not found.
 * Mirrors the legacy Yii2 StaffSalaryController::findModel().
 *
 * @param params - Object with `id` (salary UUID string)
 * @returns The salary record, or null if not found
 */
export async function getSalary(
  params: GetSalaryParams,
): Promise<SalaryRecord | null> {
  await requireCapability("staff.salary.read");

  const parsed = getSalarySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary ID");
  }

  const { id } = parsed.data;

  const salary = await prisma.staff_salary.findFirst({
    where: {
      staff_salary_uuid: id,
    },
    select: {
      staff_salary_uuid: true,
      staff_id: true,
      salary: true,
      salary_currency: true,
      comment: true,
      salary_date: true,
      created_at: true,
    },
  });

  if (!salary) return null;

  return {
    staff_salary_uuid: salary.staff_salary_uuid,
    staff_id: salary.staff_id,
    salary: salary.salary ? Number(salary.salary) : null,
    salary_currency: salary.salary_currency,
    comment: salary.comment,
    salary_date: salary.salary_date,
    created_at: salary.created_at,
  } as SalaryRecord;
}

/**
 * Create salary entries for a list of staff members.
 * Mirrors the legacy Yii2 StaffSalaryController::actionCreateSalary().
 *
 * For each staff ID in the list, creates a salary record using the staff's
 * configured salary and salary_currency.
 *
 * @param params - Object with `staffIds` array and optional `month`
 * @returns Operation result with created count
 */
export async function createSalaries(
  params: CreateSalaryParams,
): Promise<CreateSalaryResult> {
  await requireCapability("staff.salary.create");

  const parsed = createSalarySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid create parameters");
  }

  const { staffIds, month } = parsed.data;
  const salaryDate = month
    ? new Date(month + "-01")
    : new Date();
  let createdCount = 0;

  // Process staff IDs in sequence to look up each staff's configured salary
  for (const staffId of staffIds) {
    const staff = await prisma.staff.findFirst({
      where: { staff_id: staffId, deleted: 0 },
      select: {
        staff_id: true,
        staff_salary: true,
        staff_salary_currency: true,
      },
    });

    if (!staff) continue;

    await prisma.staff_salary.create({
      data: {
        staff_salary_uuid: `SAL-${Date.now()}-${staffId}`,
        staff_id: staffId,
        salary: staff.staff_salary,
        salary_currency: staff.staff_salary_currency ?? "KWD",
        comment: "Monthly Salary",
        salary_date: salaryDate,
      },
    });
    createdCount++;
  }

  return {
    operation: "success",
    message: `Salary data saved successfully (${createdCount} entries)`,
    createdCount,
  };
}
