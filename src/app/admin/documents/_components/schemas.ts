import { z } from "zod";

export const cvDownloadSchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
});

export const uuidDownloadSchema = z.object({
  uuid: z.string().uuid("Must be a valid UUID"),
});

export const certificateDownloadSchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
});

export function buildCvDownloadUrl(candidateId: string): string {
  return `/api/candidates/${candidateId}/cv/pdf?format=pdf`;
}

export function buildEvaluationDownloadUrl(uuid: string): string {
  return `/api/evaluations/${uuid}/pdf?format=pdf`;
}

export function buildOfferLetterDownloadUrl(uuid: string): string {
  return `/api/fulltimers/${uuid}/offer-letter/pdf?format=pdf`;
}

export function buildBankAdviceDownloadUrl(uuid: string): string {
  return `/api/transfers/bank-advice/${uuid}/pdf?format=pdf`;
}

export function buildIdCardDownloadUrl(candidateId: string): string {
  return `/api/candidates/${candidateId}/id-card/pdf?format=pdf`;
}

export function buildCertificateDownloadUrl(candidateId: string, certificateUuid: string): string {
  return `/api/candidates/${candidateId}/certificates/${certificateUuid}/pdf?format=pdf`;
}
