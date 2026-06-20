import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  validateUuid,
  calculateAverageRating,
  renderStars,
} from "@/modules/candidates/evaluation/pdf-helpers";
import { buildReportHtml, type ReportData } from "@/modules/candidates/evaluation/pdf-helpers";

// ---------------------------------------------------------------------------
// Tests: buildReportHtml
// ---------------------------------------------------------------------------

describe("buildReportHtml", () => {
  const baseData: ReportData = {
    candidateName: "John Doe",
    candidateEmail: "john@example.com",
    staffName: "Jane Staff",
    period: "2026-01-01 → 2026-03-31",
    evalDate: "June 20, 2026",
    uuid: "can_eval_550e8400-e29b-41d4-a716-446655440000",
    answerRows: "<tr><td>1</td><td>Test Q</td><td>Test A</td><td>★★★★★</td></tr>",
    answersCount: 1,
    avgRating: "5.0",
  };

  it("renders candidate name in the title", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("John Doe");
    expect(html).toContain("Candidate Evaluation Report");
  });

  it("renders the h1 heading", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("<h1>Candidate Evaluation Report</h1>");
  });

  it("renders header info with candidate details", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("john@example.com");
    expect(html).toContain("Jane Staff");
    expect(html).toContain("can_eval_550e8400");
  });

  it("renders answer rows in the table body", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("<tr><td>1</td><td>Test Q</td>");
  });

  it("renders summary section with questions count and average rating", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("Questions");
    expect(html).toContain("1");
    expect(html).toContain("Average Rating");
    expect(html).toContain("5.0");
    expect(html).toContain("Report Date");
    expect(html).toContain("June 20, 2026");
  });

  it("renders the footer", () => {
    const html = buildReportHtml(baseData);
    expect(html).toContain("StudentHub");
    expect(html).toContain("Candidate Evaluation Report");
  });

  it("escapes HTML in candidate name", () => {
    const data = { ...baseData, candidateName: "<script>alert('xss')</script>" };
    const html = buildReportHtml(data);
    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("renders zero answers gracefully", () => {
    const data = { ...baseData, answersCount: 0, avgRating: "—", answerRows: "" };
    const html = buildReportHtml(data);
    expect(html).toContain("0");
  });

  it("renders empty candidate email as em-dash", () => {
    const data = { ...baseData, candidateEmail: "" };
    const html = buildReportHtml(data);
    expect(html).toContain("—");
  });

  it("renders multiple answer rows", () => {
    const rows = Array.from({ length: 3 }, (_, i) =>
      `<tr><td class="num">${i + 1}</td><td>Q${i + 1}</td><td>A${i + 1}</td><td class="rating">★</td></tr>`
    ).join("\n");
    const data = { ...baseData, answerRows: rows, answersCount: 3 };
    const html = buildReportHtml(data);
    expect(html).toContain("Q1");
    expect(html).toContain("A2");
    expect(html).toContain("Q3");
  });
});

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
