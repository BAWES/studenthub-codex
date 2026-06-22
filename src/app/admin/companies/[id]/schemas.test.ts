import { describe, it, expect } from "vitest";
import {
  updateAdminCompanySchema,
  companyExistenceSchema,
  updateCompanyResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// updateAdminCompanySchema
// ---------------------------------------------------------------------------
describe("updateAdminCompanySchema", () => {
  const validInput = { companyId: "5" };

  it("accepts valid input with just companyId", () => {
    expect(updateAdminCompanySchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: "5",
        companyName: "Acme Corp",
        companyCommonNameEn: "Acme",
        companyEmail: "contact@acme.com",
        companyWebsite: "https://acme.com",
        companyHourlyRate: "15.5",
        currencyCode: "KWD",
      }).success,
    ).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: "5",
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
        companyId: "5",
        companyEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid URL format", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: "5",
        companyWebsite: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: "5",
        companyHourlyRate: "-1",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong currency code length", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: "5",
        currencyCode: "KWDX",
      }).success,
    ).toBe(false);
  });

  it("rejects missing companyId", () => {
    expect(updateAdminCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for companyId", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyExistenceSchema
// ---------------------------------------------------------------------------
describe("companyExistenceSchema", () => {
  it("accepts valid company object", () => {
    expect(
      companyExistenceSchema.safeParse({ company_id: 1 }).success,
    ).toBe(true);
  });

  it("accepts null (company not found)", () => {
    expect(companyExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(companyExistenceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    expect(
      companyExistenceSchema.safeParse({ company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      companyExistenceSchema.safeParse({ company_id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanyResultSchema
// ---------------------------------------------------------------------------
describe("updateCompanyResultSchema", () => {
  it("accepts success result", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: "success",
        message: "Company updated",
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: "error",
        message: "Company not found",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: "unknown",
        message: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing operation", () => {
    expect(
      updateCompanyResultSchema.safeParse({ message: "test" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateCompanyResultSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(
      updateCompanyResultSchema.safeParse({
        operation: 123,
        message: true,
      }).success,
    ).toBe(false);
  });
});
