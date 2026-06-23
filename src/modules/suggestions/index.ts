// ---------------------------------------------------------------------------
// Suggestions — barrel exports
// ---------------------------------------------------------------------------

export {
  listSuggestions,
  updateSuggestionStatus
} from "./actions";

export type {
  SuggestionListItem,
  SuggestionListResult,
  UpdateSuggestionStatusResult
} from "./schemas";

export {
  suggestionListItemSchema,
  listSuggestionsResultSchema,
  suggestionActionResultSchema
} from "./schemas";
