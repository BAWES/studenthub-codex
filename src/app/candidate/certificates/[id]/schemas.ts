import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/certificates/[id] actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const getCertificateSchema = z.object({
  uuid: z.string().min(1, "Certificate UUID is required"),
});

const optionalString = z.string().optional();

export const updateCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
  certificateType: z.boolean().optional(),
  certificateTitle: optionalString,
  certificateIssuer: optionalString,
  certificateUrl: optionalString,
  startDate: optionalString,
  endDate: optionalString,
});

export const deleteCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCertificateInput = z.input<typeof getCertificateSchema>;
export type UpdateCertificateInput = z.input<typeof updateCertificateSchema>;
export type DeleteCertificateInput = z.input<typeof deleteCertificateSchema>;
