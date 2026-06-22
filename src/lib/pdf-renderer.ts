// ---------------------------------------------------------------------------
// Shared PDF renderer — Playwright-based HTML-to-PDF
//
// Provides a cached Chromium browser instance and a unified generatePdf()
// function that all PDF route handlers can use, eliminating 5× duplication
// of identical browser management and PDF generation code.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfMargins {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

export interface PdfOptions {
  /** Page margins (default: 20mm top/bottom, 15mm left/right) */
  margins?: PdfMargins;
  /** Footer text (e.g. "Candidate CV", "Offer Letter") */
  footerText?: string;
}

// ---------------------------------------------------------------------------
// Browser management — cached Chromium instance with auto-reconnect
// ---------------------------------------------------------------------------

interface _BrowserHandle {
  contexts(): unknown[];
  isConnected(): boolean;
  newPage(): Promise<unknown>;
  close(): Promise<void>;
}

let _browser: _BrowserHandle | null = null;

// Test seam — when set, generatePdf uses this page directly instead of
// launching a browser. This lets us test all PDF generation logic without
// needing the Playwright dynamic import (which uses new Function and cannot
// be mocked by vitest).
let _testPage: unknown | null = null;

/**
 * Reset the cached browser instance and test page. Exposed for testing.
 */
export function __resetForTesting(): void {
  _browser = null;
  _testPage = null;
}

/**
 * Inject a page object for testing. When set, generatePdf() uses this page
 * instead of launching Playwright, so tests don't need the dynamic import.
 */
export function __setTestPage(page: unknown): void {
  _testPage = page;
}

export async function getBrowser(): Promise<_BrowserHandle> {
  if (_browser) {
    try {
      const contexts = _browser.contexts();
      if (contexts.length > 0 || _browser.isConnected()) {
        return _browser;
      }
    } catch {
      // Browser is dead — fall through to re-launch
    }
  }

  // Dynamic import hidden from webpack — prevents build-time bundling of
  // playwright-core's optional chromium-bidi dependency
  const playwrightModule = await new Function('return import("playwright")')();
  const { chromium } = playwrightModule as {
    chromium: {
      launch: (opts: { headless: boolean }) => Promise<_BrowserHandle>;
    };
  };
  _browser = await chromium.launch({ headless: true });

  // Clean up on process exit to avoid orphaned Chromium processes
  process.once("beforeExit", () => {
    _browser?.close().catch(() => {});
  });

  return _browser;
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

const DEFAULT_MARGINS: PdfMargins = {
  top: "20mm",
  bottom: "20mm",
  left: "15mm",
  right: "15mm",
};

/**
 * Render an HTML string to a downloadable PDF using Playwright's headless
 * Chromium, returned as a NextResponse with appropriate Content-Type and
 * Content-Disposition headers.
 *
 * @param html      Fully-rendered printable HTML document
 * @param filename  Base filename (without .pdf extension) for the download
 * @param options   Optional margins and footer text overrides
 */
export async function generatePdf(
  html: string,
  filename: string,
  options?: PdfOptions,
): Promise<NextResponse> {
  const margins = options?.margins ?? DEFAULT_MARGINS;
  const footerText = options?.footerText ?? "Document";
  const pageMarginSide = margins.left; // Use same value for footer padding

  let page: unknown | null = null;
  try {
    page = _testPage ?? await (await getBrowser()).newPage();

    await (page as { setContent: (html: string, opts: unknown) => Promise<void> }).setContent(
      html,
      { waitUntil: "networkidle" },
    );

    const pdfBuffer = await (page as { pdf: (opts: unknown) => Promise<Buffer> }).pdf({
      format: "A4",
      margin: margins,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="font-size:10px;color:#aaa;text-align:center;width:100%;padding:0 ${pageMarginSide};">
          ${escapeFooterText(footerText)} &mdash; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error(`PDF generation failed for "${filename}":`, error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  } finally {
    if (page) {
      await (page as { close: () => Promise<void> }).close().catch(() => {});
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal HTML-escape for footer text safe for inline HTML interpolation.
 */
function escapeFooterText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
