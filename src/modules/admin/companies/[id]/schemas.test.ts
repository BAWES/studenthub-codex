import { describe, it, expect } from "vitest";
import {
  updateAdminCompanySchema,
  companyExistenceSchema,
  updateCompanyResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("updateAdminCompanySchema", () => {
  const validInput = { companyId: 1, companyName: "Test Corp" };

  it("accepts valid input with required fields only", () => {
    const r = updateAdminCompanySchema.safeParse({ companyId: 1 });
    expect(r.success).toBe(true);
  });

  it("accepts valid input with all optional fields", () => {
    const r = updateAdminCompanySchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = updateAdminCompanySchema.safeParse({
      companyId: 1,
      companyEmail: null,
      companyWebsite: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(updateAdminCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive companyId", () => {
    expect(updateAdminCompanySchema.safeParse({ companyId: -1 }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("companyExistenceSchema", () => {
  it("accepts valid company existence data", () => {
    const r = companyExistenceSchema.safeParse({ company_id: 42 });
    expect(r.success).toBe(true);
    expect(r.data).not.toBeNull();
  });

  it("accepts null", () => {
    expect(companyExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(companyExistenceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    expect(companyExistenceSchema.safeParse({ company_id: 0 }).success).toBe(false);
  });
});

describe("updateCompanyResultSchema", () => {
  it("accepts success result", () => {
    const r = updateCompanyResultSchema.safeParse({
      operation: "success",
      message: "Company updated",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = updateCompanyResultSchema.safeParse({
      operation: "error",
      message: "Company not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateCompanyResultSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });
});
