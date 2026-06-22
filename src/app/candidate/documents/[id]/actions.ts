// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/candidates/documents/actions.ts.
// This barrel re-exports so page consumers keep their current import paths
// without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getCandidateDocument } from "@/modules/candidates/documents/actions";
export type { CandidateDocumentItem } from "@/modules/candidates/documents/schemas";
