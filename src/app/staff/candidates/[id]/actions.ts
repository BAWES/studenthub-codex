"use server";

// Barrel re-export — actions now live in src/modules/candidates/actions.ts
export {
  getCandidate,
  addCandidateNote as addNote,
} from "@/modules/candidates/actions";
