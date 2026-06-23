import { describe, it, expect } from "vitest";
import { getCompanyListSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getCompanyListSchema
// ---------------------------------------------------------------------------
describe("getCompanyListSchema", () => {
  const validInput = { contactUuid: "550e8400-e29b-41d4-a716-446655440000" };

  it("accepts valid input", () => {
    expect(getCompanyListSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(getCompanyListSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(getCompanyListSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });

  it("rejects non-string contactUuid", () => {
    expect(getCompanyListSchema.safeParse({ contactUuid: 123 }).success).toBe(false);
  });
});
