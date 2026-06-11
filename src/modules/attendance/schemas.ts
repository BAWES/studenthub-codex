import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
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

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single attendance item returned from listAttendance / getAttendance.
 */
export const attendanceItemSchema = z.object({
  attendance_uuid: z.string(),
  employee_uuid: z.string().nullable(),
  date: z.string(),
  clock_in: z.string().nullable(),
  clock_out: z.string().nullable(),
  total_hours: z.number().nullable(),
  status: z.number().int(),
  note: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Schema for getAttendance result (item or null).
 */
export const attendanceDetailSchema = attendanceItemSchema.nullable();

/**
 * Schema for the listAttendance response.
 */
export const listAttendanceResultSchema = z.object({
  items: z.array(attendanceItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the createAttendance response.
 */
export const createAttendanceResultSchema = z.object({
  attendance_uuid: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAttendanceParams = z.input<typeof listAttendanceSchema>;
export type GetAttendanceParams = z.input<typeof getAttendanceSchema>;
export type CreateAttendanceParams = z.input<typeof createAttendanceSchema>;
export type AttendanceItem = z.output<typeof attendanceItemSchema>;
export type AttendanceDetail = z.output<typeof attendanceDetailSchema>;
export type ListAttendanceResult = z.output<typeof listAttendanceResultSchema>;
