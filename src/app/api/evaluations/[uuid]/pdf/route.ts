import { NextRequest, NextResponse } from "next/server";
import {
  escapeHtml,
  validateUuid,
  calculateAverageRating,
  renderStars,
  buildReportHtml,
  type ReportData,
} from "@/modules/candidates/evaluation/pdf-helpers";
import { getEvaluationPdfData } from "@/modules/candidates/evaluation/actions";

export const dynamic = "force-dynamic";

// Keep Chromium instance cached across warm invocations
let _chromium: Awaited<ReturnType<typeof import("playwright").chromium.launch>> | null = null;

const PDF_TIMEOUT_MS = 30_000; // 30 seconds max for PDF generation
const BROWSER_LAUNCH_TIMEOUT_MS = 15_000; // 15 seconds for Chromium launch
const PAGE_CONTENT_TIMEOUT_MS = 20_000; // 20 seconds for page content rendering

async function getBrowser() {
  // If we have a cached instance, verify it's still alive
  if (_chromium) {
    try {
      const contexts = _chromium.contexts();
      // If it has no contexts it may have crashed — re-launch
      if (contexts.length > 0 || _chromium.isConnected()) {
        return _chromium;
      }
    } catch {
      // Browser is dead — fall through to re-launch
    }
  }

  // Dynamic import hidden from webpack — prevents build-time bundling of
  // playwright-core's optional chromium-bidi dependency
  const playwrightModule = await new Function('return import("playwright")')();
  const { chromium } = playwrightModule;
  _browser = (await chromium.launch({ headless: true })) as unknown as BrowserHandle;

  // Ensure cleanup on process exit to avoid orphaned Chromium processes
  process.once("beforeExit", () => {
    if (_chromium) {
      _chromium.close().catch(() => {});
    }
  });

  return _chromium!;
}

/**
 * GET /api/evaluations/[uuid]/pdf
 *
 * Renders a candidate evaluation report.
 * - Default (?format=html or no format): returns a print-friendly HTML page.
 * - ?format=pdf: returns a downloadable PDF generated via Playwright.
 *
 * Maps to legacy GET /staff/v1/candidate-evaluation/pdf/{id}
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  try {

    const valid = validateUuid(uuid);
    if (!valid.valid) {
      return new NextResponse(valid.error ?? "Missing evaluation UUID", { status: 400 });
    }

    const data = await getEvaluationPdfData({ evaluationUuid: uuid });
    if (!data) {
      return new NextResponse("Evaluation not found", { status: 404 });
    }

    const candidateName = data.candidate?.candidate_name ?? "Unknown Candidate";
    const candidateEmail = data.candidate?.candidate_email ?? "";
    const staffName = data.staff?.staff_name ?? "N/A";
    const evalDate = data.created_at
      ? new Date(data.created_at).toLocaleDateString("en-KW", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
    const period =
      data.start_date && data.end_date
        ? `${new Date(data.start_date).toLocaleDateString("en-KW")} \u2192 ${new Date(data.end_date).toLocaleDateString("en-KW")}`
        : "N/A";

    const answerRows = (data.answers ?? [])
      .map(
        (a, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${escapeHtml(a.question ?? "\u2014")}</td>
      <td>${escapeHtml(a.answer ?? "\u2014")}</td>
      <td class="rating">${renderStars(a.rating)}</td>
    </tr>`,
      )
      .join("\n");

    const avgRating = calculateAverageRating(data.answers ?? []);

    const html = buildReportHtml({
      candidateName,
      candidateEmail,
      staffName,
      period,
      evalDate,
      uuid,
      answerRows,
      answersCount: (data.answers ?? []).length,
      avgRating,
    });

    // Check if PDF format was requested
    const format = _request.nextUrl.searchParams.get("format");

    if (format === "pdf") {
      return generatePdf(html, uuid);
    }

    // Default: return HTML for browser preview / print-to-PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error(`[evaluation-pdf] Route handler failed for evaluation ${uuid}:`, error);
    return new NextResponse("Failed to generate the evaluation report", { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PDF generation via Playwright
// ---------------------------------------------------------------------------

async function generatePdf(html: string, uuid: string): Promise<NextResponse> {
  let page: import("playwright").Page | null = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    page.setDefaultTimeout(PAGE_CONTENT_TIMEOUT_MS);
    await page.setContent(html, { waitUntil: "networkidle", timeout: PAGE_CONTENT_TIMEOUT_MS });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="font-size:10px;color:#aaa;text-align:center;width:100%;padding:0 15mm;">
          Candidate Evaluation Report &mdash; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
    });

    return new NextResponse(pdfBuffer.toString() as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="evaluation-report-${uuid.slice(0, 12)}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error(`[evaluation-pdf] PDF generation failed for evaluation ${uuid}:`, error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  } finally {
    // Ensure page is always closed to avoid resource leaks
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

// ---------------------------------------------------------------------------
// HTML report builder (extracted to pdf-helpers.ts for testability)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


