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
  candidateNameAr: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateCivilId: string | null;
  candidateCivilExpiryDate: string | null;
  candidateBirthDate: string | null;
  candidateGender: string | null;
  nationality: string | null;
  photoUrl: string | null;
};

// ---------------------------------------------------------------------------
// Server action: fetch candidate data for ID Card PDF
// ---------------------------------------------------------------------------

/**
 * Fetch candidate data needed for the Civil ID Card PDF generation.
 * Returns null if candidate not found.
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

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
  });

  if (!candidate) return null;

  // Fetch nationality via country
  let nationality: string | null = null;
  if (candidate.country_id != null) {
    const country = await prisma.country.findUnique({
      where: { country_id: candidate.country_id },
    });
    nationality = country?.country_name_en ?? null;
  }

  return {
    candidateName: candidate.candidate_name,
    candidateNameAr: candidate.candidate_name_ar ?? null,
    candidateEmail: candidate.candidate_email || null,
    candidatePhone: candidate.candidate_phone || null,
    candidateCivilId: candidate.candidate_civil_id || null,
    candidateCivilExpiryDate: candidate.candidate_civil_expiry_date
      ? candidate.candidate_civil_expiry_date.toISOString().split("T")[0]
      : null,
    candidateBirthDate: candidate.candidate_birth_date
      ? candidate.candidate_birth_date.toISOString().split("T")[0]
      : null,
    candidateGender:
      candidate.candidate_gender === 1
        ? "Male"
        : candidate.candidate_gender === 2
          ? "Female"
          : null,
    nationality,
    photoUrl: candidate.candidate_personal_photo ?? null,
  };
}
