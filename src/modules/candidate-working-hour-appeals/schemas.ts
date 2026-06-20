import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listAppealsSchema = z.object({
  candidate_id: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).max(4).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getAppealSchema = z.object({
  uuid: z.string().min(1, "Appeal UUID is required"),
});

export const createAppealSchema = z.object({
  candidate_working_hour_uuid: z.string().min(1, "Working hour UUID is required"),
  candidate_id: z.coerce.number().int().positive("Candidate ID is required"),
  reason: z.string().min(1, "Reason is required"),
});

export const updateAppealStatusSchema = z.object({
  uuid: z.string().min(1, "Appeal UUID is required"),
  status: z.coerce.number().int().min(0).max(4, "Status must be between 0 and 4"),
});

export const listAppealUpdatesSchema = z.object({
  appeal_uuid: z.string().min(1, "Appeal UUID is required"),
});

export const createAppealUpdateSchema = z.object({
  appeal_uuid: z.string().min(1, "Appeal UUID is required"),
  update: z.string().min(1, "Update text is required"),
  detail: z.string().optional().default(""),
});

export type ListAppealsInput = z.input<typeof listAppealsSchema>;
export type ListAppealsParams = ListAppealsInput;
export type GetAppealParams = z.input<typeof getAppealSchema>;
export type CreateAppealParams = z.input<typeof createAppealSchema>;
export type UpdateAppealStatusParams = z.input<typeof updateAppealStatusSchema>;
export type ListAppealUpdatesParams = z.input<typeof listAppealUpdatesSchema>;
export type CreateAppealUpdateParams = z.input<typeof createAppealUpdateSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const appealItemSchema = z.object({
  appeal_uuid: z.string(),
  candidate_working_hour_uuid: z.string(),
  candidate_id: z.number(),
  reason: z.string().nullable(),
  status: z.number(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type AppealItem = z.output<typeof appealItemSchema>;

export const appealUpdateItemSchema = z.object({
  appeal_update_uuid: z.string(),
  appeal_uuid: z.string(),
  update: z.string().nullable(),
  detail: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  created_by: z.number().nullable(),
  updated_by: z.number().nullable(),
  is_new: z.boolean().nullable(),
});

export type AppealUpdateItem = z.output<typeof appealUpdateItemSchema>;

export const listAppealsResultSchema = z.object({
  appeals: z.array(appealItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListAppealsResult = z.output<typeof listAppealsResultSchema>;
