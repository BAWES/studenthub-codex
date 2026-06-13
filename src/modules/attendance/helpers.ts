// ---------------------------------------------------------------------------
// Internal helpers for the attendance module (no "use server" — sync helpers)
// ---------------------------------------------------------------------------

import type { AttendanceItem } from "./schemas";

// ---------------------------------------------------------------------------
// Prisma row type (internal)
// ---------------------------------------------------------------------------

export type PrismaAttendanceRow = {
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
export function toItem(row: PrismaAttendanceRow): AttendanceItem {
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
export function buildAttendanceWhere(params: {
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
