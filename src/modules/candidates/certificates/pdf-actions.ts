import { prisma } from "@/lib/prisma";
import type { CertificatePdfData } from "./pdf-helpers";

/**
 * Fetch certificate data for PDF generation.
 * Returns null if not found or soft-deleted.
 */
export async function getCertificatePdfData(params: {
  candidateId: number;
  certificateUuid: string;
}): Promise<CertificatePdfData | null> {
  const { candidateId, certificateUuid } = params;

  const certificate = await prisma.candidate_certificate.findFirst({
    where: {
      certificate_uuid: certificateUuid,
      candidate_id: candidateId,
      is_deleted: false,
    },
    include: {
      candidate: {
        select: {
          candidate_name: true,
        },
      },
      staff: {
        select: {
          staff_name: true,
        },
      },
    },
  });

  if (!certificate) return null;

  return {
    certificateUuid: certificate.certificate_uuid,
    certificateTitle: certificate.certificate_title,
    certificateIssuer: certificate.certificate_issuer,
    certificateUrl: certificate.certificate_url,
    candidateName: certificate.candidate?.candidate_name ?? null,
    startDate: certificate.start_date?.toISOString() ?? null,
    endDate: certificate.end_date?.toISOString() ?? null,
    staffName: certificate.staff?.staff_name ?? null,
  };
}
