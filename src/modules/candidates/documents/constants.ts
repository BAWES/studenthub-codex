// ---------------------------------------------------------------------------
// Document type constants — shared by actions, schemas, and UI
// Separated from "use server" file to avoid Next.js build error:
// "A \"use server\" file can only export async functions, found object."
// ---------------------------------------------------------------------------

export const DOCUMENT_TYPES = [
  "photo",
  "cv",
  "video",
  "civilFront",
  "civilBack",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
