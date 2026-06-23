import { describe, it, expect } from "vitest";

// Import the helper functions from search.ts (re-exported via schemas)
// These are used by the admin/candidates page for search parameter parsing
import {
  parseFilter,
  parseCandidateId,
  parseCandidateIds,
  parseSearchPage,
} from "@/modules/candidates/search";

describe("parseFilter", () => {
  it("returns 'all' for undefined", () => {
    expect(parseFilter(undefined)).toBe("all");
  });

  it("returns 'all' for empty string", () => {
    expect(parseFilter("")).toBe("all");
  });

  it("returns valid filter value", () => {
    expect(parseFilter("active")).toBe("active");
    expect(parseFilter("needs-review")).toBe("needs-review");
    expect(parseFilter("incomplete")).toBe("incomplete");
    expect(parseFilter("civil-id")).toBe("civil-id");
  });

  it("falls back to 'all' for invalid filter", () => {
    expect(parseFilter("invalid")).toBe("all");
    expect(parseFilter("pending")).toBe("all");
    expect(parseFilter("archived")).toBe("all");
  });

  it("handles array value by taking first element", () => {
    expect(parseFilter(["active", "incomplete"])).toBe("active");
    expect(parseFilter(["invalid"])).toBe("all");
  });
});

describe("parseCandidateId", () => {
  it("returns undefined for undefined", () => {
    expect(parseCandidateId(undefined)).toBeUndefined();
  });

  it("returns undefined for non-numeric string", () => {
    expect(parseCandidateId("abc")).toBeUndefined();
    expect(parseCandidateId("")).toBeUndefined();
  });

  it("returns undefined for zero or negative", () => {
    expect(parseCandidateId("0")).toBeUndefined();
    expect(parseCandidateId("-1")).toBeUndefined();
  });

  it("returns number for valid ID", () => {
    expect(parseCandidateId("123")).toBe(123);
    expect(parseCandidateId("1")).toBe(1);
  });

  it("handles array value", () => {
    expect(parseCandidateId(["456", "789"])).toBe(456);
  });

  it("handles float strings by returning undefined (not integer)", () => {
    expect(parseCandidateId("123.45")).toBeUndefined();
  });
});

describe("parseCandidateIds", () => {
  it("returns empty array for undefined", () => {
    expect(parseCandidateIds(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseCandidateIds("")).toEqual([]);
  });

  it("parses comma-separated IDs", () => {
    expect(parseCandidateIds("1,2,3")).toEqual([1, 2, 3]);
  });

  it("filters out non-numeric and zero values", () => {
    expect(parseCandidateIds("1,abc,0,-1,3")).toEqual([1, 3]);
  });

  it("respects the limit parameter", () => {
    expect(parseCandidateIds("1,2,3,4,5,6,7,8,9,10", 3)).toEqual([1, 2, 3]);
  });

  it("default limit is 8", () => {
    const ids = parseCandidateIds("1,2,3,4,5,6,7,8,9,10,11,12");
    expect(ids.length).toBe(8);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("handles array value", () => {
    expect(parseCandidateIds(["1,2,3"])).toEqual([1, 2, 3]);
  });

  it("handles whitespace around numbers", () => {
    expect(parseCandidateIds(" 1 , 2 , 3 ")).toEqual([1, 2, 3]);
  });
});

describe("parseSearchPage", () => {
  it("returns undefined for undefined", () => {
    expect(parseSearchPage(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(parseSearchPage("")).toBeUndefined();
  });

  it("returns undefined for non-numeric", () => {
    expect(parseSearchPage("abc")).toBeUndefined();
  });

  it("returns undefined for zero or negative", () => {
    expect(parseSearchPage("0")).toBeUndefined();
    expect(parseSearchPage("-1")).toBeUndefined();
  });

  it("returns number for valid page", () => {
    expect(parseSearchPage("1")).toBe(1);
    expect(parseSearchPage("5")).toBe(5);
    expect(parseSearchPage("99")).toBe(99);
  });

  it("handles array value", () => {
    expect(parseSearchPage(["3", "4"])).toBe(3);
  });

  it("returns undefined for float strings", () => {
    expect(parseSearchPage("2.5")).toBeUndefined();
  });
});
