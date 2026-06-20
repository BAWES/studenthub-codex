// ---------------------------------------------------------------------------
// Pure helper functions for the Candidate Evaluation PDF report
// Extracted for testability — shared between route.ts and unit tests
// ---------------------------------------------------------------------------

/**
 * HTML-escape a string for safe interpolation into an HTML template.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validate a candidate evaluation UUID.
 */
export function validateUuid(uuid: unknown): { valid: boolean; error?: string } {
  if (!uuid || typeof uuid !== "string" || uuid.length === 0) {
    return { valid: false, error: "Missing evaluation UUID" };
  }
  return { valid: true };
}

/**
 * Calculate the average rating from an array of answer ratings.
 * Null ratings are treated as zero.
 */
export function calculateAverageRating(
  answers: Array<{ rating: number | null }>,
): string {
  if (answers.length === 0) return "\u2014";
  const sum = answers.reduce((s, a) => s + (a.rating ?? 0), 0);
  return (sum / answers.length).toFixed(1);
}

/**
 * Render a numeric rating (1-5) as star characters.
 * Clamps to 1-5 range; null returns an em-dash.
 */
export function renderStars(rating: number | null): string {
  if (rating == null) return "\u2014";
  return "\u2605".repeat(Math.min(Math.max(rating, 1), 5));
}

// ---------------------------------------------------------------------------
// Report HTML template builder
// ---------------------------------------------------------------------------

export type ReportData = {
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

export function buildReportHtml(data: ReportData): string {
  const {
    candidateName,
    candidateEmail,
    staffName,
    period,
    evalDate,
    uuid,
    answerRows,
    answersCount,
    avgRating,
  } = data;

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
