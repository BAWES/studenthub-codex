import { NextRequest, NextResponse } from "next/server";
import { buildOfferLetterHtml } from "@/modules/fulltimers/offer-letter-pdf-helpers";
import { getOfferLetterPdfData } from "@/modules/fulltimers/offer-letter-pdf-actions";
import { generatePdf } from "@/lib/pdf-renderer";

export const dynamic = "force-dynamic";

/**
 * GET /api/fulltimers/[uuid]/offer-letter/pdf
 *
 * Renders an offer letter as a printable HTML page.
 * - ?format=pdf: returns a downloadable PDF generated via Playwright.
 * - Default: returns a print-friendly HTML page.
 *
 * Additional query params for customization:
 * - ?position=...           Override job position
 * - ?department=...         Override department
 * - ?startDate=...          Override start date (YYYY-MM-DD)
 * - ?salary=...             Override salary string
 * - ?workLocation=...       Override work location
 * - ?employmentType=...     Override employment type
 * - ?companyName=...        Override company name
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  try {
    const { uuid } = await params;

    if (!uuid || uuid.trim().length === 0) {
      return new NextResponse("Missing fulltimer UUID", { status: 400 });
    }

    const data = await getOfferLetterPdfData({ fulltimerUuid: uuid });
    if (!data) {
      return new NextResponse("Fulltimer not found", { status: 404 });
    }

    // Allow query param overrides for customization
    const searchParams = _request.nextUrl.searchParams;
    const position = searchParams.get("position") || data.position;
    const department = searchParams.get("department") || data.department;
    const startDate = searchParams.get("startDate") || data.startDate;
    const salary = searchParams.get("salary") || data.salary;
    const workLocation = searchParams.get("workLocation") || data.workLocation;
    const employmentType = searchParams.get("employmentType") || data.employmentType;
    const companyName = searchParams.get("companyName") || data.companyName;

    const html = buildOfferLetterHtml({
      ...data,
      position,
      department,
      startDate,
      salary,
      workLocation,
      employmentType,
      companyName,
    });

    // Check if PDF format was requested
    const format = searchParams.get("format");

    if (format === "pdf") {
      return generatePdf(html, `offer-letter-${uuid.slice(0, 12)}`, {
        footerText: "Offer Letter",
        margins: { top: "25mm", bottom: "25mm", left: "20mm", right: "20mm" },
      });
    }

    // Default: return HTML for browser preview / print-to-PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Offer letter PDF route handler failed:", error);
    return new NextResponse("Failed to generate the offer letter", { status: 500 });
  }
}
