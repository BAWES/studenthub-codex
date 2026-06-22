import { NextRequest, NextResponse } from "next/server";
import { buildCertificateHtml } from "@/modules/candidates/certificates/pdf-helpers";
import { getCertificatePdfData } from "@/modules/candidates/certificates/pdf-actions";
import { generatePdf } from "@/lib/pdf-renderer";

export const dynamic = "force-dynamic";

/**
 * GET /api/candidates/[candidateId]/certificates/[uuid]/pdf
 *
 * Renders a candidate certificate as a printable HTML page.
 * - ?format=pdf: returns a downloadable PDF generated via Playwright.
 * - Default: returns a print-friendly HTML page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ candidateId: string; uuid: string }> },
) {
  try {
    const { candidateId, uuid } = await params;

    if (!candidateId || candidateId.trim().length === 0) {
      return new NextResponse("Missing candidate ID", { status: 400 });
    }

    if (!uuid || uuid.trim().length === 0) {
      return new NextResponse("Missing certificate UUID", { status: 400 });
    }

    const data = await getCertificatePdfData({
      candidateId: Number(candidateId),
      certificateUuid: uuid,
    });

    if (!data) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    const html = buildCertificateHtml(data);

    const format = _request.nextUrl.searchParams.get("format");

    if (format === "pdf") {
      return generatePdf(html, `certificate-${uuid.slice(0, 12)}`, {
        footerText: "Certificate",
      });
    }

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error generating certificate PDF:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate certificate document";

    return new NextResponse(message, { status: 500 });
  }
}
