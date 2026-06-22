// ---------------------------------------------------------------------------
// Pure helper functions for the Candidate Certificate PDF
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
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// Certificate PDF template data
// ---------------------------------------------------------------------------

export type CertificatePdfData = {
  certificateUuid: string;
  certificateTitle: string | null;
  certificateIssuer: string | null;
  certificateUrl: string | null;
  candidateName: string | null;
  startDate: string | null;
  endDate: string | null;
  staffName: string | null;
};

// ---------------------------------------------------------------------------
// Certificate HTML template builder
// ---------------------------------------------------------------------------

export function buildCertificateHtml(data: CertificatePdfData): string {
  const {
    certificateTitle,
    certificateIssuer,
    candidateName,
    startDate,
    endDate,
    certificateUuid,
    staffName,
  } = data;

  const formattedStart = startDate
    ? new Date(startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "\u2014";

  const formattedEnd = endDate
    ? new Date(endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "\u2014";

  const issuerDisplay = certificateIssuer ?? "\u2014";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate — ${escapeHtml(certificateTitle ?? "Certificate")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 13px;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
    }
    .certificate-border {
      border: 3px solid #1f73b7;
      padding: 48px 40px;
      min-height: 600px;
      position: relative;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1f73b7;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 14px;
      color: #666;
      font-family: "Inter", -apple-system, sans-serif;
    }
    .divider {
      width: 120px;
      height: 2px;
      background: #eb6651;
      margin: 24px auto;
    }
    .body-text {
      text-align: center;
      font-size: 14px;
      color: #333;
      margin-bottom: 32px;
    }
    .body-text .candidate-name {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 16px 0;
    }
    .body-text .cert-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f73b7;
      margin: 8px 0;
    }
    .details {
      max-width: 400px;
      margin: 0 auto 40px;
      padding: 16px 24px;
      background: #f8f9fa;
      border-radius: 6px;
      font-family: "Inter", -apple-system, sans-serif;
    }
    .details dt {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 8px;
    }
    .details dt:first-child { margin-top: 0; }
    .details dd {
      font-size: 13px;
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #999;
      text-align: center;
      font-family: "Inter", -apple-system, sans-serif;
    }
    .footer .uuid {
      font-family: "SF Mono", "Monaco", "Courier New", monospace;
      font-size: 9px;
      color: #bbb;
    }
    .verify-note {
      text-align: center;
      font-size: 11px;
      color: #999;
      margin-top: 24px;
      font-family: "Inter", -apple-system, sans-serif;
      font-style: italic;
    }
    .issuer-block {
      display: flex;
      justify-content: space-between;
      align-items: end;
      margin-top: 48px;
      padding: 0 40px;
      font-family: "Inter", -apple-system, sans-serif;
    }
    .issuer-block .signature-line {
      text-align: center;
    }
    .issuer-block .signature-line .label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .issuer-block .signature-line .name {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="certificate-border">
    <div class="header">
      <h1>Certificate</h1>
      <p class="subtitle">StudentHub &mdash; Certificate of Completion</p>
    </div>

    <div class="divider"></div>

    <div class="body-text">
      <p>This is to certify that</p>
      <p class="candidate-name">${escapeHtml(candidateName ?? "\u2014")}</p>
      <p>has successfully completed</p>
      <p class="cert-title">${escapeHtml(certificateTitle ?? "\u2014")}</p>
    </div>

    <div class="details">
      <dt>Issuer</dt>
      <dd>${escapeHtml(issuerDisplay)}</dd>
      <dt>Start Date</dt>
      <dd>${escapeHtml(formattedStart)}</dd>
      <dt>End Date</dt>
      <dd>${escapeHtml(formattedEnd)}</dd>
    </div>

    <div class="issuer-block">
      <div class="signature-line">
        <div class="label">Issued By</div>
        <div class="name">${escapeHtml(staffName ?? "\u2014")}</div>
      </div>
      <div class="signature-line">
        <div class="label">Date Issued</div>
        <div class="name">${escapeHtml(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</div>
      </div>
    </div>

    <p class="verify-note">
      This certificate is digitally generated and can be verified at StudentHub.
    </p>

    <div class="footer">
      <p class="uuid">Ref: ${escapeHtml(certificateUuid)}</p>
      <p>StudentHub &mdash; Certificate Document</p>
    </div>
  </div>
</body>
</html>`;
}
