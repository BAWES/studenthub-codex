import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listRequestChecklistsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
});

export const createRequestChecklistSchema = z.object({
  statusName: z.string().min(1, "Status name is required").max(100),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateRequestChecklistSchema = z.object({
  requestChecklistUuid: z.string().min(1, "Request checklist UUID is required"),
  statusName: z.string().min(1).max(100).optional(),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const deleteRequestChecklistSchema = z.object({
  requestChecklistUuid: z.string().min(1, "Request checklist UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single request checklist item.
 */
export const requestChecklistItemSchema = z.object({
  request_checklist_uuid: z.string(),
  status_name: z.string(),
  status_name_ar: z.string().nullable(),
  is_require: z.boolean().nullable(),
  sort_order: z.number().int().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for the listRequestChecklists response.
 */
export const listRequestChecklistsResultSchema = z.object({
  items: z.array(requestChecklistItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for getRequestChecklist result (item or null).
 */
export const requestChecklistDetailSchema = requestChecklistItemSchema.nullable();

/**
 * Schema for delete response.
 */
export const deleteRequestChecklistResultSchema = z.object({
  success: z.boolean(),
});

// ---------------------------------------------------------------------------
// Types derived from schemas
// ---------------------------------------------------------------------------

export type ListRequestChecklistsParams = z.input<typeof listRequestChecklistsSchema>;
export type CreateRequestChecklistParams = z.input<typeof createRequestChecklistSchema>;
export type UpdateRequestChecklistParams = z.input<typeof updateRequestChecklistSchema>;
export type DeleteRequestChecklistParams = z.input<typeof deleteRequestChecklistSchema>;

export type RequestChecklistItem = z.output<typeof requestChecklistItemSchema>;
export type ListRequestChecklistsResult = z.output<typeof listRequestChecklistsResultSchema>;
export type RequestChecklistDetail = z.output<typeof requestChecklistDetailSchema>;
export type DeleteRequestChecklistResult = z.output<typeof deleteRequestChecklistResultSchema>;
