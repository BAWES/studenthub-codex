"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { ListAttendanceParams, ListAttendanceResult } from "@/modules/attendance/schemas";
import { listAttendance, createAttendance, getAttendance } from "@/modules/attendance/actions";
import {
  listEmployeeOptionsResultSchema,
  type ListEmployeeOptionsResult,
} from "./schemas";
import { listAttendanceResultSchema, createAttendanceResultSchema, attendanceDetailSchema } from "@/modules/attendance/schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/attendance] ${source} output failed:`, error);
}

export async function listAdminAttendance(
  params: ListAttendanceParams = {},
): Promise<ListAttendanceResult> {
  await requireCapability("admin.read");
  const result = await listAttendance(params);
  const parsed = listAttendanceResultSchema.safeParse(result);
  if (!parsed.success) {
    logOutputError("listAdminAttendance", parsed.error.issues);
  }
  return result;
}

export async function createAdminAttendance(data: {
  employee_uuid: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  total_hours?: number;
  status?: number;
  note?: string;
}) {
  await requireCapability("admin.write");
  const result = await createAttendance(data);
  const parsed = createAttendanceResultSchema.safeParse(result);
  if (!parsed.success) {
    logOutputError("createAdminAttendance", parsed.error.issues);
  }
  revalidatePath("/admin/attendance");
  return result;
}

export async function getEmployeeOptions(): Promise<ListEmployeeOptionsResult> {
  await requireCapability("admin.read");
  const rows = await prisma.employee.findMany({
    where: { deleted: 0 },
    orderBy: { employee_name: "asc" },
    select: { employee_uuid: true, employee_name: true },
  });
  const result = rows.map((r: any) => ({ uuid: r.employee_uuid, name: r.employee_name }));

  const parsed = listEmployeeOptionsResultSchema.safeParse(result);
  if (!parsed.success) {
    logOutputError("getEmployeeOptions", parsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getAdminAttendance
// ---------------------------------------------------------------------------

/**
 * Get a single attendance record by UUID with employee name.
 * Requires `admin.read` capability.
 */
export async function getAdminAttendance(uuid: string) {
  await requireCapability("admin.read");

  const attendance = await getAttendance({ uuid });

  if (!attendance) {
    return { attendance: null, employee_name: null };
  }

  // Fetch employee name for display
  let employee_name: string | null = null;
  if (attendance.employee_uuid) {
    const employee = await prisma.employee.findUnique({
      where: { employee_uuid: attendance.employee_uuid },
      select: { employee_name: true },
    });
    employee_name = employee?.employee_name ?? null;
  }

  const result = { attendance, employee_name };

  const parsed = attendanceDetailSchema.safeParse(attendance);
  if (!parsed.success) {
    logOutputError("getAdminAttendance", parsed.error.issues);
  }

  return result;
}
