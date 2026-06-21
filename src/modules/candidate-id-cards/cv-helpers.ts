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
// CV data types
// ---------------------------------------------------------------------------

export type CvEducation = {
  university: string;
  degree: string | null;
  major: string | null;
  graduationYear: number | null;
};

export type CvExperience = {
  role: string;
  employer: string | null;
  startYear: number | null;
  endYear: number | null;
};

export type CvCertificate = {
  title: string;
  issuer: string | null;
};

export type CvSkill = {
  skill: string;
};

export type CvLanguage = {
  language: string;
  proficiency: string;
};

export type CvLink = {
  title: string;
  url: string;
};

export type CvPdfData = {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  objective: string | null;
  intro: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  civilId: string | null;
  education: CvEducation[];
  experience: CvExperience[];
  certificates: CvCertificate[];
  skills: CvSkill[];
  languages: CvLanguage[];
  links: CvLink[];
};

// ---------------------------------------------------------------------------
// CV HTML template builder
// ---------------------------------------------------------------------------

export function buildCvHtml(data: CvPdfData): string {
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    objective,
    intro,
    nationality,
    dateOfBirth,
    civilId,
    education,
    experience,
    certificates,
    skills,
    languages,
    links,
  } = data;

  const hasContact = candidateEmail || candidatePhone;
  const hasPersonalDetails = nationality || dateOfBirth || civilId;
  const hasSummary = objective || intro;

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
      line-height: 1.5;
      font-size: 11px;
      padding: 30px 40px;
    }
    .header {
      border-bottom: 3px solid #1a1a2e;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .header .contact-line {
      font-size: 11px;
      color: #666;
    }
    .header .contact-line span {
      margin-right: 14px;
    }
    .section {
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #1a1a2e;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .summary-text {
      font-size: 11px;
      color: #555;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .entry {
      margin-bottom: 8px;
    }
    .entry-title {
      font-weight: 600;
      font-size: 11px;
      color: #222;
    }
    .entry-subtitle {
      font-size: 10px;
      color: #777;
    }
    .entry-dates {
      font-size: 10px;
      color: #999;
    }
    .two-col {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
    }
    .two-col .item {
      width: calc(50% - 8px);
      font-size: 10px;
      color: #555;
      padding: 2px 0;
    }
    .personal-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 24px;
    }
    .personal-grid .item {
      font-size: 10px;
      color: #555;
    }
    .personal-grid .item strong {
      color: #333;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
    }
    .link-item {
      font-size: 10px;
    }
    .link-item a {
      color: #1a1a2e;
      text-decoration: none;
    }
    .footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 9px;
      color: #aaa;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(candidateName)}</h1>
    ${hasContact ? `<div class="contact-line">${candidateEmail ? `<span>${escapeHtml(candidateEmail)}</span>` : ""}${candidatePhone ? `<span>${escapeHtml(candidatePhone)}</span>` : ""}</div>` : ""}
  </div>

  ${hasSummary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    ${objective ? `<div class="summary-text">${escapeHtml(objective)}</div>` : ""}
    ${intro ? `<div class="summary-text" style="margin-top: 6px;">${escapeHtml(intro)}</div>` : ""}
  </div>` : ""}

  ${hasPersonalDetails ? `
  <div class="section">
    <div class="section-title">Personal Details</div>
    <div class="personal-grid">
      ${nationality ? `<div class="item"><strong>Nationality:</strong> ${escapeHtml(nationality)}</div>` : ""}
      ${dateOfBirth ? `<div class="item"><strong>Date of Birth:</strong> ${escapeHtml(dateOfBirth)}</div>` : ""}
      ${civilId ? `<div class="item"><strong>Civil ID:</strong> ${escapeHtml(civilId)}</div>` : ""}
    </div>
  </div>` : ""}

  ${experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${experience.map((exp) => `
    <div class="entry">
      <div class="detail-row">
        <div>
          <div class="entry-title">${escapeHtml(exp.role)}</div>
          ${exp.employer ? `<div class="entry-subtitle">${escapeHtml(exp.employer)}</div>` : ""}
        </div>
        ${exp.startYear ? `<div class="entry-dates">${exp.startYear}${exp.endYear ? ` — ${exp.endYear}` : " — Present"}</div>` : ""}
      </div>
    </div>`).join("")}
  </div>` : ""}

  ${education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${education.map((edu) => `
    <div class="entry">
      <div class="detail-row">
        <div>
          <div class="entry-title">${escapeHtml(edu.university)}</div>
          ${edu.degree || edu.major ? `<div class="entry-subtitle">${edu.degree ? escapeHtml(edu.degree) : ""}${edu.degree && edu.major ? " — " : ""}${edu.major ? escapeHtml(edu.major) : ""}</div>` : ""}
        </div>
        ${edu.graduationYear ? `<div class="entry-dates">${edu.graduationYear}</div>` : ""}
      </div>
    </div>`).join("")}
  </div>` : ""}

  ${skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="two-col">
      ${skills.map((sk) => `<div class="item">${escapeHtml(sk.skill)}</div>`).join("")}
    </div>
  </div>` : ""}

  ${languages.length > 0 ? `
  <div class="section">
    <div class="section-title">Languages</div>
    <div class="two-col">
      ${languages.map((lang) => `<div class="item"><strong>${escapeHtml(lang.language)}:</strong> ${escapeHtml(lang.proficiency)}</div>`).join("")}
    </div>
  </div>` : ""}

  ${certificates.length > 0 ? `
  <div class="section">
    <div class="section-title">Certificates</div>
    ${certificates.map((cert) => `
    <div class="entry">
      <div class="entry-title">${escapeHtml(cert.title)}</div>
      ${cert.issuer ? `<div class="entry-subtitle">${escapeHtml(cert.issuer)}</div>` : ""}
    </div>`).join("")}
  </div>` : ""}

  ${links.length > 0 ? `
  <div class="section">
    <div class="section-title">Links</div>
    ${links.map((link) => `<div class="link-item"><a href="${escapeHtml(link.url)}">${escapeHtml(link.title)}</a></div>`).join("")}
  </div>` : ""}

  <div class="footer">
    Generated by StudentHub — Candidate CV
  </div>
</body>
</html>`;
}
