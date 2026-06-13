// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/company/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getNoteEntry,
  updateNoteEntry,
  deleteNoteEntry,
} from "@/modules/company/actions";
export type { NoteItem } from "@/modules/company/actions";
