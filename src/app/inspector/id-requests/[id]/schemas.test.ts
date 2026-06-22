import { describe, it, expect } from "vitest";
import { inspectorIdRequestActionResultSchema } from "./schemas";

describe("inspectorIdRequestActionResultSchema", () => {
  it("accepts { success: true }", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts { error: string }", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({
      error: "ID request not found.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ error: "ID request not found." });
    }
  });

  it("accepts empty error string", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({
      error: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects { success: false }", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("rejects undefined", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });

  it("rejects { foo: 'bar' }", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({
      foo: "bar",
    });
    expect(result.success).toBe(false);
  });
});
