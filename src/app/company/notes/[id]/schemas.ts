// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------
// All schemas and types live in src/modules/company/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  getNoteEntrySchema,
  updateNoteEntrySchema,
  deleteNoteEntrySchema,
} from "@/modules/company/schemas";

export type {
  GetNoteEntryInput,
  UpdateNoteEntryInput,
  DeleteNoteEntryInput,
  NoteEntryResponse,
} from "@/modules/company/schemas";
