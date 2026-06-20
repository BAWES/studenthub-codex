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

/** Minimal browser interface for the cached Chromium instance */
interface BrowserHandle {
  contexts(): unknown[];
  isConnected(): boolean;
  newPage(): Promise<any>;
  close(): Promise<void>;
}

// Keep Chromium instance cached across warm invocations
let _browser: BrowserHandle | null = null;

async function getBrowser(): Promise<BrowserHandle> {
  // If we have a cached instance, verify it's still alive
  if (_browser) {
    try {
      const contexts = _browser.contexts();
      // If it has no contexts it may have crashed — re-launch
      if (contexts.length > 0 || _browser.isConnected()) {
        return _browser;
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
    if (_browser) {
      _browser.close().catch(() => {});
    }
  });

  return _browser;
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
  try {
    const { uuid } = await params;

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
    console.error("PDF route handler failed:", error);
    return new NextResponse("Failed to generate the evaluation report", { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PDF generation via Playwright
// ---------------------------------------------------------------------------

async function generatePdf(html: string, uuid: string): Promise<NextResponse> {
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
    console.error("PDF generation failed:", error);
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
