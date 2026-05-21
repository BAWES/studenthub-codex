"use server";

import { requireCapability } from "@/modules/auth/session";
import { prisma } from "@/lib/prisma";
import { getCandidateDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// CV / document bundle export
// ---------------------------------------------------------------------------

export async function exportCandidateBundle(formData: FormData) {
  const session = await requireCapability("document.export");

  const rawIds = String(formData.get("candidateIds") ?? "");
  const requestTitle = String(formData.get("requestTitle") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();

  const candidateIds = rawIds
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!candidateIds.length) {
    return new Response("No candidate IDs provided.", { status: 400 });
  }

  // Staff: only export candidates in their scope
  let scopedIds = candidateIds;
  if (session.role === "staff") {
    const staffId = Number(session.id);
    const accessRows = await prisma.candidate_work_history.findMany({
      where: {
        staff_id: staffId,
        candidate_id: { in: candidateIds },
      },
      select: { candidate_id: true },
    });
    const accessibleIds = new Set(
      accessRows
        .map((row) => row.candidate_id)
        .filter((id): id is number => Boolean(id)),
    );
    scopedIds = candidateIds.filter((id) => accessibleIds.has(id));

    if (!scopedIds.length) {
      return new Response(
        "None of the selected candidates are in your scope.",
        { status: 403 },
      );
    }
  }

  // Fetch full details for each candidate
  const details = await Promise.all(
    scopedIds.map((id) => getCandidateDetail(id)),
  );

  const html = renderExportHtml({
    details,
    requestTitle: requestTitle || undefined,
    companyName: companyName || undefined,
    exportedBy: session.name,
    exportedAt: new Date().toISOString(),
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidate-cv-bundle-${new Date().toISOString().slice(0, 10)}.html"`,
    },
  });
}

// ---------------------------------------------------------------------------
// HTML renderer
// ---------------------------------------------------------------------------

function renderExportHtml({
  details,
  requestTitle,
  companyName,
  exportedBy,
  exportedAt,
}: {
  details: Awaited<ReturnType<typeof getCandidateDetail>>[];
  requestTitle?: string;
  companyName?: string;
  exportedBy: string;
  exportedAt: string;
}) {
  const candidates = details.filter((d) => d.candidate !== null);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Candidate CV Bundle${requestTitle ? ` — ${escapeHtml(requestTitle)}` : ""}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1a1a2e;
    background: #fff;
    max-width: 210mm;
    margin: 0 auto;
    padding: 12mm 15mm;
  }

  .cover {
    text-align: center;
    padding: 18mm 0 12mm;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 10mm;
  }
  .cover h1 { font-size: 20pt; font-weight: 700; color: #0f172a; margin-bottom: 4mm; }
  .cover .meta { font-size: 10pt; color: #64748b; }
  .cover .meta span { display: inline-block; margin: 0 2mm; }
  .cover .context { margin-top: 6mm; font-size: 11pt; color: #334155; }
  .cover .context strong { color: #0f172a; }

  .candidate-section {
    page-break-inside: avoid;
    margin-bottom: 10mm;
    padding-bottom: 8mm;
    border-bottom: 1px solid #e2e8f0;
  }
  .candidate-section:last-child { border-bottom: none; }

  .candidate-header {
    display: flex;
    align-items: flex-start;
    gap: 4mm;
    margin-bottom: 4mm;
  }
  .candidate-avatar {
    width: 14mm;
    height: 14mm;
    border-radius: 50%;
    background: #6366f1;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14pt;
    font-weight: 700;
    flex-shrink: 0;
  }
  .candidate-title h2 { font-size: 14pt; font-weight: 700; color: #0f172a; }
  .candidate-title p { font-size: 9pt; color: #64748b; margin-top: 0.5mm; }

  .candidate-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5mm 6mm;
    margin: 3mm 0;
    font-size: 9pt;
  }
  .candidate-meta dt { font-weight: 600; color: #475569; }
  .candidate-meta dd { color: #1e293b; }

  .candidate-intro {
    font-size: 10pt;
    color: #334155;
    margin: 3mm 0;
    padding: 2.5mm 3mm;
    background: #f8fafc;
    border-left: 3px solid #6366f1;
    border-radius: 2px;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #334155;
    margin: 4mm 0 2mm;
    padding-bottom: 1mm;
    border-bottom: 1px solid #f1f5f9;
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5mm;
  }
  .skill-tag {
    font-size: 8.5pt;
    padding: 1mm 3mm;
    background: #eef2ff;
    color: #4338ca;
    border-radius: 3px;
    font-weight: 500;
  }

  .row-list { font-size: 9.5pt; }
  .row-item {
    padding: 1.5mm 0;
    border-bottom: 1px dotted #f1f5f9;
  }
  .row-item:last-child { border-bottom: none; }
  .row-item strong { display: block; color: #1e293b; }
  .row-item span { color: #64748b; font-size: 8.5pt; }

  .footer {
    text-align: center;
    font-size: 8pt;
    color: #94a3b8;
    margin-top: 8mm;
    padding-top: 4mm;
    border-top: 1px solid #e2e8f0;
  }

  @media print {
    body { padding: 8mm 12mm; }
    .candidate-section { page-break-inside: avoid; }
    @page { margin: 10mm; }
  }
</style>
</head>
<body>

<div class="cover">
  <h1>Candidate CV Bundle</h1>
  ${requestTitle ? `<div class="context"><strong>Request:</strong> ${escapeHtml(requestTitle)}</div>` : ""}
  ${companyName ? `<div class="context"><strong>Company:</strong> ${escapeHtml(companyName)}</div>` : ""}
  <div class="meta">
    <span>${candidates.length} candidate${candidates.length === 1 ? "" : "s"}</span>
    <span>Exported by ${escapeHtml(exportedBy)}</span>
    <span>${formatDate(new Date(exportedAt))}</span>
  </div>
</div>

${candidates
  .map((detail) => renderCandidateSection(detail))
  .join("\n")}

<div class="footer">
  Generated by StudentHub &middot; ${formatDate(new Date(exportedAt))}
</div>

</body>
</html>`;
}

function renderCandidateSection(
  detail: NonNullable<Awaited<ReturnType<typeof getCandidateDetail>>>,
) {
  const c = detail.candidate!;
  const initials = c.candidate_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return `
<div class="candidate-section">
  <div class="candidate-header">
    <div class="candidate-avatar">${escapeHtml(initials)}</div>
    <div class="candidate-title">
      <h2>${escapeHtml(c.candidate_name)}</h2>
      ${c.candidate_objective ? `<p>${escapeHtml(c.candidate_objective)}</p>` : ""}
    </div>
  </div>

  <dl class="candidate-meta">
    <dt>Email</dt><dd>${escapeHtml(c.candidate_email)}</dd>
    <dt>Phone</dt><dd>${escapeHtml(c.candidate_phone ?? "—")}</dd>
    <dt>Country</dt><dd>${escapeHtml(c.country?.country_name_en ?? "—")}</dd>
    <dt>University</dt><dd>${escapeHtml(c.university?.university_name_en ?? "—")}</dd>
    <dt>Status</dt><dd>${c.approved === 0 ? "Needs review" : c.candidate_status === 10 ? "Active" : `Status ${c.candidate_status}`}</dd>
    <dt>Rate</dt><dd>${escapeHtml(String(detail.metrics[1]?.value ?? "—"))}</dd>
  </dl>

  ${c.candidate_intro ? `<div class="candidate-intro">${escapeHtml(c.candidate_intro)}</div>` : ""}

  ${
    detail.skills.length
      ? `
  <h3>Skills</h3>
  <div class="skill-tags">
    ${detail.skills.map((s) => `<span class="skill-tag">${escapeHtml(s.title)}</span>`).join("")}
  </div>`
      : ""
  }

  ${
    detail.experiences.length
      ? `
  <h3>Experience</h3>
  <div class="row-list">
    ${detail.experiences
      .map(
        (e) => `
    <div class="row-item">
      <strong>${escapeHtml(e.title)}</strong>
      <span>${escapeHtml(e.subtitle)}${e.meta ? ` · ${escapeHtml(e.meta)}` : ""}</span>
    </div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${
    detail.education.length
      ? `
  <h3>Education</h3>
  <div class="row-list">
    ${detail.education
      .map(
        (e) => `
    <div class="row-item">
      <strong>${escapeHtml(e.title)}</strong>
      <span>${escapeHtml(e.subtitle)}${e.meta ? ` · ${escapeHtml(e.meta)}` : ""}</span>
    </div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${
    detail.certificates.length
      ? `
  <h3>Certificates</h3>
  <div class="row-list">
    ${detail.certificates
      .map(
        (cert) => `
    <div class="row-item">
      <strong>${escapeHtml(cert.title)}</strong>
      <span>${escapeHtml(cert.subtitle)}${cert.meta ? ` · ${escapeHtml(cert.meta)}` : ""}</span>
    </div>`,
      )
      .join("")}
  </div>`
      : ""
  }
</div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
