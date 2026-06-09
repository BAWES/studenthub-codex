import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  validateUuid,
  calculateAverageRating,
  renderStars,
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
