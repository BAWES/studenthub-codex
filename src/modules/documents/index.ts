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
  deleteDocumentRecordSchema,
  documentItemSchema,
  documentDetailSchema,
  listDocumentsResultSchema,
  uploadDocumentResultSchema,
  deleteDocumentRecordResultSchema,
} from "./schemas";
