// ---------------------------------------------------------------------------
// Pure helper functions for the Candidate ID Card PDF
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
  candidateId: number;
  idCardNumber: string;
  nationality: string | null;
  dateOfBirth: string | null;
  expiryDate: string | null;
  photoUrl: string | null;
  qrCodeDataUrl: string | null;
};

// ---------------------------------------------------------------------------
// ID Card HTML template builder
// ---------------------------------------------------------------------------

export function buildIdCardHtml(data: IdCardPdfData): string {
  const {
    candidateName,
    candidateId,
    idCardNumber,
    nationality,
    dateOfBirth,
    expiryDate,
    photoUrl,
    qrCodeDataUrl,
  } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ID Card — ${escapeHtml(candidateName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #333;
      line-height: 1.5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f0f0f0;
      padding: 20px;
    }
    .id-card {
      width: 340px;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #ddd;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .card-header {
      background: #1a1a2e;
      color: #fff;
      padding: 16px 20px;
      text-align: center;
    }
    .card-header h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .card-header .sub {
      font-size: 11px;
      opacity: 0.8;
      margin-top: 2px;
      letter-spacing: 1px;
    }
    .card-body {
      padding: 20px;
    }
    .photo-section {
      text-align: center;
      margin-bottom: 16px;
    }
    .photo-section img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #1a1a2e;
    }
    .photo-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: #eef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 36px;
      color: #889;
      border: 3px solid #1a1a2e;
    }
    .name {
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .id-number {
      font-size: 13px;
      text-align: center;
      color: #888;
      margin-bottom: 16px;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    .info-table {
      width: 100%;
      font-size: 13px;
    }
    .info-table tr {
      border-bottom: 1px solid #f0f0f0;
    }
    .info-table td {
      padding: 6px 4px;
    }
    .info-table td:first-child {
      color: #888;
      width: 40%;
      font-weight: 500;
    }
    .info-table td:last-child {
      color: #333;
      font-weight: 600;
    }
    .qr-section {
      text-align: center;
      padding: 12px 0 0;
      border-top: 1px solid #eee;
      margin-top: 12px;
    }
    .qr-section img {
      width: 80px;
      height: 80px;
    }
    .card-footer {
      background: #f9f9f9;
      padding: 10px 20px;
      text-align: center;
      font-size: 10px;
      color: #aaa;
      border-top: 1px solid #eee;
    }
    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      .id-card {
        box-shadow: none;
        border: 1px solid #ccc;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="id-card">
    <div class="card-header">
      <h1>StudentHub</h1>
      <div class="sub">IDENTIFICATION CARD</div>
    </div>

    <div class="card-body">
      ${
        photoUrl
          ? `<div class="photo-section"><img src="${escapeHtml(photoUrl)}" alt="Photo" /></div>`
          : `<div class="photo-section"><div class="photo-placeholder">&#9787;</div></div>`
      }

      <div class="name">${escapeHtml(candidateName)}</div>
      <div class="id-number">#${escapeHtml(idCardNumber)}</div>

      <table class="info-table">
        <tr>
          <td>Candidate ID</td>
          <td>${candidateId}</td>
        </tr>
        ${nationality ? `<tr><td>Nationality</td><td>${escapeHtml(nationality)}</td></tr>` : ""}
        ${dateOfBirth ? `<tr><td>Date of Birth</td><td>${escapeHtml(dateOfBirth)}</td></tr>` : ""}
        ${expiryDate ? `<tr><td>Expiry Date</td><td>${escapeHtml(expiryDate)}</td></tr>` : ""}
      </table>

      ${
        qrCodeDataUrl
          ? `<div class="qr-section"><img src="${escapeHtml(qrCodeDataUrl)}" alt="QR Code" /></div>`
          : ""
      }
    </div>

    <div class="card-footer">
      Generated by StudentHub &mdash; Candidate ID Card
    </div>
  </div>
</body>
</html>`;
}
