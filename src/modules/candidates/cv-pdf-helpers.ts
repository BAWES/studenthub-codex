// ---------------------------------------------------------------------------
// Pure helper functions for the Candidate CV PDF
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
// CV HTML template data
// ---------------------------------------------------------------------------

export type CvPdfData = {
  candidateName: string;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateObjective: string | null;
  candidateBirthDate: string | null;
  candidateGender: string | null;
  nationality: string | null;
  address: string | null;
  educationRows: string;
  experienceRows: string;
  skillTags: string;
  languageRows: string;
};

// ---------------------------------------------------------------------------
// CV HTML template builder
// ---------------------------------------------------------------------------

export function buildCvHtml(data: CvPdfData): string {
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateObjective,
    candidateBirthDate,
    candidateGender,
    nationality,
    address,
    educationRows,
    experienceRows,
    skillTags,
    languageRows,
  } = data;

  const hasPersonalInfo =
    candidateEmail ||
    candidatePhone ||
    candidateBirthDate ||
    candidateGender ||
    nationality ||
    address;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV — ${escapeHtml(candidateName)}</title>
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
      font-size: 26px;
      color: #1a1a2e;
      border-bottom: 3px solid #1a1a2e;
      padding-bottom: 10px;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #888;
      margin-bottom: 24px;
    }
    h2 {
      font-size: 18px;
      color: #1a1a2e;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
      margin: 20px 0 12px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .info-grid dt {
      font-weight: 600;
      color: #555;
    }
    .info-grid dd {
      color: #333;
    }
    .objective {
      font-size: 14px;
      color: #555;
      margin-bottom: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 4px;
      border-left: 3px solid #1a1a2e;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
      color: #444;
    }
    .skills {
      font-size: 14px;
      margin-bottom: 16px;
    }
    .skill-tag {
      display: inline-block;
      background: #eef;
      color: #334;
      padding: 4px 10px;
      border-radius: 12px;
      margin: 3px 4px 3px 0;
      font-size: 13px;
    }
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
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(candidateName)}</h1>
  <p class="subtitle">Curriculum Vitae</p>

  ${
    hasPersonalInfo
      ? `
  <h2>Personal Information</h2>
  <dl class="info-grid">
    ${candidateEmail ? `<dt>Email</dt><dd>${escapeHtml(candidateEmail)}</dd>` : ""}
    ${candidatePhone ? `<dt>Phone</dt><dd>${escapeHtml(candidatePhone)}</dd>` : ""}
    ${candidateBirthDate ? `<dt>Date of Birth</dt><dd>${escapeHtml(candidateBirthDate)}</dd>` : ""}
    ${candidateGender ? `<dt>Gender</dt><dd>${escapeHtml(candidateGender)}</dd>` : ""}
    ${nationality ? `<dt>Nationality</dt><dd>${escapeHtml(nationality)}</dd>` : ""}
    ${address ? `<dt>Address</dt><dd>${escapeHtml(address)}</dd>` : ""}
  </dl>`
      : ""
  }

  ${
    candidateObjective
      ? `
  <h2>Objective</h2>
  <div class="objective">${escapeHtml(candidateObjective)}</div>`
      : ""
  }

  ${
    educationRows
      ? `
  <h2>Education</h2>
  <table>
    <thead>
      <tr>
        <th>Degree</th>
        <th>Institution</th>
        <th>Year</th>
      </tr>
    </thead>
    <tbody>
      ${educationRows}
    </tbody>
  </table>`
      : ""
  }

  ${
    experienceRows
      ? `
  <h2>Experience</h2>
  <table>
    <thead>
      <tr>
        <th>Position</th>
        <th>Company</th>
        <th>Period</th>
      </tr>
    </thead>
    <tbody>
      ${experienceRows}
    </tbody>
  </table>`
      : ""
  }

  ${
    skillTags
      ? `
  <h2>Skills</h2>
  <div class="skills">
    ${skillTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`)
      .join("")}
  </div>`
      : ""
  }

  ${
    languageRows
      ? `
  <h2>Languages</h2>
  <table>
    <thead>
      <tr>
        <th>Language</th>
        <th>Proficiency</th>
      </tr>
    </thead>
    <tbody>
      ${languageRows}
    </tbody>
  </table>`
      : ""
  }

  <div class="footer">
    Generated by StudentHub — Candidate CV
  </div>
</body>
</html>`;
}
