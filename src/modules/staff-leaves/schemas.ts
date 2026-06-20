import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const staffLeaveListItemSchema = z.object({
  staff_leave_uuid: z.string(),
  staff_id: z.number().nullable(),
  staff_name: z.string().nullable(),
  from_date: z.string().nullable(),
  to_date: z.string().nullable(),
  note: z.string().nullable(),
  category: z.string().nullable(),
  status: z.number().int().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type StaffLeaveListItem = z.infer<typeof staffLeaveListItemSchema>;

export const listStaffLeavesResultSchema = z.object({
  leaves: z.array(staffLeaveListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListStaffLeavesResult = z.infer<typeof listStaffLeavesResultSchema>;

export const createStaffLeaveResultSchema = z.object({
  staff_leave_uuid: z.string(),
});

export type CreateStaffLeaveResult = z.infer<typeof createStaffLeaveResultSchema>;

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
