export {
  listCandidateDocuments,
  getCandidateDocument,
  uploadCandidateDocument,
  deleteCandidateDocument,
} from "./actions";

export type {
  CandidateDocumentItem,
  ListCandidateDocumentsResult,
  DocumentType,
  UploadDocumentState,
  DeleteDocumentState,
  ListDocumentsParams,
  GetDocumentParams,
  UploadDocumentParams,
  DeleteDocumentParams,
} from "./actions";

export { DOCUMENT_TYPES } from "./actions";
