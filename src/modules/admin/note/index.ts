// ---------------------------------------------------------------------------
// Admin Note - barrel exports
// ---------------------------------------------------------------------------

export {
  listNotes,
  getNote,
  createNote,
  updateNote,
} from "./actions";

export type {
  ListNotesParams,
  GetNoteParams,
  CreateNoteParams,
  UpdateNoteParams,
  NoteItem,
  ListNotesResult,
} from "./schemas";

export {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  staffInfoSchema,
  noteItemSchema,
  listNotesResultSchema,
  operationResultSchema,
} from "./schemas";
