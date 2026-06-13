import { z } from "zod";

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
