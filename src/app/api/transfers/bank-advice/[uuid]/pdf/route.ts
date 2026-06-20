import { NextRequest, NextResponse } from "next/server";
import { buildBankAdviceHtml } from "@/modules/admin/transfers/bank-advice/pdf-helpers";
import { getBankAdvicePdfData } from "@/modules/admin/transfers/bank-advice/pdf-actions";

export const dynamic = "force-dynamic";

/**
 * GET /api/transfers/bank-advice/[uuid]/pdf
 *
 * Renders a bank advice document as a printable HTML page.
 * - ?format=pdf: returns a downloadable PDF generated via Playwright.
 * - Default: returns a print-friendly HTML page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  try {
    const { uuid } = await params;

    if (!uuid || uuid.trim().length === 0) {
      return new NextResponse("Missing bank advice UUID", { status: 400 });
    }

    const data = await getBankAdvicePdfData({ uuid });
    if (!data) {
      return new NextResponse("Bank advice not found", { status: 404 });
    }

    const html = buildBankAdviceHtml(data);

    const format = _request.nextUrl.searchParams.get("format");

    if (format === "pdf") {
      // Return HTML for Playwright-based PDF generation
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error generating bank advice PDF:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate bank advice document";

    return new NextResponse(message, { status: 500 });
  }
}
