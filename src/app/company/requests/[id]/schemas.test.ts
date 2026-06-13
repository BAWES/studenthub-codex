import { describe, it, expect } from "vitest";
import { companyRequestActionResultSchema } from "./schemas";

describe("companyRequestActionResultSchema", () => {
  it("accepts { success: true }", () => {
    const result = companyRequestActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts { error: string }", () => {
    const result = companyRequestActionResultSchema.safeParse({
      error: "Request not found.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ error: "Request not found." });
    }
  });

  it("accepts empty error string", () => {
    const result = companyRequestActionResultSchema.safeParse({
      error: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects { success: false }", () => {
    const result = companyRequestActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = companyRequestActionResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null", () => {
    const result = companyRequestActionResultSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("rejects undefined", () => {
    const result = companyRequestActionResultSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });

  it("rejects { foo: 'bar' }", () => {
    const result = companyRequestActionResultSchema.safeParse({
      foo: "bar",
    });
    expect(result.success).toBe(false);
  });
});
