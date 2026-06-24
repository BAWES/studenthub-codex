// ---------------------------------------------------------------------------
// Documents — barrel exports
// ---------------------------------------------------------------------------

export {
  listDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
  getDocumentDownloadUrl,
} from "./actions";

export type {
  ListDocumentsInput,
  UploadDocumentInput,
  DocumentItem,
  DocumentDetail,
  ListDocumentsResult,
  UploadDocumentResult
} from "./schemas";

export {
  listDocumentsSchema,
  getDocumentSchema,
  uploadDocumentSchema,
  documentItemSchema,
  documentDetailSchema,
  listDocumentsResultSchema,
  uploadDocumentResultSchema
} from "./schemas";
