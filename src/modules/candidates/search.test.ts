import { describe, it, expect } from "vitest";
import { parseFilter, parseCandidateId, parseCandidateIds, parseVisibility } from "./search";

describe("parseFilter", () => {
  it("passes through a valid filter value", () => {
    expect(parseFilter("active")).toBe("active");
    expect(parseFilter("needs-review")).toBe("needs-review");
    expect(parseFilter("incomplete")).toBe("incomplete");
    expect(parseFilter("civil-id")).toBe("civil-id");
  });

  it("defaults to 'all' for undefined", () => {
    expect(parseFilter(undefined)).toBe("all");
  });

  it("defaults to 'all' for invalid filter values", () => {
    expect(parseFilter("bogus")).toBe("all");
    expect(parseFilter("")).toBe("all");
  });

  it("unwraps the first element when given an array", () => {
    expect(parseFilter(["active", "all"])).toBe("active");
  });

  it("defaults to 'all' for empty array", () => {
    expect(parseFilter([])).toBe("all");
  });
});

describe("parseCandidateId", () => {
  it("parses a positive integer string", () => {
    expect(parseCandidateId("42")).toBe(42);
  });

  it("returns undefined for undefined", () => {
    expect(parseCandidateId(undefined)).toBeUndefined();
  });

  it("unwraps the first element when given an array", () => {
    expect(parseCandidateId(["99"])).toBe(99);
  });

  it("returns undefined for non-positive integers", () => {
    expect(parseCandidateId("0")).toBeUndefined();
    expect(parseCandidateId("-1")).toBeUndefined();
  });

  it("returns undefined for non-numeric strings", () => {
    expect(parseCandidateId("abc")).toBeUndefined();
  });

  it("returns undefined for floats", () => {
    expect(parseCandidateId("3.14")).toBeUndefined();
  });
});

describe("parseCandidateIds", () => {
  it("parses a comma-separated list of positive integers", () => {
    expect(parseCandidateIds("1,2,3")).toEqual([1, 2, 3]);
  });

  it("returns empty array for undefined", () => {
    expect(parseCandidateIds(undefined)).toEqual([]);
  });

  it("unwraps the first element when given an array", () => {
    expect(parseCandidateIds(["4,5,6"])).toEqual([4, 5, 6]);
  });

  it("filters out non-positive and non-integer values", () => {
    expect(parseCandidateIds("1,-2,3.5,abc,0,7")).toEqual([1, 7]);
  });

  it("respects the limit parameter", () => {
    expect(parseCandidateIds("1,2,3,4,5", 3)).toEqual([1, 2, 3]);
  });

  it("defaults to limit of 8", () => {
    const ids = parseCandidateIds("1,2,3,4,5,6,7,8,9,10");
    expect(ids).toHaveLength(8);
  });

  it("returns empty array for empty string", () => {
    expect(parseCandidateIds("")).toEqual([]);
  });
});

describe("parseVisibility", () => {
  it("passes through 'assigned'", () => {
    expect(parseVisibility("assigned")).toBe("assigned");
  });

  it("defaults to 'all' for undefined", () => {
    expect(parseVisibility(undefined)).toBe("all");
  });

  it("defaults to 'all' for unknown values", () => {
    expect(parseVisibility("bogus")).toBe("all");
    expect(parseVisibility("")).toBe("all");
  });

  it("returns 'all' for 'all'", () => {
    expect(parseVisibility("all")).toBe("all");
  });

  it("unwraps the first element when given an array", () => {
    expect(parseVisibility(["assigned"])).toBe("assigned");
  });
});
