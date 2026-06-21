import { z } from "zod";

/**
 * Validates a candidate ID for ID card PDF download.
 * Accepts a positive integer or numeric string.
 */
export const idCardDownloadSchema = z.object({
  candidateId: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .pipe(z.number().int().positive("Candidate ID must be a positive integer")),
});

export type IdCardDownloadInput = z.input<typeof idCardDownloadSchema>;

/**
 * Builds a download URL for an ID card PDF.
 */
export function buildIdCardDownloadUrl(candidateId: number): string {
  return `/api/candidates/${candidateId}/id-card/pdf?format=pdf`;
}

/**
 * Validates and builds a download URL for a candidate ID card PDF.
 */
export function validateAndBuildIdCardUrl(input: IdCardDownloadInput): {
  url: string;
  filename: string;
} {
  const parsed = idCardDownloadSchema.parse(input);
  return {
    url: buildIdCardDownloadUrl(parsed.candidateId),
    filename: `id-card-candidate-${parsed.candidateId}.pdf`,
  };
}
