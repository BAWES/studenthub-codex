import { describe, it, expect } from "vitest";
import {
  agencyItemOutputSchema,
  agencyActionResultOutputSchema,
  agencyDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema tests — candidate/agencies/[id]
// ---------------------------------------------------------------------------

describe("agencyDetailOutputSchema", () => {
  const validItem = {
    company_id: 1,
    company_name: "Test Agency",
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
  };

  it("accepts valid agency item", () => {
    expect(agencyDetailOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null", () => {
    expect(agencyDetailOutputSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing required field", () => {
    const { company_id: _, ...rest } = validItem;
    expect(agencyDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      agencyDetailOutputSchema.safeParse({ ...validItem, company_id: "abc" })
        .success,
    ).toBe(false);
  });
});

describe("agencyItemOutputSchema (re-export)", () => {
  it("accepts valid agency item", () => {
    expect(
      agencyItemOutputSchema.safeParse({
        company_id: 1,
        company_name: "Test",
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
});

describe("agencyActionResultOutputSchema (re-export)", () => {
  it("accepts success result", () => {
    expect(
      agencyActionResultOutputSchema.safeParse({
        success: true,
        companyId: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      agencyActionResultOutputSchema.safeParse({
        success: false,
        error: "Not found",
      }).success,
    ).toBe(true);
  });
});
