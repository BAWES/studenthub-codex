// Barrel re-export — schemas now live in the module layer
export {
  getCandidateSchema,
  addCandidateNoteSchema,
  candidateNoteOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema,
} from "@/modules/candidates/schemas";

export type {
  GetCandidateInput,
  AddCandidateNoteInput,
  CandidateDetail,
  CandidateNote,
  CandidateDetailResult,
  AddNoteResult,
} from "@/modules/candidates/schemas";
