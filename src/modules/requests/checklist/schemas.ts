import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single request checklist item.
 */
export const checklistItemSchema = z.object({
  request_checklist_uuid: z.string(),
  status_name: z.string(),
  status_name_ar: z.string().nullable(),
  is_require: z.boolean().nullable(),
  sort_order: z.number().int().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * Schema for the listChecklists response.
 */
export const listChecklistsResultSchema = z.object({
  items: z.array(checklistItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the deleteChecklist response.
 */
export const deleteChecklistResultSchema = z.object({
  success: z.boolean(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type ChecklistListItem = z.output<typeof checklistItemSchema>;
export type ListChecklistsResult = z.output<typeof listChecklistsResultSchema>;
export type DeleteChecklistResult = z.output<typeof deleteChecklistResultSchema>;
