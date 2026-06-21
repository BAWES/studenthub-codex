import { describe, it, expect } from "vitest";
import {
  listAdminCompaniesSchema,
  getAdminCompanySchema,
  adminCompanyRowSchema,
  adminCompanyDetailSchema,
  adminCompanyListResponseSchema,
  adminCompanyToggleResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listAdminCompaniesSchema
// ---------------------------------------------------------------------------
describe("listAdminCompaniesSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listAdminCompaniesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listAdminCompaniesSchema.safeParse({ page: 2, limit: 50, q: "acme", status: "approved" }).success,
    ).toBe(true);
  });

  it("accepts status 'not_approved' and 'all'", () => {
    expect(listAdminCompaniesSchema.safeParse({ status: "not_approved" }).success).toBe(true);
    expect(listAdminCompaniesSchema.safeParse({ status: "all" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(listAdminCompaniesSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listAdminCompaniesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listAdminCompaniesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listAdminCompaniesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listAdminCompaniesSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAdminCompanySchema
// ---------------------------------------------------------------------------
describe("getAdminCompanySchema", () => {
  it("accepts valid input", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: 42 }).success).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(getAdminCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyRowSchema
// ---------------------------------------------------------------------------
describe("adminCompanyRowSchema", () => {
  const validRow = {
    id: 1,
    name: "Acme Corp",
    email: "contact@acme.com",
    owner: "John Doe",
    requests: 5,
    status: "approved",
    rate: "★★★☆☆",
    updated: "2024-06-01",
  };

  it("accepts a valid row", () => {
    expect(adminCompanyRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts optional fields with defaults", () => {
    expect(
      adminCompanyRowSchema.safeParse({
        id: 1,
        name: "Acme Corp",
        status: "approved",
        rate: "★★★☆☆",
        updated: "2024-06-01",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(adminCompanyRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive id", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, id: 0 }).success).toBe(false);
    expect(adminCompanyRowSchema.safeParse({ ...validRow, id: -1 }).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validRow;
    expect(adminCompanyRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, name: "" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validRow;
    expect(adminCompanyRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty status", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, status: "" }).success).toBe(false);
  });

  it("rejects missing rate", () => {
    const { rate: _, ...rest } = validRow;
    expect(adminCompanyRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty rate", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, rate: "" }).success).toBe(false);
  });

  it("rejects missing updated", () => {
    const { updated: _, ...rest } = validRow;
    expect(adminCompanyRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty updated", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, updated: "" }).success).toBe(false);
  });

  it("rejects negative requests", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, requests: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyDetailSchema
// ---------------------------------------------------------------------------
describe("adminCompanyDetailSchema", () => {
  const validDetail = {
    company: {
      company_id: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_email: "contact@acme.com",
      company_website: "https://acme.com",
      company_approved_to_hire: true,
      company_hourly_rate: 25.5,
      currency_code: "KWD",
      no_of_active_requests: 3,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
      staff_name: "John",
      staff_email: "john@acme.com",
      country_name_en: "Kuwait",
    },
    metrics: [{ label: "Requests", value: 5, note: "Total" }],
    requests: [{ id: "req-1", title: "Developer needed", subtitle: "Full-time", meta: "Urgent" }],
    contacts: [{ id: "c-1", title: "John Doe", subtitle: "CEO", meta: "john@acme.com" }],
    stores: [{ id: 1, title: "Main Store", subtitle: "Downtown", meta: "Active" }],
    notes: [{ id: "n-1", title: "Follow up", subtitle: "Call next week", meta: "2024-06-15" }],
  };

  it("accepts a valid detail", () => {
    expect(adminCompanyDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null company", () => {
    expect(adminCompanyDetailSchema.safeParse({ ...validDetail, company: null }).success).toBe(true);
  });

  it("accepts nullable company fields as null", () => {
    expect(
      adminCompanyDetailSchema.safeParse({
        ...validDetail,
        company: {
          company_id: 1,
          company_name: "Acme",
          company_common_name_en: null,
          company_email: null,
          company_website: null,
          company_approved_to_hire: null,
          company_hourly_rate: null,
          currency_code: null,
          no_of_active_requests: null,
          company_created_at: null,
          company_updated_at: null,
          staff_name: null,
          staff_email: null,
          country_name_en: null,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      adminCompanyDetailSchema.safeParse({
        ...validDetail,
        metrics: [],
        requests: [],
        contacts: [],
        stores: [],
        notes: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing company", () => {
    const { company: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing contacts", () => {
    const { contacts: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing notes", () => {
    const { notes: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing stores", () => {
    const { stores: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyListResponseSchema
// ---------------------------------------------------------------------------
describe("adminCompanyListResponseSchema", () => {
  const validResponse = {
    items: [
      {
        id: 1,
        name: "Acme Corp",
        status: "approved",
        rate: "★★★☆☆",
        updated: "2024-06-01",
      },
    ],
    total: 1,
    page: 1,
    limit: 60,
    totalPages: 1,
  };

  it("accepts a valid response", () => {
    expect(adminCompanyListResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      adminCompanyListResponseSchema.safeParse({ ...validResponse, items: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResponse;
    expect(adminCompanyListResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(adminCompanyListResponseSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(adminCompanyListResponseSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      adminCompanyListResponseSchema.safeParse({ ...validResponse, totalPages: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyToggleResponseSchema
// ---------------------------------------------------------------------------
describe("adminCompanyToggleResponseSchema", () => {
  it("accepts success response", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      adminCompanyToggleResponseSchema.safeParse({ success: false, error: "Company not found" }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({ success: "yes" }).success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({ success: false, error: 123 }).success).toBe(false);
  });
});
