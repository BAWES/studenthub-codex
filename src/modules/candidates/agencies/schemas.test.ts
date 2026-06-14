import { describe, it, expect } from "vitest";
import {
  agencyItemSchema,
  listAgenciesResultSchema,
  agencyActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("agencyItemSchema", () => {
  const validItem = {
    company_id: 1,
    company_name: "Tech Recruit Agency",
    company_common_name_en: "Tech Recruit",
    company_common_name_ar: "تيك ريكروت",
    company_email: "info@techrecruit.com",
    company_website: "https://techrecruit.com",
    company_logo: "/logos/tech.png",
    commercial_licence: "LIC-12345",
    total_candidate: 150,
    no_of_active_requests: 12,
    country_id: 1,
    company_created_at: new Date("2026-01-15T08:00:00"),
    company_updated_at: new Date("2026-06-10T12:00:00"),
  };

  it("accepts a valid agency item", () => {
    expect(agencyItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
    expect(
      agencyItemSchema.safeParse({
        ...validItem,
        company_common_name_en: null,
        company_common_name_ar: null,
        company_email: null,
        company_website: null,
        company_logo: null,
        commercial_licence: null,
        total_candidate: null,
        no_of_active_requests: null,
        country_id: null,
        company_created_at: null,
        company_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validItem;
    expect(agencyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      agencyItemSchema.safeParse({
        ...validItem,
        company_id: "1",
      }).success,
    ).toBe(false);
  });

  it("rejects number for company_email", () => {
    expect(
      agencyItemSchema.safeParse({
        ...validItem,
        company_email: 123,
      }).success,
    ).toBe(false);
  });

  it("coerces ISO string to Date for company_created_at", () => {
    expect(
      agencyItemSchema.safeParse({
        ...validItem,
        company_created_at: "2026-01-15T08:00:00",
      }).success,
    ).toBe(true); // z.coerce.date() accepts ISO strings
  });
});

describe("listAgenciesResultSchema", () => {
  const validResult = {
    items: [
      {
        company_id: 1,
        company_name: "Tech Recruit Agency",
        company_common_name_en: null,
        company_common_name_ar: null,
        company_email: null,
        company_website: null,
        company_logo: null,
        commercial_licence: null,
        total_candidate: null,
        no_of_active_requests: null,
        country_id: null,
        company_created_at: null,
        company_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  it("accepts a valid paginated result", () => {
    expect(listAgenciesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listAgenciesResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listAgenciesResultSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listAgenciesResultSchema.safeParse({
        ...validResult,
        page: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of number for page", () => {
    expect(
      listAgenciesResultSchema.safeParse({
        ...validResult,
        page: "1",
      }).success,
    ).toBe(false);
  });
});

describe("agencyActionResultSchema", () => {
  it("accepts success result", () => {
    const r = agencyActionResultSchema.safeParse({
      success: true,
      companyId: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = agencyActionResultSchema.safeParse({
      success: false,
      error: "Agency not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without companyId", () => {
    expect(
      agencyActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(
      agencyActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects invalid discriminator value", () => {
    expect(
      agencyActionResultSchema.safeParse({
        success: "yes",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for companyId in success variant", () => {
    expect(
      agencyActionResultSchema.safeParse({
        success: true,
        companyId: "1",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for error message", () => {
    expect(
      agencyActionResultSchema.safeParse({
        success: false,
        error: 42,
      }).success,
    ).toBe(false);
  });
});
