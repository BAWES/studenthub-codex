import { describe, it, expect } from "vitest";
import { getCompanyCreateFormCompaniesSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schema tests (pure unit tests — no DB required)
// ---------------------------------------------------------------------------

describe("getCompanyCreateFormCompaniesSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getCompanyCreateFormCompaniesSchema.safeParse({
        contactUuid: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getCompanyCreateFormCompaniesSchema.safeParse({
        contactUuid: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(
      getCompanyCreateFormCompaniesSchema.safeParse({}).success,
    ).toBe(false);
  });
});
