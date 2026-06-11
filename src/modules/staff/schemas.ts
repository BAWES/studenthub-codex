import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffListItemSchema = z.object({
  staff_id: z.number().int().nonnegative(),
  staff_name: z.string(),
  staff_job_title: z.string().nullable(),
  staff_email: z.string(),
  staff_role: z.boolean().nullable(),
  staff_status: z.number().int(),
  staff_created_at: z.date(),
});

export type StaffListItem = z.output<typeof staffListItemSchema>;

export const staffListResultSchema = z.object({
  staff: z.array(staffListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type StaffListResult = z.output<typeof staffListResultSchema>;

export const staffGetResultSchema = staffListItemSchema.nullable();

export type StaffGetResult = z.output<typeof staffGetResultSchema>;
