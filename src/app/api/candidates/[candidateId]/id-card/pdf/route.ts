import { NextRequest, NextResponse } from "next/server";
import { buildIdCardHtml } from "@/modules/candidates/id-card-pdf-helpers";
import { getIdCardPdfData } from "@/modules/candidates/id-card-pdf-actions";
import { generatePdf } from "@/lib/pdf-renderer";

export const dynamic = "force-dynamic";

/**
 * GET /api/candidates/[candidateId]/id-card/pdf
 *
 * Renders a candidate's Civil ID card as a printable HTML page.
 * - ?format=pdf: returns a downloadable PDF generated via Playwright.
 * - Default: returns a print-friendly HTML page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> },
) {
  try {
    const { candidateId } = await params;

    if (!candidateId || candidateId.trim().length === 0) {
      return new NextResponse("Missing candidate ID", { status: 400 });
    }

    const data = await getIdCardPdfData({ candidateId: Number(candidateId) });
    if (!data) {
      return new NextResponse("Candidate not found", { status: 404 });
    }

    const html = buildIdCardHtml(data);

    // Check if PDF format was requested
    const format = _request.nextUrl.searchParams.get("format");

    if (format === "pdf") {
      return generatePdf(html, `id-card-candidate-${candidateId}`, {
        footerText: "Civil ID Card",
      });
    }

    // Default: return HTML for browser preview / print-to-PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("ID Card PDF route handler failed:", error);
    return new NextResponse("Failed to generate the ID Card PDF", {
      status: 500,
    });
  }
}
