import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/attendance actions
// ---------------------------------------------------------------------------

export const listAttendanceSchema = z.object({
  employee_uuid: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getAttendanceSchema = z.object({
  uuid: z.string().min(1, "Attendance UUID is required"),
});
export const createAttendanceSchema = z.object({
  employee_uuid: z.string().min(1, "Employee UUID is required"),
  date: z.string().min(1, "Date is required"),
  clock_in: z.string().optional(),
  clock_out: z.string().optional(),
  total_hours: z.number().positive().optional(),
  status: z.number().int().optional().default(10),
  note: z.string().max(500).optional(),
});
export type ListAttendanceParams = z.input<typeof listAttendanceSchema>;
export type GetAttendanceParams = z.input<typeof getAttendanceSchema>;
export type CreateAttendanceParams = z.input<typeof createAttendanceSchema>;
export type AttendanceItem = {
  attendance_uuid: string;
  employee_uuid: string | null;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number | null;
  status: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};
export type AttendanceDetail = AttendanceItem | null;
export type ListAttendanceResult = {
  items: AttendanceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
