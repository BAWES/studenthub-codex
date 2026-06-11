import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const suggestionListItemSchema = z.object({
  suggestion_uuid: z.string(),
  request_uuid: z.string(),
  candidate_id: z.number().int().nullable(),
  fulltimer_uuid: z.string().nullable(),
  note_uuid: z.string(),
  story_uuid: z.string().nullable(),
  suggestion_status: z.number().int(),
  mail_to_company: z.boolean(),
  suggestion_datetime: z.date(),
});

export type SuggestionListItem = z.output<typeof suggestionListItemSchema>;

export const listSuggestionsResultSchema = z.object({
  suggestions: z.array(suggestionListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type SuggestionListResult = z.output<typeof listSuggestionsResultSchema>;

/** Action result with operation status and message string */
export const suggestionActionResultSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

export type UpdateSuggestionStatusResult = z.output<
  typeof suggestionActionResultSchema
>;
