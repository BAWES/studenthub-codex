"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listAttendanceSchema,
  getAttendanceSchema,
  createAttendanceSchema,
  listAttendanceResultSchema,
  attendanceDetailSchema,
  createAttendanceResultSchema,
} from "./schemas";
import type {
  ListAttendanceParams,
  GetAttendanceParams,
  CreateAttendanceParams,
  AttendanceItem,
  AttendanceDetail,
  ListAttendanceResult,
} from "./schemas";
import { toItem, buildAttendanceWhere } from "./helpers";
import type { PrismaAttendanceRow } from "./helpers";

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

  const result = {
    items: rows.map(toItem),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listAttendanceResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/attendance] listAttendance output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  if (!row) {
    const nullResult = null;

    // Validate output shape
    const nullOutput = attendanceDetailSchema.safeParse(nullResult);
    if (!nullOutput.success) {
      console.error(
        "[modules/attendance] getAttendance output validation failed:",
        nullOutput.error.issues,
      );
    }

    return nullResult;
  }

  const itemResult = toItem(row as PrismaAttendanceRow);

  // Validate output shape
  const itemOutput = attendanceDetailSchema.safeParse(itemResult);
  if (!itemOutput.success) {
    console.error(
      "[modules/attendance] getAttendance output validation failed:",
      itemOutput.error.issues,
    );
  }

  return itemResult;
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

  const createResult = { attendance_uuid: attendance.attendance_uuid };

  // Validate output shape
  const outputParsed = createAttendanceResultSchema.safeParse(createResult);
  if (!outputParsed.success) {
    console.error(
      "[modules/attendance] createAttendance output validation failed:",
      outputParsed.error.issues,
    );
  }

  return createResult;
}
