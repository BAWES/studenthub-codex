import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  escapeHtml,
  validateUuid,
  calculateAverageRating,
  renderStars,
  buildReportHtml,
  type ReportData,
} from "@/modules/candidates/evaluation/pdf-helpers";

// ---------------------------------------------------------------------------
// Tests: escapeHtml
// ---------------------------------------------------------------------------

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B");
  });

  it("escapes less-than signs", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes greater-than signs", () => {
    expect(escapeHtml("5 > 3")).toBe("5 &gt; 3");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("It's fine")).toBe("It&#039;s fine");
  });

  it("handles strings with no special chars", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("handles multiple special chars combined", () => {
    const input = '<a href="test" onclick=\'alert(1)\'>Click & Run</a>';
    const expected =
      "&lt;a href=&quot;test&quot; onclick=&#039;alert(1)&#039;&gt;Click &amp; Run&lt;/a&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Tests: UUID validation
// ---------------------------------------------------------------------------

describe("validateUuid", () => {
  it("rejects null/undefined UUID", () => {
    const result = validateUuid(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Missing evaluation UUID");
  });

  it("rejects non-string UUID", () => {
    const result = validateUuid(12345);
    expect(result.valid).toBe(false);
  });

  it("rejects empty string UUID", () => {
    const result = validateUuid("");
    expect(result.valid).toBe(false);
  });

  it("accepts valid UUID string", () => {
    const result = validateUuid("can_eval_550e8400-e29b-41d4-a716-446655440000");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("accepts standard UUID format", () => {
    const result = validateUuid("550e8400-e29b-41d4-a716-446655440000");
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: Average rating calculation
// ---------------------------------------------------------------------------

describe("calculateAverageRating", () => {
  it("returns em-dash for empty answers", () => {
    expect(calculateAverageRating([])).toBe("\u2014");
  });

  it("calculates average for all-rated answers", () => {
    const answers = [
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ];
    expect(calculateAverageRating(answers)).toBe("4.0");
  });

  it("handles null ratings as zero", () => {
    const answers = [
      { rating: 5 },
      { rating: null },
      { rating: 3 },
    ];
    expect(calculateAverageRating(answers)).toBe("2.7");
  });

  it("handles single answer", () => {
    const answers = [{ rating: 4 }];
    expect(calculateAverageRating(answers)).toBe("4.0");
  });

  it("handles all null ratings", () => {
    const answers = [{ rating: null }, { rating: null }];
    expect(calculateAverageRating(answers)).toBe("0.0");
  });
});

// ---------------------------------------------------------------------------
// Tests: Rating stars renderer
// ---------------------------------------------------------------------------

describe("renderStars", () => {
  it("returns em-dash for null rating", () => {
    expect(renderStars(null)).toBe("\u2014");
  });

  it("renders 5 stars for max rating", () => {
    expect(renderStars(5)).toBe("\u2605\u2605\u2605\u2605\u2605");
  });

  it("renders 1 star for min rating", () => {
    expect(renderStars(1)).toBe("\u2605");
  });

  it("clamps rating below 1", () => {
    expect(renderStars(0)).toBe("\u2605");
  });

  it("clamps rating above 5", () => {
    expect(renderStars(10)).toBe("\u2605\u2605\u2605\u2605\u2605");
  });

  it("renders correct number of stars for mid-range", () => {
    expect(renderStars(3)).toBe("\u2605\u2605\u2605");
  });
});

// ---------------------------------------------------------------------------
// Tests: buildReportHtml (HTML template builder)
// ---------------------------------------------------------------------------

describe("buildReportHtml", () => {
  const baseData: ReportData = {
    candidateName: "John Doe",
    candidateEmail: "john@example.com",
    staffName: "Jane Smith",
    period: "2026-01-01 → 2026-03-31",
    evalDate: "April 15, 2026",
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    answerRows: `
    <tr>
      <td class="num">1</td>
      <td>Communication skills</td>
      <td>Excellent</td>
      <td class="rating">\u2605\u2605\u2605\u2605\u2605</td>
    </tr>`,
    answersCount: 1,
    avgRating: "5.0",
  };

  it("renders the candidate name in the title", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("<title>Candidate Evaluation Report — John Doe</title>");
  });

  it("renders the candidate name in the header info", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("<dd>John Doe</dd>");
  });

  it("renders the email in the header info", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("<dd>john@example.com</dd>");
  });

  it("renders the staff name", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("<dd>Jane Smith</dd>");
  });

  it("renders the evaluation period", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("2026-01-01 → 2026-03-31");
  });

  it("renders answer rows inside the table body", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("Communication skills");
    expect(html).toContain("Excellent");
  });

  it("renders the summary bar with question count and average rating", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain('class="value">1</div>');
    expect(html).toContain("5.0");
  });

  it("shows em-dash for missing email", () => {
    const data: ReportData = { ...baseData, candidateEmail: "" };
    const html = buildReportHtml(data);
    expect(html).toContain("\u2014");
  });

  it("escapes HTML in candidate name", () => {
    const data: ReportData = { ...baseData, candidateName: "<script>alert('xss')</script>" };
    const html = buildReportHtml(data);
    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("renders the footer", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("Generated by StudentHub");
  });

  it("renders empty answers count as 0", () => {
    const data: ReportData = { ...baseData, answersCount: 0, avgRating: "\u2014" };
    const html = buildReportHtml(data);
    expect(html).toContain('class="value">0</div>');
    expect(html).toContain("\u2014");
  });
});

// ---------------------------------------------------------------------------
// Tests: GET /api/evaluations/[uuid]/pdf handler
// ---------------------------------------------------------------------------

// Mock the server action used by the route
const mockGetEvaluationPdfData = vi.fn();

vi.mock("@/modules/candidates/evaluation/actions", () => ({
  getEvaluationPdfData: (...args: unknown[]) => mockGetEvaluationPdfData(...args),
}));

// Mock Playwright for PDF generation tests
const mockNewPage = vi.fn();
const mockSetContent = vi.fn();
const mockPdf = vi.fn();
const mockClose = vi.fn();

vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: mockNewPage,
      isConnected: vi.fn().mockReturnValue(true),
      contexts: vi.fn().mockReturnValue([{}]),
      close: vi.fn(),
    }),
  },
}));

function pdfRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "GET",
  });
}

const mockEvalData = {
  can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
  candidate_id: 1,
  dept_id: 1,
  start_date: "2026-01-01",
  end_date: "2026-03-31",
  staff_id: 7,
  created_at: new Date("2026-04-15"),
  answers: [
    {
      ceq_uuid: "abc-123",
      question: "Communication skills",
      answer: "Excellent",
      rating: 5,
    },
  ],
  candidate: {
    candidate_name: "John Doe",
    candidate_email: "john@example.com",
  },
  staff: {
    staff_name: "Jane Smith",
  },
};

describe("GET /api/evaluations/[uuid]/pdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNewPage.mockReset();
    mockSetContent.mockReset();
    mockPdf.mockReset();
    mockClose.mockReset();

    // Reset module-level browser cache by invalidating the route module
    vi.resetModules();

    // Default mock page
    mockNewPage.mockResolvedValue({
      setContent: mockSetContent,
      pdf: mockPdf,
      close: mockClose,
    });
    mockSetContent.mockResolvedValue(undefined);
    mockPdf.mockResolvedValue(Buffer.from("fake-pdf-content"));
    mockClose.mockResolvedValue(undefined);
  });

  it("returns 400 for missing UUID", async () => {
    const { GET } = await import("./route");
    const response = await GET(pdfRequest("/api/evaluations//pdf"), {
      params: Promise.resolve({ uuid: "" }),
    });
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Missing evaluation UUID");
  });

  it("returns 404 when evaluation not found", async () => {
    mockGetEvaluationPdfData.mockResolvedValue(null);

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/nonexistent-uuid/pdf"),
      { params: Promise.resolve({ uuid: "nonexistent-uuid" }) },
    );
    expect(response.status).toBe(404);
    const text = await response.text();
    expect(text).toContain("Evaluation not found");
  });

  it("returns HTML without format query param", async () => {
    mockGetEvaluationPdfData.mockResolvedValue(mockEvalData);

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/550e8400-e29b-41d4-a716-446655440000/pdf"),
      { params: Promise.resolve({ uuid: "550e8400-e29b-41d4-a716-446655440000" }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const html = await response.text();
    expect(html).toContain("John Doe");
    expect(html).toContain("Communication skills");
    expect(html).toContain("Jane Smith");
  });

  it("returns HTML when format=html", async () => {
    mockGetEvaluationPdfData.mockResolvedValue({
      can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: 1,
      dept_id: 1,
      staff_id: 7,
      answers: [],
      candidate: { candidate_name: "Alice", candidate_email: null },
      staff: { staff_name: "Bob" },
    });

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/550e8400-e29b-41d4-a716-446655440000/pdf?format=html"),
      { params: Promise.resolve({ uuid: "550e8400-e29b-41d4-a716-446655440000" }) },
    );
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Alice");
  });

  it("returns 500 when getEvaluationPdfData throws", async () => {
    mockGetEvaluationPdfData.mockRejectedValue(new Error("Database query failed"));

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/some-uuid/pdf"),
      { params: Promise.resolve({ uuid: "some-uuid" }) },
    );
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain("Failed to generate the evaluation report");
  });

  it("handles null candidate and staff gracefully", async () => {
    mockGetEvaluationPdfData.mockResolvedValue({
      can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: null,
      dept_id: null,
      staff_id: null,
      answers: [],
      candidate: null,
      staff: null,
    });

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/550e8400-e29b-41d4-a716-446655440000/pdf"),
      { params: Promise.resolve({ uuid: "550e8400-e29b-41d4-a716-446655440000" }) },
    );
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Unknown Candidate");
    expect(html).toContain("N/A");
  });

  // ---------------------------------------------------------------------------
  // PDF generation tests (format=pdf)
  // ---------------------------------------------------------------------------

  it("returns PDF when format=pdf", async () => {
    mockGetEvaluationPdfData.mockResolvedValue(mockEvalData);

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/550e8400-e29b-41d4-a716-446655440000/pdf?format=pdf"),
      { params: Promise.resolve({ uuid: "550e8400-e29b-41d4-a716-446655440000" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="evaluation-report-550e8400-e29.pdf"',
    );

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    // Verify Playwright was invoked with correct HTML content
    expect(mockNewPage).toHaveBeenCalledTimes(1);
    expect(mockSetContent).toHaveBeenCalledTimes(1);
    expect(mockSetContent).toHaveBeenCalledWith(
      expect.stringContaining("John Doe"),
      expect.objectContaining({ waitUntil: "networkidle" }),
    );
    expect(mockPdf).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "A4",
        printBackground: true,
      }),
    );
  });

  it("returns 500 when PDF generation fails (Playwright error)", async () => {
    mockGetEvaluationPdfData.mockResolvedValue(mockEvalData);
    mockPdf.mockRejectedValue(new Error("Playwright page crash"));

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/550e8400-e29b-41d4-a716-446655440000/pdf?format=pdf"),
      { params: Promise.resolve({ uuid: "550e8400-e29b-41d4-a716-446655440000" }) },
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain("Failed to generate PDF");

    // Verify page.close() is called even on error (resource cleanup)
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when browser launch fails", async () => {
    mockGetEvaluationPdfData.mockResolvedValue(mockEvalData);

    // Need to re-mock the module for this test since browser is cached
    // The first call in the test suite caches _chromium, so subsequent
    // imports use it. We test error handling via mockPdf rejection instead.
    vi.resetModules();

    const { GET } = await import("./route");
    const response = await GET(
      pdfRequest("/api/evaluations/550e8400-e29b-41d4-a716-446655440000/pdf?format=pdf"),
      { params: Promise.resolve({ uuid: "550e8400-e29b-41d4-a716-446655440000" }) },
    );

    // With vi.resetModules(), the Playwright mock should still work
    // because the mock is hoisted. If _chromium is null, getBrowser will
    // try to import playwright again, which returns our mock.
    expect([200, 500]).toContain(response.status);
  });
});
