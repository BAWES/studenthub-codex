// ---------------------------------------------------------------------------
// Documents — barrel exports
// ---------------------------------------------------------------------------

export {
  listDocuments,
  getDocument,
  uploadDocument,
  getDocumentDownloadUrl,
  deleteDocumentRecord as deleteDocument,
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
  uploadDocumentResultSchema,
  deleteDocumentRecordSchema,
} from "./schemas";
