import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/certificates route
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const listCertificatesSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  candidateId: z.number().int().positive(),
});

export const getCertificateSchema = z.object({
  uuid: z.string().min(1, "Certificate UUID is required"),
});

export const createCertificateSchema = z.object({
  candidateId: z.number().int().positive(),
  certificateType: z.boolean().optional(),
  certificateTitle: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateUrl: z.string().optional(),
  candidateWorkHistoryId: z.number().int().positive().optional(),
  examUuid: z.string().optional(),
  storeId: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  parentCompanyId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
  certificateType: z.boolean().optional(),
  certificateTitle: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateUrl: z.string().optional(),
  certificateLink: z.string().optional(),
  candidateWorkHistoryId: z.number().int().positive().optional(),
  examUuid: z.string().optional(),
  storeId: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  parentCompanyId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const deleteCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
});
