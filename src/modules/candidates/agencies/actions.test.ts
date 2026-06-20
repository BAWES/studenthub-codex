import { describe, it, expect } from "vitest";
import {
  listAgenciesSchema,
  getAgencySchema,
  createAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
  agencyItemSchema,
  listAgenciesResultSchema,
  agencyActionResultSchema,
} from "./schemas";

describe("listAgenciesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listAgenciesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts search query", () => {
    const r = listAgenciesSchema.safeParse({ search: "GCC", page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.search).toBe("GCC");
    }
  });

  it("rejects limit over 100", () => {
    expect(listAgenciesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getAgencySchema", () => {
  it("accepts valid companyId", () => {
    const r = getAgencySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.companyId).toBe(42);
  });

  it("rejects missing companyId", () => {
    expect(getAgencySchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(getAgencySchema.safeParse({ companyId: -1 }).success).toBe(false);
  });
});

describe("createAgencySchema", () => {
  it("accepts valid input", () => {
    const r = createAgencySchema.safeParse({
      companyName: "GCC Energies",
      companyEmail: "info@gcc.com",
      companyWebsite: "https://gcc.com",
      commercialLicence: "LIC-001",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.companyName).toBe("GCC Energies");
  });

  it("accepts minimum required fields", () => {
    expect(createAgencySchema.safeParse({ companyName: "Test Co" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createAgencySchema.safeParse({ companyName: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(createAgencySchema.safeParse({ companyName: "Test", companyEmail: "bad" }).success).toBe(false);
  });
});

describe("updateAgencySchema", () => {
  it("accepts valid update", () => {
    const r = updateAgencySchema.safeParse({ companyId: 1, companyName: "Updated Co" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.companyId).toBe(1);
  });

  it("rejects missing companyId", () => {
    expect(updateAgencySchema.safeParse({ companyName: "Test" }).success).toBe(false);
  });
});

describe("deleteAgencySchema", () => {
  it("accepts valid companyId", () => {
    expect(deleteAgencySchema.safeParse({ companyId: 5 }).success).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(deleteAgencySchema.safeParse({}).success).toBe(false);
  });
});

describe("agencyItemSchema", () => {
  it("accepts valid agency item", () => {
    const r = agencyItemSchema.safeParse({
      company_id: 1,
      company_name: "GCC",
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
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(agencyItemSchema.safeParse({ company_name: "Test" }).success).toBe(false);
  });
});

describe("listAgenciesResultSchema", () => {
  it("accepts valid result", () => {
    expect(listAgenciesResultSchema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 }).success).toBe(true);
  });
});

describe("agencyActionResultSchema", () => {
  it("accepts success result", () => {
    expect(agencyActionResultSchema.safeParse({ success: true, companyId: 1 }).success).toBe(true);
  });

  it("accepts error result", () => {
    expect(agencyActionResultSchema.safeParse({ success: false, error: "Failed" }).success).toBe(true);
  });
});
