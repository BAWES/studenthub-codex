import { NextRequest, NextResponse } from "next/server";
import { buildIdCardHtml } from "@/modules/candidates/id-card-pdf-helpers";
import { getIdCardPdfData } from "@/modules/candidates/id-card-pdf-actions";

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
      return generatePdf(html, candidateId);
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

// ---------------------------------------------------------------------------
// PDF generation via Playwright (reuses cached browser instance)
// ---------------------------------------------------------------------------

/** Minimal browser interface for the cached Chromium instance */
interface BrowserHandle {
  contexts(): unknown[];
  isConnected(): boolean;
  newPage(): Promise<any>;
  close(): Promise<void>;
}

let _browser: BrowserHandle | null = null;

async function getBrowser(): Promise<BrowserHandle> {
  if (_browser) {
    try {
      const contexts = _browser.contexts();
      if (contexts.length > 0 || _browser.isConnected()) {
        return _browser;
      }
    } catch {
      // Browser is dead — fall through to re-launch
    }
  }

  const playwrightModule = await new Function('return import("playwright")')();
  const { chromium } = playwrightModule;
  _browser = (await chromium.launch({ headless: true })) as unknown as BrowserHandle;

  process.once("beforeExit", () => {
    if (_browser) {
      _browser.close().catch(() => {});
    }
  });

  return _browser;
}

async function generatePdf(html: string, candidateId: string): Promise<NextResponse> {
  let page: any = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="font-size:10px;color:#aaa;text-align:center;width:100%;padding:0 15mm;">
          Civil ID Card &mdash; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
    });

    return new NextResponse(pdfBuffer.toString() as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="id-card-candidate-${candidateId}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("ID Card PDF generation failed:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}
