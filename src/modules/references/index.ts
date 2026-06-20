// ---------------------------------------------------------------------------
// References — barrel exports
// ---------------------------------------------------------------------------

export {
  listCandidateReferences,
  getCandidateReference,
  createCandidateReference,
  updateCandidateReference,
  deleteCandidateReference
} from "./actions";

export type {
  ReferenceItem,
  ReferenceActionResult
} from "./schemas";

export {
  referenceItemSchema,
  referenceListSchema,
  referenceActionResultSchema
} from "./schemas";
