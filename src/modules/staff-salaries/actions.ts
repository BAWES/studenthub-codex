"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  staffSalaryItemSchema,
  listStaffSalariesResultSchema,
  salaryActionResultSchema,
  type StaffSalaryItem,
  type ListStaffSalariesResult,
  type SalaryActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listSalariesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const getSalarySchema = z.object({
  uuid: z.string().min(1, "Salary UUID is required"),
});

const createSalarySchema = z.object({
  staffId: z.number().int().positive(),
  salary: z.number().nonnegative("Salary must be non-negative"),
  salaryCurrency: z.string().min(1).max(3).optional().default("KWD"),
  comment: z.string().optional(),
  salaryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

// ---------------------------------------------------------------------------
// Types (input params)
// ---------------------------------------------------------------------------

export type ListSalariesParams = z.input<typeof listSalariesSchema>;
export type GetSalaryParams = z.input<typeof getSalarySchema>;
export type CreateSalaryParams = z.input<typeof createSalarySchema>;

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation in tests)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// listStaffSalaries
// ---------------------------------------------------------------------------

/**
 * List staff salaries with pagination and optional filters.
 * Filters by staff ID, year, and/or month when provided.
 * Sorted by salary_date descending (most recent first).
 * Mirrors the legacy Yii2 StaffSalaryController::actionList().
 */
export async function listStaffSalaries(
  params: ListSalariesParams = {},
): Promise<ListStaffSalariesResult> {
  await requireCapability("staff.salary.read");

  const parsed = listSalariesSchema.safeParse(params);
  if (!parsed.success) {
    return { salaries: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { staffId, year, month, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (staffId !== undefined) {
    where.staff_id = staffId;
  }

  // Date-range filter for year/month
  if (year !== undefined) {
    const gte = new Date(month !== undefined ? `${year}-${String(month).padStart(2, "0")}-01` : `${year}-01-01`);
    const lte = month !== undefined
      ? new Date(`${year}-${String(month).padStart(2, "0")}-01T23:59:59.999Z`)
      : new Date(`${year + 1}-01-01T00:00:00.000Z`);
    // Approximate end of month
    if (month !== undefined) {
      lte.setMonth(lte.getMonth() + 1);
      lte.setDate(0);
      lte.setHours(23, 59, 59, 999);
    }
    where.salary_date = {
      gte,
      lte,
    };
  }

  const [salaries, total] = await Promise.all([
    prisma.staff_salary.findMany({
      where: where as any,
      orderBy: { salary_date: "desc" },
      skip,
      take: limit,
    }),
    prisma.staff_salary.count({ where: where as any }),
  ]);

  const result = {
    salaries: salaries.map((s) => ({
      staff_salary_uuid: s.staff_salary_uuid,
      staff_id: s.staff_id,
      salary: s.salary ? Number(s.salary) : null,
      salary_currency: s.salary_currency,
      comment: s.comment,
      salary_date: s.salary_date,
      created_at: s.created_at,
      updated_at: s.updated_at,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listStaffSalariesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-salaries] listStaffSalaries output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStaffSalary
// ---------------------------------------------------------------------------

/**
 * Get a single staff salary by UUID.
 * Returns null if not found.
 * Mirrors the legacy Yii2 StaffSalaryController::actionView().
 */
export async function getStaffSalary(
  params: GetSalaryParams,
): Promise<StaffSalaryItem | null> {
  await requireCapability("staff.salary.read");

  const parsed = getSalarySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid salary UUID");
  }

  const { uuid } = parsed.data;

  const salary = await prisma.staff_salary.findUnique({
    where: { staff_salary_uuid: uuid },
  });

  if (!salary) return null;

  const result = {
    staff_salary_uuid: salary.staff_salary_uuid,
    staff_id: salary.staff_id,
    salary: salary.salary ? Number(salary.salary) : null,
    salary_currency: salary.salary_currency,
    comment: salary.comment,
    salary_date: salary.salary_date,
    created_at: salary.created_at,
    updated_at: salary.updated_at,
  };

  // Validate output shape
  const outputParsed = staffSalaryItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-salaries] getStaffSalary output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createStaffSalary
// ---------------------------------------------------------------------------

/**
 * Create a new staff salary record.
 * Requires the "staff.salary.create" capability.
 * Returns { operation, message } on success or error.
 */
export async function createStaffSalary(
  params: CreateSalaryParams,
): Promise<SalaryActionResult> {
  await requireCapability("staff.salary.create");

  const parsed = createSalarySchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid salary data",
    };
  }

  const { staffId, salary, salaryCurrency, comment, salaryDate } = parsed.data;
  const now = new Date();

  try {
    // Verify staff exists
    const staff = await prisma.staff.findUnique({
      where: { staff_id: staffId },
    });

    if (!staff) {
      return {
        operation: "error",
        message: "Staff member not found",
      };
    }

    await prisma.staff_salary.create({
      data: {
        staff_salary_uuid: crypto.randomUUID(),
        staff_id: staffId,
        salary: salary,
        salary_currency: salaryCurrency,
        comment: comment ?? null,
        salary_date: new Date(salaryDate),
        created_at: now,
        updated_at: now,
      },
    });

    return {
      operation: "success",
      message: "Salary created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create salary record",
    };
  }
}
