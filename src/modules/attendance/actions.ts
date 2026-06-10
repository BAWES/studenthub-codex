"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listAttendanceSchema,
  getAttendanceSchema,
  createAttendanceSchema,
  type ListAttendanceParams,
  type GetAttendanceParams,
  type CreateAttendanceParams,
  type AttendanceItem,
  type AttendanceDetail,
  type ListAttendanceResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Prisma row type (internal)
// ---------------------------------------------------------------------------

type PrismaAttendanceRow = {
  attendance_uuid: string;
  employee_uuid: string | null;
  date: Date;
  clock_in: Date | null;
  clock_out: Date | null;
  total_hours: unknown | null;
  status: number;
  note: string | null;
  created_at: Date;
  updated_at: Date;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma attendance row to the shared item shape. */
function toItem(row: PrismaAttendanceRow): AttendanceItem {
  return {
    attendance_uuid: row.attendance_uuid,
    employee_uuid: row.employee_uuid ?? null,
    date: row.date.toISOString().split("T")[0],
    clock_in: row.clock_in?.toISOString() ?? null,
    clock_out: row.clock_out?.toISOString() ?? null,
    total_hours: row.total_hours ? Number(row.total_hours) : null,
    status: row.status,
    note: row.note ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

/** Build Prisma where clause for listAttendance filters. */
function buildAttendanceWhere(params: {
  employee_uuid?: string;
  date_from?: string;
  date_to?: string;
  status?: number;
}) {
  const where: Record<string, unknown> = {};

  if (params.employee_uuid) {
    where.employee_uuid = params.employee_uuid;
  }
  if (params.date_from || params.date_to) {
    const dateFilter: Record<string, Date> = {};
    if (params.date_from) dateFilter.gte = new Date(params.date_from);
    if (params.date_to) dateFilter.lte = new Date(params.date_to);
    where.date = dateFilter;
  }
  if (params.status !== undefined) {
    where.status = params.status;
  }

  return where;
}

// ---------------------------------------------------------------------------
// listAttendance
// ---------------------------------------------------------------------------

/**
 * List attendance records with optional employee/date/status filters and pagination.
 * Requires `staff.read` capability.
 *
 * Maps from Yii2 AttendanceController::actionIndex().
 */
export async function listAttendance(
  params: ListAttendanceParams = {},
): Promise<ListAttendanceResult> {
  await requireCapability("staff.read");

  const parsed = listAttendanceSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { employee_uuid, date_from, date_to, status, page, limit } = parsed.data;
  const where = buildAttendanceWhere({ employee_uuid, date_from, date_to, status });
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.attendance.findMany({
      where: where as any,
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.attendance.count({ where: where as any }),
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
// getAttendance
// ---------------------------------------------------------------------------

/**
 * Get a single attendance record by UUID.
 * Requires `staff.read` capability.
 *
 * Maps from Yii2 AttendanceController::actionView().
 */
export async function getAttendance(
  params: GetAttendanceParams,
): Promise<AttendanceDetail> {
  await requireCapability("staff.read");

  const parsed = getAttendanceSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid attendance UUID");
  }

  const row = await prisma.attendance.findUnique({
    where: { attendance_uuid: parsed.data.uuid },
  });

  if (!row) return null;
  return toItem(row as PrismaAttendanceRow);
}

// ---------------------------------------------------------------------------
// createAttendance
// ---------------------------------------------------------------------------

/**
 * Create a new attendance record.
 * Requires `setting.write` capability.
 *
 * Maps from Yii2 AttendanceController::actionCreate().
 */
export async function createAttendance(
  data: CreateAttendanceParams,
): Promise<{ attendance_uuid: string }> {
  await requireCapability("setting.write");

  const parsed = createAttendanceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid attendance data");
  }

  const now = new Date();
  const attendance = await prisma.attendance.create({
    data: {
      employee_uuid: parsed.data.employee_uuid,
      date: new Date(parsed.data.date),
      clock_in: parsed.data.clock_in ? new Date(parsed.data.clock_in) : null,
      clock_out: parsed.data.clock_out ? new Date(parsed.data.clock_out) : null,
      total_hours: parsed.data.total_hours ?? null,
      status: parsed.data.status,
      note: parsed.data.note ?? null,
      created_at: now,
      updated_at: now,
    } as any,
  });

  revalidatePath("/attendance");
  return { attendance_uuid: attendance.attendance_uuid };
}
