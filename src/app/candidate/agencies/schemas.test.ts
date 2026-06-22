import { describe, it, expect } from "vitest";
import {
  listAgenciesSchema,
  getAgencySchema,
  createAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
  agencyItemOutputSchema,
  agencyActionResultOutputSchema,
  listAgenciesOutputSchema,
  listAgenciesResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/agencies
// ---------------------------------------------------------------------------

describe("listAgenciesSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listAgenciesSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listAgenciesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listAgenciesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listAgenciesSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("rejects negative limit", () => {
    expect(listAgenciesSchema.safeParse({ limit: -5 }).success).toBe(false);
  });

  it("coerces string page and limit to number", () => {
    const r = listAgenciesSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts optional search", () => {
    const r = listAgenciesSchema.safeParse({ search: "test" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.search).toBe("test");
    }
  });
});

describe("getAgencySchema", () => {
  it("accepts valid company ID", () => {
    const r = getAgencySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("coerces string company ID to number", () => {
    const r = getAgencySchema.safeParse({ companyId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("rejects missing companyId", () => {
    expect(getAgencySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(getAgencySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(getAgencySchema.safeParse({ companyId: -5 }).success).toBe(false);
  });
});

describe("createAgencySchema", () => {
  const validInput = {
    companyName: "Test Agency",
  };

  it("accepts valid input with required fields only", () => {
    const r = createAgencySchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Test Agency");
    }
  });

  it("accepts optional email and website", () => {
    const r = createAgencySchema.safeParse({
      ...validInput,
      companyEmail: "test@example.com",
      companyWebsite: "https://example.com",
    });
    expect(r.success).toBe(true);
  });

  it("trims company name", () => {
    const r = createAgencySchema.safeParse({ companyName: "  Test  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Test");
    }
  });

  it("rejects missing companyName", () => {
    expect(createAgencySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty companyName", () => {
    expect(createAgencySchema.safeParse({ companyName: "" }).success).toBe(false);
  });

  it("rejects companyName exceeding 255 characters", () => {
    expect(
      createAgencySchema.safeParse({ companyName: "a".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createAgencySchema.safeParse({
        ...validInput,
        companyEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });
});

describe("updateAgencySchema", () => {
  const validInput = {
    companyId: 1,
    companyName: "Updated Agency",
  };

  it("accepts valid update input", () => {
    const r = updateAgencySchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(1);
      expect(r.data.companyName).toBe("Updated Agency");
    }
  });

  it("trims company name", () => {
    const r = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "  Trimmed  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Trimmed");
    }
  });

  it("rejects missing companyId", () => {
    expect(
      updateAgencySchema.safeParse({ companyName: "Agency" }).success,
    ).toBe(false);
  });

  it("rejects missing companyName", () => {
    expect(
      updateAgencySchema.safeParse({ companyId: 1 }).success,
    ).toBe(false);
  });

  it("rejects empty companyName", () => {
    expect(
      updateAgencySchema.safeParse({ companyId: 1, companyName: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updateAgencySchema.safeParse({
        ...validInput,
        companyEmail: "bad",
      }).success,
    ).toBe(false);
  });
});

describe("deleteAgencySchema", () => {
  it("accepts valid company ID", () => {
    const r = deleteAgencySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
  });

  it("coerces string company ID", () => {
    const r = deleteAgencySchema.safeParse({ companyId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("rejects missing companyId", () => {
    expect(deleteAgencySchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("agencyItemOutputSchema", () => {
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
    expect(agencyItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts non-null values for nullable fields", () => {
    expect(
      agencyItemOutputSchema.safeParse({
        ...validItem,
        company_email: "test@example.com",
        total_candidate: 10,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validItem;
    expect(agencyItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validItem;
    expect(agencyItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      agencyItemOutputSchema.safeParse({ ...validItem, company_id: "abc" })
        .success,
    ).toBe(false);
  });
});

describe("agencyActionResultOutputSchema", () => {
  it("accepts success result", () => {
    expect(
      agencyActionResultOutputSchema.safeParse({
        success: true,
        companyId: 42,
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      agencyActionResultOutputSchema.safeParse({
        success: false,
        error: "Something went wrong",
      }).success,
    ).toBe(true);
  });

  it("rejects success without companyId", () => {
    expect(
      agencyActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error field", () => {
    expect(
      agencyActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });
});

describe("listAgenciesOutputSchema", () => {
  const validResult = {
    items: [
      {
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
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid list output", () => {
    expect(listAgenciesOutputSchema.safeParse(validResult).success).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listAgenciesOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listAgenciesResultOutputSchema", () => {
  it("accepts valid result", () => {
    const r = listAgenciesResultOutputSchema.safeParse({
      items: [],
      total: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listAgenciesResultOutputSchema.safeParse({ items: [], total: -1 })
        .success,
    ).toBe(false);
  });
});
