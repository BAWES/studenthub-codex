import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Module under test
// ---------------------------------------------------------------------------

import {
  generatePdf,
  __setTestPage,
  __resetForTesting,
} from "./pdf-renderer";

// ---------------------------------------------------------------------------
// Mock page — injected via __setTestPage so generatePdf never calls
// getBrowser() (which uses new Function and can't run in vitest).
// ---------------------------------------------------------------------------

const mockPage = {
  setContent: vi.fn(),
  pdf: vi.fn(),
  close: vi.fn(),
  setDefaultTimeout: vi.fn(),
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  __resetForTesting();
  __setTestPage(mockPage);

  // Default mock setup
  mockPage.pdf.mockResolvedValue(Buffer.from("%PDF-test-data"));
  mockPage.close.mockResolvedValue(undefined);
  mockPage.setContent.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Tests: generatePdf
// ---------------------------------------------------------------------------

describe("generatePdf", () => {
  it("returns a NextResponse with PDF content type", async () => {
    const response = await generatePdf("<html><body>Test</body></html>", "cv-123");

    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      'filename="cv-123.pdf"',
    );
  });

  it("sets HTML content on the page before generating PDF", async () => {
    await generatePdf("<html><body>Hello</body></html>", "test");

    expect(mockPage.setContent).toHaveBeenCalledWith(
      "<html><body>Hello</body></html>",
      { waitUntil: "networkidle" },
    );
    expect(mockPage.pdf).toHaveBeenCalled();
  });

  it("accepts custom PDF options (margins, footer)", async () => {
    await generatePdf("<html/>", "report", {
      margins: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      footerText: "Custom Report",
    });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "A4",
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      }),
    );

    const callArgs = mockPage.pdf.mock.calls[0][0];
    expect(callArgs.footerTemplate).toContain("Custom Report");
  });

  it("uses default margins when options not provided", async () => {
    await generatePdf("<html/>", "default");

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      }),
    );
  });

  it("uses default footer when footerText not provided", async () => {
    await generatePdf("<html/>", "default");

    const callArgs = mockPage.pdf.mock.calls[0][0];
    expect(callArgs.footerTemplate).toContain("Page");
    expect(callArgs.footerTemplate).toContain("pageNumber");
    expect(callArgs.footerTemplate).toContain("totalPages");
  });

  it("closes the page after generating the PDF", async () => {
    await generatePdf("<html/>", "test");
    expect(mockPage.close).toHaveBeenCalled();
  });

  it("returns 500 response when PDF generation fails", async () => {
    mockPage.pdf.mockRejectedValue(new Error("PDF rendering engine crashed"));

    const response = await generatePdf("<html/>", "error-test");

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain("Failed to generate PDF");
  });

  it("closes the page even when PDF fails", async () => {
    mockPage.pdf.mockRejectedValue(new Error("Crash"));

    await generatePdf("<html/>", "cleanup");

    expect(mockPage.close).toHaveBeenCalled();
  });

  it("uses the correct Content-Disposition filename", async () => {
    const response = await generatePdf("<html/>", "my-custom-document");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="my-custom-document.pdf"',
    );
  });

  it("sets Content-Length header", async () => {
    const testBuffer = Buffer.from("test-pdf-content-here");
    mockPage.pdf.mockResolvedValue(testBuffer);

    const response = await generatePdf("<html/>", "test");

    expect(Number(response.headers.get("Content-Length"))).toBe(
      testBuffer.length,
    );
  });
});
