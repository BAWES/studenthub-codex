import { describe, it, expect } from "vitest";
import {
  updateAdminCompanySchema,
} from "./schemas";

describe("updateAdminCompanySchema", () => {
  it("requires companyId", () => {
    const r = updateAdminCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("accepts companyId only (no optional fields)", () => {
    const r = updateAdminCompanySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("coerces string companyId to number", () => {
    const r = updateAdminCompanySchema.safeParse({ companyId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("rejects negative companyId", () => {
    expect(updateAdminCompanySchema.safeParse({ companyId: -1 }).success).toBe(
      false,
    );
  });

  it("rejects zero companyId", () => {
    expect(updateAdminCompanySchema.safeParse({ companyId: 0 }).success).toBe(
      false,
    );
  });

  it("accepts all optional fields", () => {
    const r = updateAdminCompanySchema.safeParse({
      companyId: 1,
      companyName: "Acme Corp",
      companyCommonNameEn: "Acme",
      companyEmail: "acme@example.com",
      companyWebsite: "https://acme.com",
      companyHourlyRate: 15.5,
      currencyCode: "KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Acme Corp");
      expect(r.data.companyEmail).toBe("acme@example.com");
      expect(r.data.companyHourlyRate).toBe(15.5);
      expect(r.data.currencyCode).toBe("KWD");
    }
  });

  it("rejects invalid email", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyHourlyRate: -5,
      }).success,
    ).toBe(false);
  });

  it("rejects long currency code", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        currencyCode: "USDollars",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid URL", () => {
    expect(
      updateAdminCompanySchema.safeParse({
        companyId: 1,
        companyWebsite: "not a url",
      }).success,
    ).toBe(false);
  });
});
