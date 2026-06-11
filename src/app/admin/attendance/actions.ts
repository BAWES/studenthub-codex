"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { ListAttendanceParams, ListAttendanceResult } from "@/modules/attendance/schemas";
import { listAttendance, createAttendance } from "@/modules/attendance/actions";

export async function listAdminAttendance(
  params: ListAttendanceParams = {},
): Promise<ListAttendanceResult> {
  return listAttendance(params);
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
  revalidatePath("/admin/attendance");
  return result;
}

export async function getEmployeeOptions(): Promise<{ uuid: string; name: string }[]> {
  await requireCapability("admin.read");
  const rows = await prisma.employee.findMany({
    where: { deleted: 0 },
    orderBy: { employee_name: "asc" },
    select: { employee_uuid: true, employee_name: true },
  });
  return rows.map((r) => ({ uuid: r.employee_uuid, name: r.employee_name }));
}
