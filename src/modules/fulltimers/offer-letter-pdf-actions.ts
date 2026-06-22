"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const getOfferLetterDataSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
});

export type GetOfferLetterDataInput = z.input<typeof getOfferLetterDataSchema>;

// ---------------------------------------------------------------------------
// Offer letter PDF data type
// ---------------------------------------------------------------------------

export type OfferLetterActionResult = {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  startDate: string;
  salary: string;
  workLocation: string;
  employmentType: string;
  companyName: string;
  hrName: string;
  offerDate: string;
  expiryDate: string;
  additionalTerms: string;
};

// ---------------------------------------------------------------------------
// Server action: fetch fulltimer data for offer letter PDF
// ---------------------------------------------------------------------------

/**
 * Fetch fulltimer data needed for the offer letter PDF generation.
 * Returns null if fulltimer not found.
 * Position data is inferred from the fulltimer's latest job application, if available.
 */
export async function getOfferLetterPdfData(
  input: GetOfferLetterDataInput,
): Promise<OfferLetterActionResult | null> {
  await requireCapability("fulltimer.read");

  const parsed = getOfferLetterDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid fulltimer UUID");
  }

  const { fulltimerUuid } = parsed.data;

  const fulltimer = await prisma.fulltimer.findUnique({
    where: { fulltimer_uuid: fulltimerUuid },
    include: {
      country_fulltimer_nationality_idTocountry: true,
      request_application: {
        include: {
          request: {
            select: {
              request_position_title: true,
              request_location: true,
              request_compensation: true,
              request_started_at: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });

  if (!fulltimer) return null;

  // Try to get position data from the latest application
  const latestApp = fulltimer.request_application?.[0];
  const positionTitle = latestApp?.request?.request_position_title ?? "Staff";
  const jobLocation = latestApp?.request?.request_location ?? "Kuwait City";
  const compensation = latestApp?.request?.request_compensation ?? "";

  // Build salary string
  const salaryAmount =
    fulltimer.fulltimer_expected_salary ||
    fulltimer.fulltimer_current_salary ||
    compensation ||
    "To be determined";
  const currency = fulltimer.currency_code || "KWD";
  const salary = `${salaryAmount} ${currency}/month`;

  // Format dates
  const today = new Date();
  const offerDateStr = today.toLocaleDateString("en-KW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Offer valid for 14 days
  const expiryDate = new Date(today);
  expiryDate.setDate(expiryDate.getDate() + 14);
  const expiryDateStr = expiryDate.toLocaleDateString("en-KW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Start date: from application or 2 weeks from now
  const startDate = latestApp?.request?.request_started_at
    ? new Date(latestApp.request.request_started_at).toISOString().split("T")[0]
    : new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

  return {
    candidateName: fulltimer.fulltimer_name,
    candidateEmail: fulltimer.fulltimer_email,
    position: positionTitle,
    department: "Operations",
    startDate,
    salary,
    workLocation: jobLocation,
    employmentType: "Full-time",
    companyName: "StudentHub",
    hrName: "Human Resources",
    offerDate: offerDateStr,
    expiryDate: expiryDateStr,
    additionalTerms:
      "Benefits include health insurance, 30 days annual leave, and professional development opportunities.",
  };
}
