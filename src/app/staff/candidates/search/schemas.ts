// ---------------------------------------------------------------------------
// Staff — Candidates Search Page Schemas
// ---------------------------------------------------------------------------
// Re-exports the parse utilities used by the page to validate search
// parameters from the URL query string. These serve as the data contract
// between the page and its search parameter inputs.
// ---------------------------------------------------------------------------

export {
  parseFilter,
  parseCandidateId,
  parseCandidateIds,
  parseSearchPage,
} from "@/modules/candidates/search-typesense";

export { parseVisibility } from "@/modules/candidates/search";
