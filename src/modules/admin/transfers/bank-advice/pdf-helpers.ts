// ---------------------------------------------------------------------------
// Pure helper functions for the Bank Advice PDF
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

// ---------------------------------------------------------------------------
// Bank advice HTML template data
// ---------------------------------------------------------------------------

export type BankAdvicePdfData = {
  serialNo: number | null;
  filePath: string | null;
  createdByName: string | null;
  createdAt: string | null;
  adviceUuid: string;
};

// ---------------------------------------------------------------------------
// Bank advice HTML template builder
// ---------------------------------------------------------------------------

export function buildBankAdviceHtml(data: BankAdvicePdfData): string {
  const { serialNo, createdByName, createdAt, adviceUuid } = data;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bank Advice — #${escapeHtml(serialNo?.toString() ?? "N/A")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1f73b7;
    }
    .header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #1f73b7;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 13px;
      color: #666;
    }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .meta dt {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .meta dd {
      font-size: 13px;
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .meta dd:last-child { margin-bottom: 0; }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #999;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      background: #e8f4fd;
      color: #1f73b7;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Bank Advice</h1>
    <p>Transfer Payment Advice Note</p>
  </div>

  <div class="meta">
    <dt>Advice UUID</dt>
    <dd><code>${escapeHtml(adviceUuid)}</code></dd>
    <dt>Serial Number</dt>
    <dd>${serialNo ? `<span class="badge">#${escapeHtml(serialNo.toString())}</span>` : "—"}</dd>
    <dt>Created By</dt>
    <dd>${escapeHtml(createdByName ?? "—")}</dd>
    <dt>Date Created</dt>
    <dd>${escapeHtml(formattedDate)}</dd>
  </div>

  <p style="color: #666; font-size: 12px; margin-top: 24px;">
    This is a system-generated bank advice document. For transfer details,
    please reference the associated transfer record.
  </p>

  <div class="footer">
    <p>StudentHub — Bank Advice Document</p>
    <p>Generated on ${escapeHtml(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</p>
  </div>
</body>
</html>`;
}
