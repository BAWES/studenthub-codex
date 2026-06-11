"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { staffListResultSchema, staffGetResultSchema, staffListItemSchema } from "./schemas";
import type { StaffListItem, StaffListResult, StaffGetResult } from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listStaffSchema = z.object({
  role: z.boolean().optional(),
  jobTitle: z.string().optional(),
  status: z.number().int().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListStaffParams = z.input<typeof listStaffSchema>;

const getStaffSchema = z.object({
  id: z.number().int().positive(),
});

export type GetStaffParams = z.input<typeof getStaffSchema>;

// ---------------------------------------------------------------------------
// Filter builder
// ---------------------------------------------------------------------------

type StaffWhereInput = {
  deleted: number;
  staff_role?: boolean;
  staff_job_title?: { contains: string; mode?: "insensitive" };
  staff_status?: number;
};

function buildStaffFilter(params: {
  role?: boolean;
  jobTitle?: string;
  status?: number;
}): StaffWhereInput {
  const where: StaffWhereInput = { deleted: 0 };

  if (params.role !== undefined) {
    where.staff_role = params.role;
  }

  if (params.jobTitle && params.jobTitle.trim()) {
    where.staff_job_title = { contains: params.jobTitle, mode: "insensitive" };
  }

  if (params.status !== undefined) {
    where.staff_status = params.status;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List staff members with optional filters (role, jobTitle, status) and
 * pagination. Excludes soft-deleted staff (deleted=0).
 * Mirrors the legacy Yii2 admin StaffController::actionList().
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated staff list with total count
 */
export async function listStaff(
  params: ListStaffParams = {},
): Promise<StaffListResult> {
  await requireCapability("staff.read");

  const parsed = listStaffSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { role, jobTitle, status, page = 1, limit = 20 } = parsed.data;

  const where = buildStaffFilter({ role, jobTitle, status });

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where: where as any,
      orderBy: [{ staff_status: "desc" }, { staff_name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        staff_id: true,
        staff_name: true,
        staff_job_title: true,
        staff_email: true,
        staff_role: true,
        staff_status: true,
        staff_created_at: true,
      },
    }),
    prisma.staff.count({ where: where as any }),
  ]);

  const result: StaffListResult = {
    staff: staff as StaffListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = staffListResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff] listStaff output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single staff member by ID. Returns null if not found or soft-deleted.
 * Mirrors the legacy Yii2 StaffController::actionView($id).
 *
 * @param params - Object with `id` (positive integer)
 * @returns The staff record, or null if not found
 */
export async function getStaff(params: GetStaffParams): Promise<StaffGetResult> {
  await requireCapability("staff.read");

  const parsed = getStaffSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid staff ID");
  }

  const { id } = parsed.data;

  const staff = await prisma.staff.findFirst({
    where: {
      staff_id: id,
      deleted: 0,
    },
    select: {
      staff_id: true,
      staff_name: true,
      staff_job_title: true,
      staff_email: true,
      staff_role: true,
      staff_status: true,
      staff_created_at: true,
    },
  });

  const outputParsed = staffGetResultSchema.safeParse(staff);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff] getStaff output validation failed:",
      outputParsed.error.issues,
    );
  }

  return staff;
}
