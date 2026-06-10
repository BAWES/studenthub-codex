import { z } from "zod";

// ---------------------------------------------------------------------------
// Helper — date string validator
// ---------------------------------------------------------------------------

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function dateStr() {
  return z.string().regex(datePattern, "Date must be YYYY-MM-DD");
}

// Pagination defaults

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ---------------------------------------------------------------------------
// Schemas for src/modules/appeals actions
// ---------------------------------------------------------------------------

export const APPEAL_STATUS_PENDING = 0;
export const APPEAL_STATUS_RESOLVED = 1;
export const APPEAL_STATUS_REJECTED = 2;
export const listAppealsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).optional(),
  startDate: dateStr().optional(),
  endDate: dateStr().optional(),
  page: z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
});
export const getAppealSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
});
export const createAppealSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(1000, "Reason must be 1000 characters or less"),
});
export const updateAppealStatusSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
  resolution: z.enum(["approve", "reject"], {
    errorMap: () => ({ message: 'Resolution must be "approve" or "reject"' }),
  }),
  note: z.string().optional(),
});
export const listAppealUpdatesSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
  page: z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
});
export const createAppealUpdateSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
  update: z.string().min(1, "Update text is required"),
  detail: z.string().optional(),
});
export type ListAppealsParams = z.input<typeof listAppealsSchema>;
export type CreateAppealParams = z.input<typeof createAppealSchema>;
export type UpdateAppealStatusParams = z.input<typeof updateAppealStatusSchema>;
export type CreateAppealUpdateParams = z.input<typeof createAppealUpdateSchema>;
export type AppealRow = {
  appealUuid: string;
  worklogUuid: string;
  candidateId: number;
  reason: string | null;
  status: number;
  createdAt: string;
  updatedAt: string | null;
};
export type AppealUpdateRow = {
  appealUpdateUuid: string;
  appealUuid: string;
  update: string | null;
  detail: string | null;
  createdBy: number | null;
  isNew: boolean | null;
  createdAt: string;
};
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type ActionResult = {
  success: boolean;
  error?: string;
};
