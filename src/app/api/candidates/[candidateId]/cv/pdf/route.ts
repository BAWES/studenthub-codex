import { NextRequest, NextResponse } from "next/server";
import { buildCvHtml } from "@/modules/candidates/cv-pdf-helpers";
import { getCvPdfData } from "@/modules/candidates/cv-pdf-actions";
import { generatePdf } from "@/lib/pdf-renderer";

export const dynamic = "force-dynamic";

/**
 * GET /api/candidates/[candidateId]/cv/pdf
 *
 * Renders a candidate's CV as a printable HTML page.
 * - ?format=pdf: returns a downloadable PDF generated via Playwright.
 * - Default: returns a print-friendly HTML page.
 *
 * Maps to legacy profile viewing functionality.
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

    const data = await getCvPdfData({ candidateId: Number(candidateId) });
    if (!data) {
      return new NextResponse("Candidate not found", { status: 404 });
    }

    const html = buildCvHtml(data);

    // Check if PDF format was requested
    const format = _request.nextUrl.searchParams.get("format");

    if (format === "pdf") {
      return generatePdf(html, `cv-candidate-${candidateId}`, {
        footerText: "Candidate CV",
      });
    }

    // Default: return HTML for browser preview / print-to-PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("CV PDF route handler failed:", error);
    return new NextResponse("Failed to generate the CV PDF", { status: 500 });
  }
}
