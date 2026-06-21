"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const getIdCardPdfDataSchema = z.object({
  candidateId: z.coerce.number().int().positive(),
});

export type GetIdCardPdfDataInput = z.input<typeof getIdCardPdfDataSchema>;

// ---------------------------------------------------------------------------
// ID Card PDF data type
// ---------------------------------------------------------------------------

export type IdCardPdfActionResult = {
  candidateName: string;
  candidateId: number;
  idCardNumber: string;
  nationality: string | null;
  dateOfBirth: string | null;
  expiryDate: string | null;
  photoUrl: string | null;
  qrCodeDataUrl: string | null;
};

// ---------------------------------------------------------------------------
// Server action: fetch candidate and ID card data for PDF
// ---------------------------------------------------------------------------

/**
 * Fetch the candidate's profile and their latest active ID card record
 * for ID card PDF generation.
 * Returns null if candidate not found or no active ID card exists.
 */
export async function getIdCardPdfData(
  input: GetIdCardPdfDataInput,
): Promise<IdCardPdfActionResult | null> {
  await requireCapability("candidate.read.any");

  const parsed = getIdCardPdfDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const { candidateId } = parsed.data;

  // Fetch candidate and their latest active ID card in parallel
  const [candidate, latestIdCard, country] = await Promise.all([
    prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
    }),
    prisma.candidate_id_card.findFirst({
      where: { candidate_id: candidateId, deleted: 0 },
      orderBy: { id: "desc" },
    }),
    prisma.country.findUnique({
      where: { country_id: candidateId },
    }),
  ]);

  if (!candidate) return null;

  // Re-fetch country by the actual country_id from candidate
  const actualCountry =
    candidate.country_id != null
      ? await prisma.country.findUnique({
          where: { country_id: candidate.country_id },
        })
      : null;

  return {
    candidateName: candidate.candidate_name,
    candidateId: candidate.candidate_id,
    idCardNumber: latestIdCard
      ? `IC-${String(latestIdCard.id).padStart(6, "0")}`
      : "N/A",
    nationality: actualCountry?.country_name_en ?? null,
    dateOfBirth: candidate.candidate_birth_date
      ? candidate.candidate_birth_date.toISOString().split("T")[0]
      : null,
    expiryDate: latestIdCard?.expiry_date
      ? new Date(latestIdCard.expiry_date).toISOString().split("T")[0]
      : null,
    photoUrl: null, // Will be populated when photo support is added
    qrCodeDataUrl: null, // Will be populated when QR code support is added
  };
}
