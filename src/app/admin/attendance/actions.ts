"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { ListAttendanceParams, ListAttendanceResult } from "@/modules/attendance/schemas";
import { listAttendance, createAttendance } from "@/modules/attendance/actions";
import {
  listEmployeeOptionsResultSchema,
  type ListEmployeeOptionsResult,
} from "./schemas";
import { listAttendanceResultSchema, createAttendanceResultSchema } from "@/modules/attendance/schemas";

export async function listAdminAttendance(
  params: ListAttendanceParams = {},
): Promise<ListAttendanceResult> {
  await requireCapability("admin.read");
  const result = await listAttendance(params);
  const parsed = listAttendanceResultSchema.safeParse(result);
  if (!parsed.success) {
    console.error("[admin/attendance] listAdminAttendance output validation failed:", parsed.error.issues);
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
    console.error("[admin/attendance] createAdminAttendance output validation failed:", parsed.error.issues);
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
  const result = rows.map((r) => ({ uuid: r.employee_uuid, name: r.employee_name }));

  const parsed = listEmployeeOptionsResultSchema.safeParse(result);
  if (!parsed.success) {
    console.error("[admin/attendance] getEmployeeOptions output validation failed:", parsed.error.issues);
  }

  return result;
}
