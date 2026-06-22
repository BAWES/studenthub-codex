import { NextRequest, NextResponse } from "next/server";
import {
  escapeHtml,
  validateUuid,
  calculateAverageRating,
  renderStars,
  buildReportHtml,
} from "@/modules/candidates/evaluation/pdf-helpers";
import { getEvaluationPdfData } from "@/modules/candidates/evaluation/actions";
import { generatePdf } from "@/lib/pdf-renderer";

export const dynamic = "force-dynamic";

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
        ? `${new Date(data.start_date).toLocaleDateString("en-KW")} → ${new Date(data.end_date).toLocaleDateString("en-KW")}`
        : "N/A";

    const answerRows = (data.answers ?? [])
      .map(
        (a, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${escapeHtml(a.question ?? "—")}</td>
      <td>${escapeHtml(a.answer ?? "—")}</td>
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
      return generatePdf(html, `evaluation-report-${uuid.slice(0, 12)}`, {
        footerText: "Candidate Evaluation Report",
      });
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
