import { describe, it, expect } from "vitest";
import {
  parseFilter,
  parseCandidateId,
  parseCandidateIds,
  parseSearchPage,
} from "./schemas";
import { parseVisibility } from "./schemas";

/**
 * Page migration test for staff/candidates/search.
 *
 * Verifies the data contract between page and search parameter input.
 * The staff candidate search page parses URL query params through
 * utility functions defined in @/modules/candidates/search.ts and
 * re-exported through search-typesense.ts.
 *
 * These parse functions handle runtime validation of candidate search
 * params (filter, candidate ID, page number, visibility) and are the
 * primary input validation boundary for the page.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("staff candidate search page — data contract", () => {
  // -----------------------------------------------------------------------
  // parseFilter
  // -----------------------------------------------------------------------
  describe("parseFilter", () => {
    it("returns 'all' for undefined input", () => {
      expect(parseFilter(undefined)).toBe("all");
    });

    it("returns 'all' for empty string", () => {
      expect(parseFilter("")).toBe("all");
    });

    it("returns valid filter value unchanged", () => {
      expect(parseFilter("active")).toBe("active");
      expect(parseFilter("needs-review")).toBe("needs-review");
      expect(parseFilter("incomplete")).toBe("incomplete");
      expect(parseFilter("civil-id")).toBe("civil-id");
      expect(parseFilter("all")).toBe("all");
    });

    it("returns 'all' for invalid filter value", () => {
      expect(parseFilter("invalid_filter")).toBe("all");
    });

    it("handles array input by taking first element", () => {
      expect(parseFilter(["active", "incomplete"])).toBe("active");
    });

    it("returns 'all' for empty array", () => {
      expect(parseFilter([])).toBe("all");
    });
  });

  // -----------------------------------------------------------------------
  // parseVisibility
  // -----------------------------------------------------------------------
  describe("parseVisibility", () => {
    it("returns 'all' for undefined input", () => {
      expect(parseVisibility(undefined)).toBe("all");
    });

    it("returns 'assigned' for assigned input", () => {
      expect(parseVisibility("assigned")).toBe("assigned");
    });

    it("returns 'all' for 'all' input", () => {
      expect(parseVisibility("all")).toBe("all");
    });

    it("returns 'all' for any other value", () => {
      expect(parseVisibility("admin")).toBe("all");
      expect(parseVisibility("")).toBe("all");
    });

    it("handles array input by taking first element", () => {
      expect(parseVisibility(["assigned", "all"])).toBe("assigned");
    });
  });

  // -----------------------------------------------------------------------
  // parseCandidateId
  // -----------------------------------------------------------------------
  describe("parseCandidateId", () => {
    it("returns undefined for undefined input", () => {
      expect(parseCandidateId(undefined)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(parseCandidateId("")).toBeUndefined();
    });

    it("returns number for valid numeric string", () => {
      expect(parseCandidateId("42")).toBe(42);
      expect(parseCandidateId("1")).toBe(1);
    });

    it("returns undefined for zero", () => {
      expect(parseCandidateId("0")).toBeUndefined();
    });

    it("returns undefined for non-numeric string", () => {
      expect(parseCandidateId("abc")).toBeUndefined();
    });

    it("handles array input by taking first element", () => {
      expect(parseCandidateId(["42", "7"])).toBe(42);
    });

    it("returns undefined for negative number", () => {
      expect(parseCandidateId("-1")).toBeUndefined();
    });

    it("returns undefined for float string", () => {
      expect(parseCandidateId("3.14")).toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // parseCandidateIds
  // -----------------------------------------------------------------------
  describe("parseCandidateIds", () => {
    it("returns empty array for undefined input", () => {
      expect(parseCandidateIds(undefined)).toEqual([]);
    });

    it("parses comma-separated IDs", () => {
      expect(parseCandidateIds("1,2,3")).toEqual([1, 2, 3]);
    });

    it("filters out invalid values", () => {
      expect(parseCandidateIds("1,abc,0,-1,3")).toEqual([1, 3]);
    });

    it("returns empty array for empty string", () => {
      expect(parseCandidateIds("")).toEqual([]);
    });

    it("respects default limit of 8", () => {
      const ids = Array.from({ length: 20 }, (_, i) => i + 1).join(",");
      expect(parseCandidateIds(ids)).toHaveLength(8);
    });

    it("accepts custom limit via second argument", () => {
      const ids = Array.from({ length: 5 }, (_, i) => i + 1).join(",");
      expect(parseCandidateIds(ids, 3)).toHaveLength(3);
    });

    it("handles array input by taking first element", () => {
      expect(parseCandidateIds(["1,2,3", "4,5"])).toEqual([1, 2, 3]);
    });

    it("strips whitespace around numbers", () => {
      expect(parseCandidateIds(" 1 , 2 , 3 ")).toEqual([1, 2, 3]);
    });
  });

  // -----------------------------------------------------------------------
  // parseSearchPage
  // -----------------------------------------------------------------------
  describe("parseSearchPage", () => {
    it("returns undefined for undefined input", () => {
      expect(parseSearchPage(undefined)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(parseSearchPage("")).toBeUndefined();
    });

    it("returns number for valid page string", () => {
      expect(parseSearchPage("1")).toBe(1);
      expect(parseSearchPage("5")).toBe(5);
    });

    it("returns undefined for zero", () => {
      expect(parseSearchPage("0")).toBeUndefined();
    });

    it("returns undefined for negative number", () => {
      expect(parseSearchPage("-1")).toBeUndefined();
    });

    it("returns undefined for non-numeric string", () => {
      expect(parseSearchPage("abc")).toBeUndefined();
    });

    it("returns undefined for float", () => {
      expect(parseSearchPage("2.5")).toBeUndefined();
    });

    it("handles array input by taking first element", () => {
      expect(parseSearchPage(["3", "1"])).toBe(3);
    });
  });
});
