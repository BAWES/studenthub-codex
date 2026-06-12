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
      listAdminCompaniesSchema.safeParse({ page: 2, limit: 30, q: "acme", status: "approved" }).success,
    ).toBe(true);
  });

  it("accepts status 'all'", () => {
    expect(listAdminCompaniesSchema.safeParse({ status: "all" }).success).toBe(true);
  });

  it("accepts status 'not_approved'", () => {
    expect(listAdminCompaniesSchema.safeParse({ status: "not_approved" }).success).toBe(true);
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

  it("rejects negative page", () => {
    expect(listAdminCompaniesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listAdminCompaniesSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAdminCompanySchema
// ---------------------------------------------------------------------------
describe("getAdminCompanySchema", () => {
  it("accepts a valid companyId", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: 1 }).success).toBe(true);
  });

  it("accepts coerced string", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: "5" }).success).toBe(true);
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
    email: "admin@acme.com",
    owner: "John Doe",
    requests: 5,
    status: "approved",
    rate: "$50/hr",
    updated: "2026-06-15",
  };

  it("accepts a valid row", () => {
    expect(adminCompanyRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts optional fields with defaults", () => {
    expect(
      adminCompanyRowSchema.safeParse({ id: 1, name: "Acme", status: "active", rate: "$40", updated: "today" }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(adminCompanyRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, id: -1 }).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, id: "abc" }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, name: "" }).success).toBe(false);
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
      company_common_name_en: null,
      company_email: "admin@acme.com",
      company_website: null,
      company_approved_to_hire: true,
      company_hourly_rate: 50,
      currency_code: "KWD",
      no_of_active_requests: 3,
      company_created_at: new Date("2026-01-01"),
      company_updated_at: new Date("2026-06-15"),
      staff_name: "John",
      staff_email: "john@acme.com",
      country_name_en: "Kuwait",
    },
    metrics: [{ label: "Revenue", value: "$100k", note: "YTD" }],
    requests: [{ id: "r-1", title: "New Hire" }],
    contacts: [{ id: "c-1", title: "John" }],
    stores: [{ id: 1, title: "Store 5" }],
    notes: [{ id: "n-1", title: "Note" }],
  };

  it("accepts a valid company detail", () => {
    expect(adminCompanyDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null company", () => {
    expect(adminCompanyDetailSchema.safeParse({ ...validDetail, company: null }).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      adminCompanyDetailSchema.safeParse({
        ...validDetail,
        company: null,
        metrics: [],
        requests: [],
        contacts: [],
        stores: [],
        notes: [],
      }).success,
    ).toBe(true);
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

  it("rejects missing stores", () => {
    const { stores: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing notes", () => {
    const { notes: _, ...rest } = validDetail;
    expect(adminCompanyDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyListResponseSchema (paginated)
// ---------------------------------------------------------------------------
describe("adminCompanyListResponseSchema", () => {
  const validResponse = {
    items: [{ id: 1, name: "Acme", status: "active", rate: "$50", updated: "today" }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated response", () => {
    expect(adminCompanyListResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty items", () => {
    expect(
      adminCompanyListResponseSchema.safeParse({ ...validResponse, items: [], total: 0, totalPages: 0 }).success,
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
    expect(adminCompanyListResponseSchema.safeParse({ ...validResponse, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyToggleResponseSchema
// ---------------------------------------------------------------------------
describe("adminCompanyToggleResponseSchema", () => {
  it("accepts success: true", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts success: false with error", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({ success: false, error: "Something went wrong" }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({ success: "yes" }).success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({ success: true, error: 123 }).success).toBe(false);
  });
});
