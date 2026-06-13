// ---------------------------------------------------------------------------
// Notes — barrel exports
// ---------------------------------------------------------------------------

export {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} from "./actions";

export type {
  ListNotesParams,
  GetNoteParams,
  CreateNoteParams,
  UpdateNoteParams,
  DeleteNoteParams,
  NoteListItem,
  NoteDetail,
  ListNotesResult,
  NoteDetailOrNull,
  NoteMutationResult,
  NoteDeleteResult
} from "./schemas";

export {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  noteListItemSchema,
  noteDetailSchema,
  listNotesResultSchema,
  noteDetailOrNullSchema,
  noteMutationResultSchema,
  noteDeleteResultSchema
} from "./schemas";
