// ---------------------------------------------------------------------------
// Candidate Languages — colocated server actions
// Delegates to module-level actions in @/modules/candidates/languages/actions
// ---------------------------------------------------------------------------

export {
  listCandidateLanguages,
  createCandidateLanguage,
} from "@/modules/candidates/languages/actions";

export type {
  LanguageItem,
  LanguageActionResult,
} from "@/modules/candidates/languages/schemas";
