import { describe, it, expect } from "vitest";
import { updateAdminCompanySchema } from "./schemas";

// ---------------------------------------------------------------------------
// updateAdminCompanySchema
// ---------------------------------------------------------------------------
describe("updateAdminCompanySchema", () => {
  const validMinimal = { companyId: 1 };

  it("accepts minimal input (companyId only)", () => {
    expect(updateAdminCompanySchema.safeParse(validMinimal).success).toBe(true);
  });

  it("accepts full input with all fields", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyName: "Acme Corp",
        companyCommonNameEn: "Acme",
        companyEmail: "admin@acme.com",
        companyWebsite: "https://acme.com",
        companyHourlyRate: 50,
        currencyCode: "KWD",
      }).success,
    ).toBe(true);
  });

  it("accepts null values for nullable fields", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyCommonNameEn: null,
        companyEmail: null,
        companyWebsite: null,
        companyHourlyRate: null,
        currencyCode: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(updateAdminCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(updateAdminCompanySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects companyId as non-numeric string", () => {
    expect(updateAdminCompanySchema.safeParse({ companyId: "abc" }).success).toBe(false);
  });

  it("rejects companyName exceeding 255 chars", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: 1, companyName: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: 1, companyEmail: "not-an-email" }).success,
    ).toBe(false);
  });

  it("rejects invalid url format", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: 1, companyWebsite: "not-a-url" }).success,
    ).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: 1, companyHourlyRate: -5 }).success,
    ).toBe(false);
  });

  it("rejects currencyCode not exactly 3 chars", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: 1, currencyCode: "KWDX" }).success,
    ).toBe(false);
  });

  it("rejects currencyCode as wrong type", () => {
    expect(
      updateAdminCompanySchema.safeParse({ companyId: 1, currencyCode: 123 }).success,
    ).toBe(false);
  });
});
