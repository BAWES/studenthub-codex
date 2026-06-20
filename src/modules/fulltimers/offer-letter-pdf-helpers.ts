// ---------------------------------------------------------------------------
// Pure helper functions for the Offer Letter PDF
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
// Offer Letter HTML template data
// ---------------------------------------------------------------------------

export type OfferLetterData = {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  startDate: string;
  salary: string;
  workLocation: string;
  employmentType: string;
  companyName: string;
  hrName: string;
  offerDate: string;
  expiryDate: string;
  additionalTerms: string;
};

// ---------------------------------------------------------------------------
// Offer Letter HTML template builder
// ---------------------------------------------------------------------------

export function buildOfferLetterHtml(data: OfferLetterData): string {
  const {
    candidateName,
    candidateEmail,
    position,
    department,
    startDate,
    salary,
    workLocation,
    employmentType,
    companyName,
    hrName,
    offerDate,
    expiryDate,
    additionalTerms,
  } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offer Letter — ${escapeHtml(companyName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Times New Roman", Times, serif;
      color: #222;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .letterhead {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1a1a2e;
    }
    .letterhead h1 {
      font-size: 22px;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .letterhead p {
      font-size: 13px;
      color: #888;
    }
    .date-line {
      text-align: right;
      margin-bottom: 24px;
      font-size: 14px;
      color: #555;
    }
    .salutation {
      font-size: 15px;
      margin-bottom: 16px;
    }
    .body-text {
      font-size: 14px;
      margin-bottom: 20px;
      text-align: justify;
    }
    .offer-details {
      margin: 20px 0;
      border-collapse: collapse;
      width: 100%;
      font-size: 14px;
    }
    .offer-details td {
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }
    .offer-details td:first-child {
      font-weight: 600;
      color: #555;
      width: 180px;
    }
    .terms {
      font-size: 13px;
      color: #555;
      margin: 20px 0;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 4px;
      border-left: 3px solid #1a1a2e;
    }
    .closing {
      margin-top: 32px;
      font-size: 14px;
    }
    .closing .signature-block {
      margin-top: 40px;
    }
    .closing .signature-block p {
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 48px;
      text-align: center;
      font-size: 11px;
      color: #aaa;
      border-top: 1px solid #eee;
      padding-top: 12px;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="letterhead">
    <h1>${escapeHtml(companyName)}</h1>
    <p>Offer of Employment</p>
  </div>

  <div class="date-line">${escapeHtml(offerDate)}</div>

  <p class="salutation">Dear ${escapeHtml(candidateName)},</p>

  <p class="body-text">
    We are delighted to offer you the position of <strong>${escapeHtml(position)}</strong>
    in the <strong>${escapeHtml(department)}</strong> department at ${escapeHtml(companyName)}.
    We were impressed by your qualifications and believe your skills will be a valuable
    addition to our team.
  </p>

  <p class="body-text">
    The terms of your employment are outlined below:
  </p>

  <table class="offer-details">
    <tr><td>Position</td><td>${escapeHtml(position)}</td></tr>
    <tr><td>Department</td><td>${escapeHtml(department)}</td></tr>
    <tr><td>Employment Type</td><td>${escapeHtml(employmentType)}</td></tr>
    <tr><td>Start Date</td><td>${escapeHtml(startDate)}</td></tr>
    <tr><td>Salary</td><td>${escapeHtml(salary)}</td></tr>
    <tr><td>Work Location</td><td>${escapeHtml(workLocation)}</td></tr>
  </table>

  ${
    additionalTerms
      ? `<div class="terms"><strong>Additional Terms:</strong><br>${escapeHtml(additionalTerms)}</div>`
      : ""
  }

  <p class="body-text">
    This offer is valid until <strong>${escapeHtml(expiryDate)}</strong>. To accept,
    please respond by email to ${escapeHtml(hrName)} at your earliest convenience.
  </p>

  <p class="body-text">
    We look forward to welcoming you to the team and seeing the contributions you
    will make at ${escapeHtml(companyName)}.
  </p>

  <div class="closing">
    <p>Sincerely,</p>
    <div class="signature-block">
      <p><strong>${escapeHtml(hrName)}</strong></p>
      <p>Human Resources</p>
      <p>${escapeHtml(companyName)}</p>
      <p>${escapeHtml(candidateEmail)}</p>
    </div>
  </div>

  <div class="footer">
    ${escapeHtml(companyName)} — Offer Letter — Generated by StudentHub
  </div>
</body>
</html>`;
}
