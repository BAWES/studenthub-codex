import { describe, it, expect } from "vitest";
import {
  parseFilter,
  parseCandidateId,
  parseCandidateIds,
  parseSearchPage,
  parseVisibility,
} from "@/modules/candidates/search";

/**
 * Page migration test for staff/candidates/search.
 *
 * Verifies the search params parsing data contract — how raw searchParams
 * strings are parsed into typed search parameters by the page component.
 *
 * Full rendering tests require Playwright (server component with Typesense).
 */
describe("staff candidates search page — search params parsing", () => {
  // ── parseFilter ──────────────────────────────────────────────────────

  it("parseFilter returns valid filter values", () => {
    expect(parseFilter("all")).toBe("all");
    expect(parseFilter("active")).toBe("active");
    expect(parseFilter("needs-review")).toBe("needs-review");
    expect(parseFilter("incomplete")).toBe("incomplete");
    expect(parseFilter("civil-id")).toBe("civil-id");
  });

  it("parseFilter defaults to 'all' for unknown values", () => {
    expect(parseFilter("unknown")).toBe("all");
    expect(parseFilter("")).toBe("all");
  });

  it("parseFilter handles undefined gracefully", () => {
    expect(parseFilter(undefined)).toBe("all");
  });

  it("parseFilter uses first element when passed an array", () => {
    expect(parseFilter(["active", "incomplete"])).toBe("active");
  });

  // ── parseCandidateId ─────────────────────────────────────────────────

  it("parseCandidateId returns positive integer for valid input", () => {
    expect(parseCandidateId("42")).toBe(42);
    expect(parseCandidateId("1")).toBe(1);
  });

  it("parseCandidateId returns undefined for invalid input", () => {
    expect(parseCandidateId("0")).toBeUndefined();
    expect(parseCandidateId("-5")).toBeUndefined();
    expect(parseCandidateId("abc")).toBeUndefined();
    expect(parseCandidateId("")).toBeUndefined();
    expect(parseCandidateId(undefined)).toBeUndefined();
  });

  it("parseCandidateId uses first element when passed an array", () => {
    expect(parseCandidateId(["42", "7"])).toBe(42);
  });

  // ── parseCandidateIds ────────────────────────────────────────────────

  it("parseCandidateIds parses comma-separated IDs", () => {
    expect(parseCandidateIds("1,2,3")).toEqual([1, 2, 3]);
  });

  it("parseCandidateIds filters out non-positive integers", () => {
    expect(parseCandidateIds("1,0,-5,abc,3")).toEqual([1, 3]);
  });

  it("parseCandidateIds returns empty array for undefined input", () => {
    expect(parseCandidateIds(undefined)).toEqual([]);
  });

  it("parseCandidateIds returns empty array for empty string", () => {
    expect(parseCandidateIds("")).toEqual([]);
  });

  it("parseCandidateIds respects limit parameter (default 8)", () => {
    const result = parseCandidateIds("1,2,3,4,5,6,7,8,9,10");
    expect(result).toHaveLength(8);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("parseCandidateIds respects custom limit", () => {
    expect(parseCandidateIds("1,2,3", 2)).toEqual([1, 2]);
  });

  it("parseCandidateIds uses first element when passed an array", () => {
    expect(parseCandidateIds(["1,2", "3,4"])).toEqual([1, 2]);
  });

  // ── parseSearchPage ──────────────────────────────────────────────────

  it("parseSearchPage returns positive integer for valid input", () => {
    expect(parseSearchPage("1")).toBe(1);
    expect(parseSearchPage("42")).toBe(42);
  });

  it("parseSearchPage returns undefined for invalid input", () => {
    expect(parseSearchPage("0")).toBeUndefined();
    expect(parseSearchPage("-1")).toBeUndefined();
    expect(parseSearchPage("abc")).toBeUndefined();
    expect(parseSearchPage("")).toBeUndefined();
    expect(parseSearchPage(undefined)).toBeUndefined();
  });

  it("parseSearchPage uses first element when passed an array", () => {
    expect(parseSearchPage(["3", "1"])).toBe(3);
  });

  // ── parseVisibility ──────────────────────────────────────────────────

  it("parseVisibility returns 'assigned' for 'assigned'", () => {
    expect(parseVisibility("assigned")).toBe("assigned");
  });

  it("parseVisibility defaults to 'all' for anything else", () => {
    expect(parseVisibility("all")).toBe("all");
    expect(parseVisibility("unknown")).toBe("all");
    expect(parseVisibility("")).toBe("all");
    expect(parseVisibility(undefined)).toBe("all");
  });

  it("parseVisibility uses first element when passed an array", () => {
    expect(parseVisibility(["assigned", "all"])).toBe("assigned");
    expect(parseVisibility(["all", "assigned"])).toBe("all");
  });
});
