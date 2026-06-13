import { describe, it, expect } from "vitest";
import {
  updateCompanySettingsSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("updateCompanySettingsSchema", () => {
  it("accepts empty input (no required fields)", () => {
    const r = updateCompanySettingsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts partial update with one field", () => {
    const r = updateCompanySettingsSchema.safeParse({ companyName: "Acme Corp" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Acme Corp");
      expect(r.data.companyEmail).toBeUndefined();
    }
  });

  it("accepts all fields", () => {
    const r = updateCompanySettingsSchema.safeParse({
      companyName: "Acme Corp",
      companyCommonNameEn: "Acme",
      companyCommonNameAr: "أكمة",
      companyDescriptionEn: "A company",
      companyDescriptionAr: "شركة",
      companyWebsite: "https://acme.com",
      companyEmail: "info@acme.com",
      companyHourlyRate: 25.5,
      companyBonusCommission: 5.0,
      companyFollowup: true,
      companyFollowupIntervalWeeks: 2,
      companyApprovedToHire: true,
      currencyCode: "KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Acme Corp");
      expect(r.data.companyHourlyRate).toBe(25.5);
      expect(r.data.companyFollowup).toBe(true);
    }
  });

  it("rejects companyName over 255 chars", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ companyName: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects negative followup interval", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ companyFollowupIntervalWeeks: -1 }).success,
    ).toBe(false);
  });

  it("rejects followup interval over 52", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ companyFollowupIntervalWeeks: 53 }).success,
    ).toBe(false);
  });

  it("rejects currencyCode over 3 chars", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ currencyCode: "USDD" }).success,
    ).toBe(false);
  });

  it("accepts boolean false values", () => {
    const r = updateCompanySettingsSchema.safeParse({
      companyFollowup: false,
      companyApprovedToHire: false,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyFollowup).toBe(false);
      expect(r.data.companyApprovedToHire).toBe(false);
    }
  });
});
