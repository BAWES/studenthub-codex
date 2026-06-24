// ---------------------------------------------------------------------------
// Documents — barrel exports
// ---------------------------------------------------------------------------

export {
  listDocuments,
  getDocument,
  uploadDocument,
  deleteDocumentRecord,
  getDocumentDownloadUrl,
} from "./actions";

export type {
  ListDocumentsInput,
  UploadDocumentInput,
  DocumentItem,
  DocumentDetail,
  ListDocumentsResult,
  UploadDocumentResult,
  DeleteDocumentRecordInput,
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
} from "./schemas";
