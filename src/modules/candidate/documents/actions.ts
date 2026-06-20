"use server";

// ---------------------------------------------------------------------------
// Candidate Documents — module-level server actions
// ---------------------------------------------------------------------------
// Self-service wrappers that derive candidateId from the session and delegate
// to the module-level action implementations in @/modules/candidates/documents.
//
// Actions:
//   - listDocuments    — list all document types with upload status
//   - getDocument      — get a single document by type
//   - uploadDocument   — upload a document file (FormData)
//   - deleteDocument   — delete a document by type
// ---------------------------------------------------------------------------

import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateDocuments,
  getCandidateDocument,
  uploadCandidateDocument,
  deleteCandidateDocument,
  getCandidateDocumentDownloadUrl,
} from "@/modules/candidates/documents";
import type {
  CandidateDocumentItem,
  ListCandidateDocumentsResult,
  UploadDocumentState,
  DeleteDocumentState,
} from "@/modules/candidates/documents";

import {
  listDocumentsSchema,
  getDocumentSchema,
  listDocumentsOutputSchema,
  getDocumentOutputSchema,
  uploadDocumentOutputSchema,
  deleteDocumentOutputSchema,
} from "./schemas";
import type { ListDocumentsParams, GetDocumentParams } from "./schemas";

// ---------------------------------------------------------------------------
// listDocuments
// ---------------------------------------------------------------------------

/**
 * List all required document types and their upload status for the current
 * candidate. Derives candidateId from the session (self-service).
 */
export async function listDocuments(
  params: ListDocumentsParams = {},
): Promise<ListCandidateDocumentsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listDocumentsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const candidateId = Number(session.id);
  const result = await listCandidateDocuments({ candidateId });

  // Validate output shape
  const listOutputParsed = listDocumentsOutputSchema.safeParse(result);
  if (!listOutputParsed.success) {
    console.error(
      "[candidate/documents] listDocuments output validation failed:",
      listOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDocument
// ---------------------------------------------------------------------------

/**
 * Get a single document by type for the current candidate.
 * Derives candidateId from the session (self-service).
 */
export async function getDocument(
  documentType: string,
): Promise<CandidateDocumentItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getDocumentSchema.safeParse({ documentType });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid document type");
  }

  const candidateId = Number(session.id);
  const result = await getCandidateDocument({ candidateId, documentType: parsed.data.documentType });

  // Validate output shape
  const getOutputParsed = getDocumentOutputSchema.safeParse(result);
  if (!getOutputParsed.success) {
    console.error(
      "[candidate/documents] getDocument output validation failed:",
      getOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDocumentDownloadUrl
// ---------------------------------------------------------------------------

/**
 * Generate a presigned S3 download URL for a candidate document.
 * Returns null if S3 is not configured or the file is stored locally.
 */
export async function getDocumentDownloadUrl(
  documentType: string,
): Promise<{ downloadUrl: string; key: string } | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getDocumentSchema.safeParse({ documentType });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid document type");
  }

  const candidateId = Number(session.id);
  const result = await getCandidateDocumentDownloadUrl({
    candidateId,
    documentType: parsed.data.documentType,
  });

  return result;
}

// ---------------------------------------------------------------------------
// uploadDocument
// ---------------------------------------------------------------------------

/**
 * Upload a document file for the current candidate.
 * Delegates to the module-level uploadCandidateDocument which handles
 * file validation, storage, and DB updates.
 *
 * The form data should contain a `file_{type}` field (e.g. file_photo, file_cv).
 */
export async function uploadDocument(
  prevState: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  await requireRoleCapability("candidate", "candidate.profile.edit");
  const result = await uploadCandidateDocument(prevState, formData);

  // Validate output shape
  const uploadOutputParsed = uploadDocumentOutputSchema.safeParse(result);
  if (!uploadOutputParsed.success) {
    console.error(
      "[candidate/documents] uploadDocument output validation failed:",
      uploadOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteDocument
// ---------------------------------------------------------------------------

/**
 * Delete a document for the current candidate.
 * Delegates to the module-level deleteCandidateDocument.
 */
export async function deleteDocument(
  prevState: DeleteDocumentState,
  formData: FormData,
): Promise<DeleteDocumentState> {
  await requireRoleCapability("candidate", "candidate.profile.edit");
  const result = await deleteCandidateDocument(prevState, formData);

  // Validate output shape
  const deleteOutputParsed = deleteDocumentOutputSchema.safeParse(result);
  if (!deleteOutputParsed.success) {
    console.error(
      "[candidate/documents] deleteDocument output validation failed:",
      deleteOutputParsed.error.issues,
    );
  }

  return result;
}
