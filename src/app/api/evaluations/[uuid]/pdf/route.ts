import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { escapeHtml, validateUuid, calculateAverageRating, renderStars } from "@/modules/candidates/evaluation/pdf-helpers";

export const dynamic = "force-dynamic";

// Keep Chromium instance cached across warm invocations
let _chromium: Awaited<ReturnType<typeof import("playwright").chromium.launch>> | null = null;

async function getBrowser() {
  if (_chromium) return _chromium;
  const { chromium } = await import("playwright");
  _chromium = await chromium.launch({ headless: true });
  return _chromium;
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

  const valid = validateUuid(uuid);
  if (!valid.valid) {
    return new NextResponse(valid.error ?? "Missing evaluation UUID", { status: 400 });
  }

  const evaluation = await prisma.candidate_evaluation.findUnique({
    where: { can_eval_uuid: uuid },
  });

  if (!evaluation) {
    return new NextResponse("Evaluation not found", { status: 404 });
  }

  // Fetch candidate and staff names
  const [candidate, staff] = await Promise.all([
    evaluation.candidate_id
      ? prisma.candidate.findUnique({
          where: { candidate_id: evaluation.candidate_id },
          select: { candidate_name: true, candidate_email: true },
        })
      : null,
    evaluation.staff_id
      ? prisma.staff.findUnique({
          where: { staff_id: evaluation.staff_id },
          select: { staff_name: true },
        })
      : null,
  ]);

  // Fetch answers via raw SQL (candidate_evaluation_answer has no PK, @@ignore'd)
  const answers = await prisma.$queryRawUnsafe<
    Array<{ ceq_uuid: string | null; question: string | null; answer: string | null; rating: number | null }>
  >(
    `SELECT ceq_uuid, question, answer, rating
     FROM candidate_evaluation_answer
     WHERE can_eval_uuid = ?`,
    uuid,
  );

  const candidateName = candidate?.candidate_name ?? "Unknown Candidate";
  const candidateEmail = candidate?.candidate_email ?? "";
  const staffName = staff?.staff_name ?? "N/A";
  const evalDate = evaluation.created_at
    ? new Date(evaluation.created_at).toLocaleDateString("en-KW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";
  const period =
    evaluation.start_date && evaluation.end_date
      ? `${new Date(evaluation.start_date).toLocaleDateString("en-KW")} \u2192 ${new Date(evaluation.end_date).toLocaleDateString("en-KW")}`
      : "N/A";

  const answerRows = answers
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

  const avgRating = calculateAverageRating(answers);

  const html = buildReportHtml({
    candidateName,
    candidateEmail,
    staffName,
    period,
    evalDate,
    uuid,
    answerRows,
    answersCount: answers.length,
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
}

// ---------------------------------------------------------------------------
// PDF generation via Playwright
// ---------------------------------------------------------------------------

async function generatePdf(html: string, uuid: string): Promise<NextResponse> {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
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

    await page.close();

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
  }
}

// ---------------------------------------------------------------------------
// HTML report builder
// ---------------------------------------------------------------------------

type ReportData = {
  candidateName: string;
  candidateEmail: string;
  staffName: string;
  period: string;
  evalDate: string;
  uuid: string;
  answerRows: string;
  answersCount: number;
  avgRating: string;
};

function buildReportHtml(data: ReportData): string {
  const { candidateName, candidateEmail, staffName, period, evalDate, uuid, answerRows, answersCount, avgRating } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Candidate Evaluation Report \u2014 ${escapeHtml(candidateName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      font-size: 22px;
      color: #1a1a2e;
      border-bottom: 3px solid #1a1a2e;
      padding-bottom: 10px;
      margin-bottom: 24px;
    }
    .header-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
      margin-bottom: 28px;
      font-size: 14px;
    }
    .header-info dt {
      font-weight: 600;
      color: #555;
    }
    .header-info dd {
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px 12px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
      color: #444;
    }
    td.num { text-align: center; width: 40px; color: #888; }
    td.rating { text-align: center; min-width: 80px; color: #f5a623; letter-spacing: 2px; }
    .summary {
      display: flex;
      gap: 24px;
      padding: 16px;
      background: #fafafa;
      border-radius: 6px;
      border: 1px solid #eee;
      font-size: 14px;
    }
    .summary-item { flex: 1; text-align: center; }
    .summary-item .label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .summary-item .value { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-top: 4px; }
    .footer {
      margin-top: 32px;
      text-align: center;
      font-size: 12px;
      color: #aaa;
      border-top: 1px solid #eee;
      padding-top: 16px;
    }
    @media print {
      body { padding: 20px; }
      .footer { position: fixed; bottom: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <h1>Candidate Evaluation Report</h1>

  <dl class="header-info">
    <dt>Candidate</dt><dd>${escapeHtml(candidateName)}</dd>
    <dt>Email</dt><dd>${escapeHtml(candidateEmail) || "\u2014"}</dd>
    <dt>Evaluated By</dt><dd>${escapeHtml(staffName)}</dd>
    <dt>Evaluation Period</dt><dd>${period}</dd>
    <dt>Date</dt><dd>${evalDate}</dd>
    <dt>Evaluation ID</dt><dd>${escapeHtml(uuid)}</dd>
  </dl>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Question</th>
        <th>Answer</th>
        <th>Rating</th>
      </tr>
    </thead>
    <tbody>
      ${answerRows}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-item">
      <div class="label">Questions</div>
      <div class="value">${answersCount}</div>
    </div>
    <div class="summary-item">
      <div class="label">Average Rating</div>
      <div class="value">${avgRating}</div>
    </div>
    <div class="summary-item">
      <div class="label">Report Date</div>
      <div class="value" style="font-size:14px; margin-top:8px;">${evalDate}</div>
    </div>
  </div>

  <div class="footer">
    Generated by StudentHub \u2014 Candidate Evaluation Report
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


