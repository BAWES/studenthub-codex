import { describe, it, expect } from "vitest";
import {
  updateAdminCompanySchema,
  companyExistenceSchema,
  updateCompanyResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// updateAdminCompanySchema tests
// ---------------------------------------------------------------------------

describe("updateAdminCompanySchema", () => {
  it("accepts only required companyId", () => {
    expect(updateAdminCompanySchema.safeParse({ companyId: 1 }).success).toBe(
      true,
    );
  });

  it("accepts all optional fields", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyName: "Acme Corp",
        companyCommonNameEn: "Acme",
        companyEmail: "contact@acme.com",
        companyWebsite: "https://acme.com",
        companyHourlyRate: 15.5,
        currencyCode: "KWD",
      }).success,
    ).toBe(true);
  });

  it("coerces string companyId to number", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: "1" }).success,
    ).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(updateAdminCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: -1 }).success,
    ).toBe(false);
  });

  it("accepts nullable optional fields as null", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyName: "Acme",
        companyCommonNameEn: null,
        companyEmail: null,
        companyWebsite: null,
        companyHourlyRate: null,
        currencyCode: null,
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email format", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid URL format", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyWebsite: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects companyName exceeding 255 chars", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyName: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyHourlyRate: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyExistenceSchema tests
// ---------------------------------------------------------------------------

describe("companyExistenceSchema", () => {
  it("accepts a valid company object", () => {
    expect(
      companyExistenceSchema.safeParse({ company_id: 42 }).success,
    ).toBe(true);
  });

  it("accepts null (company not found)", () => {
    expect(companyExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(companyExistenceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero company_id", () => {
    expect(
      companyExistenceSchema.safeParse({ company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects string company_id", () => {
    expect(
      companyExistenceSchema.safeParse({ company_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects undefined", () => {
    expect(companyExistenceSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanyResultSchema tests
// ---------------------------------------------------------------------------

describe("updateCompanyResultSchema", () => {
  it("accepts success response", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: "success",
        message: "Company updated",
      }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: "error",
        message: "Company not found",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: "invalid",
        message: "Something",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateCompanyResultSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });

  it("rejects missing operation", () => {
    expect(
      updateCompanyResultSchema.safeParse({ message: "Oops" }).success,
    ).toBe(false);
  });
});
