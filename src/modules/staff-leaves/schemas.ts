import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listStaffLeavesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
});

export const getStaffLeaveSchema = z.object({
  leaveUuid: z.string().min(1, "Leave UUID is required"),
});

export const createStaffLeaveSchema = z.object({
  staffId: z.coerce.number().int().positive().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  note: z.string().optional(),
  category: z.string().optional(),
  status: z.coerce.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffLeaveListItemSchema = z.object({
  staff_leave_uuid: z.string(),
  staff_id: z.number().nullable(),
  staff_name: z.string().nullable(),
  from_date: z.string().nullable(),
  to_date: z.string().nullable(),
  note: z.string().nullable(),
  category: z.string().nullable(),
  status: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type StaffLeaveListItem = z.output<typeof staffLeaveListItemSchema>;

export const listStaffLeavesResultSchema = z.object({
  leaves: z.array(staffLeaveListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListStaffLeavesResult = z.output<typeof listStaffLeavesResultSchema>;

export const createStaffLeaveResultSchema = z.object({
  staff_leave_uuid: z.string(),
});

export type CreateStaffLeaveResult = z.output<typeof createStaffLeaveResultSchema>;
