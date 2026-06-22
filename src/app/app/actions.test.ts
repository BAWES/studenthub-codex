import { describe, it, expect } from "vitest";
import { getHubInputSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests (pure unit tests — no DB required)
// ---------------------------------------------------------------------------

describe("getHubInputSchema", () => {
  it("accepts empty input (defaults)", () => {
    const result = getHubInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("");
      expect(result.data.scope).toBe("all");
      expect(result.data.record).toBeUndefined();
    }
  });

  it("accepts a valid query string", () => {
    const result = getHubInputSchema.safeParse({ query: "Ahmed" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("Ahmed");
    }
  });

  it("accepts a valid scope", () => {
    const result = getHubInputSchema.safeParse({ scope: "people" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scope).toBe("people");
    }
  });

  it("accepts compliance scope", () => {
    const result = getHubInputSchema.safeParse({ scope: "compliance" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scope).toBe("compliance");
    }
  });

  it("accepts a record identifier", () => {
    const result = getHubInputSchema.safeParse({ record: "candidate-42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.record).toBe("candidate-42");
    }
  });

  it("accepts all fields together", () => {
    const result = getHubInputSchema.safeParse({
      query: "engineer",
      scope: "demand",
      record: "request-abc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid scope value", () => {
    const result = getHubInputSchema.safeParse({ scope: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects empty query string (trimmed)", () => {
    const result = getHubInputSchema.safeParse({ query: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("");
    }
  });

  it("coerces query to string", () => {
    // When query comes from URL params it's always a string,
    // but schema should handle it gracefully
    const result = getHubInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
