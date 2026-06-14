import { describe, it, expect } from "vitest";
import { getHubInputSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getHubInputSchema
// ---------------------------------------------------------------------------
describe("getHubInputSchema", () => {
  const valid = {
    query: "search term",
    scope: "all",
    record: "some-record",
  };

  it("accepts a valid hub input", () => {
    expect(getHubInputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty query", () => {
    expect(
      getHubInputSchema.safeParse({ ...valid, query: "" }).success,
    ).toBe(true);
  });

  it("trims whitespace from query", () => {
    const result = getHubInputSchema.safeParse({ ...valid, query: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("hello");
    }
  });

  it("defaults query to empty string when omitted", () => {
    const { query: _, ...rest } = valid;
    const result = getHubInputSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("");
    }
  });

  it("defaults scope to 'all' when omitted", () => {
    const { scope: _, ...rest } = valid;
    const result = getHubInputSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scope).toBe("all");
    }
  });

  it("accepts optional record as missing", () => {
    const { record: _, ...rest } = valid;
    expect(getHubInputSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects invalid scope value", () => {
    expect(
      getHubInputSchema.safeParse({ ...valid, scope: "invalid-scope" }).success,
    ).toBe(false);
  });

  it("rejects non-string query", () => {
    expect(
      getHubInputSchema.safeParse({ ...valid, query: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-string record", () => {
    expect(
      getHubInputSchema.safeParse({ ...valid, record: true }).success,
    ).toBe(false);
  });

  it("accepts scope as any valid enum value", () => {
    expect(
      getHubInputSchema.safeParse({ ...valid, scope: "all" }).success,
    ).toBe(true);
  });
});
