import { describe, it, expect } from "vitest";
import { escapeHtml, buildCertificateHtml } from "./pdf-helpers";

describe("escapeHtml", () => {
  it("escapes & < > \" ' characters", () => {
    expect(escapeHtml('hello & <world> "test" \'yep\'')).toBe(
      "hello &amp; &lt;world&gt; &quot;test&quot; &#039;yep&#039;",
    );
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("safe string 123")).toBe("safe string 123");
  });
});

describe("buildCertificateHtml", () => {
  const baseData = {
    certificateUuid: "550e8400-e29b-41d4-a716-446655440000",
    certificateTitle: "Advanced Web Development",
    certificateIssuer: "StudentHub Academy",
    certificateUrl: null,
    candidateName: "John Doe",
    startDate: "2026-01-15T00:00:00.000Z",
    endDate: "2026-06-15T00:00:00.000Z",
    staffName: "Jane Smith",
  };

  it("includes the certificate title in the output", () => {
    const html = buildCertificateHtml(baseData);
    expect(html).toContain("Advanced Web Development");
  });

  it("includes the candidate name prominently", () => {
    const html = buildCertificateHtml(baseData);
    expect(html).toContain("John Doe");
  });

  it("includes issuer information", () => {
    const html = buildCertificateHtml(baseData);
    expect(html).toContain("StudentHub Academy");
  });

  it("includes staff name who issued the certificate", () => {
    const html = buildCertificateHtml(baseData);
    expect(html).toContain("Jane Smith");
  });

  it("handles null certificate title gracefully", () => {
    const html = buildCertificateHtml({ ...baseData, certificateTitle: null });
    expect(html).toContain("Certificate");
  });

  it("handles null candidate name gracefully", () => {
    const html = buildCertificateHtml({ ...baseData, candidateName: null });
    expect(html).toContain("\u2014");
  });

  it("handles null start/end dates gracefully", () => {
    const html = buildCertificateHtml({ ...baseData, startDate: null, endDate: null });
    expect(html).toContain("\u2014");
  });

  it("includes the certificate UUID reference", () => {
    const html = buildCertificateHtml(baseData);
    expect(html).toContain(baseData.certificateUuid);
  });

  it("renders a complete HTML document", () => {
    const html = buildCertificateHtml(baseData);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("renders 'Certificate of Completion' heading", () => {
    const html = buildCertificateHtml(baseData);
    expect(html).toContain("Certificate of Completion");
  });

  it("escapes HTML in user-provided fields", () => {
    const html = buildCertificateHtml({
      ...baseData,
      candidateName: "<script>alert('xss')</script>",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
