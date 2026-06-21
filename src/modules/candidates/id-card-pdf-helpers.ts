// ---------------------------------------------------------------------------
// Pure helper functions for the Candidate Civil ID Card PDF
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
// ID Card HTML template data
// ---------------------------------------------------------------------------

export type IdCardPdfData = {
  candidateName: string;
  candidateNameAr: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateCivilId: string | null;
  candidateCivilExpiryDate: string | null;
  candidateBirthDate: string | null;
  candidateGender: string | null;
  nationality: string | null;
  photoUrl: string | null;
};

// ---------------------------------------------------------------------------
// ID Card HTML template builder
// ---------------------------------------------------------------------------

/**
 * Build a printable HTML page for a candidate's Civil ID card.
 * The layout mimics a physical ID card: photo, civil ID number (large),
 * personal details in a clean two-column list.
 */
export function buildIdCardHtml(data: IdCardPdfData): string {
  const photoSection = data.photoUrl
    ? `
        <div class="photo">
          <img src="${escapeHtml(data.photoUrl)}" alt="Candidate photo" />
        </div>`
    : `
        <div class="photo photo-placeholder">
          <span>${getInitials(data.candidateName)}</span>
        </div>`;

  const civilIdSection = data.candidateCivilId
    ? `<div class="civil-id-number">${escapeHtml(data.candidateCivilId)}</div>`
    : `<div class="civil-id-number missing">—</div>`;

  const fields = [
    { label: "Name (EN)", value: data.candidateName },
    { label: "Name (AR)", value: data.candidateNameAr ?? "—" },
    { label: "Nationality", value: data.nationality ?? "—" },
    { label: "Gender", value: data.candidateGender ?? "—" },
    { label: "Date of Birth", value: data.candidateBirthDate ?? "—" },
    { label: "Email", value: data.candidateEmail ?? "—" },
    { label: "Phone", value: data.candidatePhone ?? "—" },
    { label: "Civil ID Expiry", value: data.candidateCivilExpiryDate ?? "—" },
  ];

  const fieldRows = fields
    .map(
      (f) => `
          <tr>
            <td class="label">${escapeHtml(f.label)}</td>
            <td class="value">${escapeHtml(f.value)}</td>
          </tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Civil ID Card — ${escapeHtml(data.candidateName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a2e;
      background: #f5f5f7;
      padding: 40px 30px;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .card-header {
      background: linear-gradient(135deg, #1f73b7 0%, #155a94 100%);
      color: #fff;
      padding: 24px 28px 20px;
      text-align: center;
    }
    .card-header h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .card-header .subtitle {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 4px;
    }
    .card-body {
      padding: 28px;
    }
    .top-row {
      display: flex;
      gap: 24px;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .photo {
      width: 120px;
      height: 150px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #e2e8f0;
    }
    .photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder span {
      font-size: 36px;
      font-weight: 700;
      color: #94a3b8;
    }
    .civil-id-section {
      flex: 1;
    }
    .civil-id-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .civil-id-number {
      font-size: 28px;
      font-weight: 700;
      font-family: "SF Mono", "Fira Code", "Courier New", monospace;
      color: #1f73b7;
      letter-spacing: 2px;
      padding: 8px 12px;
      background: #f0f7ff;
      border-radius: 8px;
      display: inline-block;
    }
    .civil-id-number.missing {
      color: #94a3b8;
      background: #f1f5f9;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table tr {
      border-bottom: 1px solid #f1f5f9;
    }
    .details-table tr:last-child {
      border-bottom: none;
    }
    .details-table td {
      padding: 10px 8px;
      font-size: 13px;
      vertical-align: top;
    }
    .details-table .label {
      width: 130px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .details-table .value {
      color: #1a1a2e;
    }
    .footer {
      text-align: center;
      padding: 16px 28px 20px;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #1f73b7;
      text-decoration: none;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .card { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <h1>Civil ID Card</h1>
      <div class="subtitle">StudentHub &mdash; Candidate Identification</div>
    </div>
    <div class="card-body">
      <div class="top-row">
        ${photoSection}
        <div class="civil-id-section">
          <div class="civil-id-label">Civil ID Number</div>
          ${civilIdSection}
        </div>
      </div>
      <table class="details-table">
        <tbody>
          ${fieldRows}
        </tbody>
      </table>
    </div>
    <div class="footer">
      Generated by StudentHub &mdash; ${new Date().toISOString().split("T")[0]}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Extract initials from a name for the photo placeholder.
 */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
