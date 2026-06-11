import { describe, it, expect } from "vitest";
import {
  listAdminCompaniesSchema,
  getAdminCompanySchema,
  adminCompanyRowSchema,
  adminCompanyDetailSchema,
  adminCompanyListResponseSchema,
  adminCompanyToggleResponseSchema,
} from "./schemas";

describe("listAdminCompaniesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listAdminCompaniesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(60);
      expect(r.data.status).toBe("all");
    }
  });

  it("accepts search query with custom pagination", () => {
    const r = listAdminCompaniesSchema.safeParse({
      q: "Tech",
      page: 2,
      limit: 25,
      status: "approved",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Tech");
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(25);
      expect(r.data.status).toBe("approved");
    }
  });

  it("rejects limit over 100", () => {
    expect(listAdminCompaniesSchema.safeParse({ limit: 999 }).success).toBe(
      false,
    );
  });

  it("rejects invalid status values", () => {
    expect(
      listAdminCompaniesSchema.safeParse({ status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects negative page number", () => {
    expect(listAdminCompaniesSchema.safeParse({ page: -1 }).success).toBe(
      false,
    );
  });

  it("accepts not_approved status filter", () => {
    const r = listAdminCompaniesSchema.safeParse({ status: "not_approved" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("not_approved");
    }
  });
});

describe("getAdminCompanySchema", () => {
  it("accepts a valid company ID", () => {
    const r = getAdminCompanySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("coerces string company ID to number", () => {
    const r = getAdminCompanySchema.safeParse({ companyId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("rejects negative company ID", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: -1 }).success).toBe(
      false,
    );
  });

  it("rejects zero company ID", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: 0 }).success).toBe(
      false,
    );
  });

  it("rejects missing companyId", () => {
    expect(getAdminCompanySchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyRowSchema (output validation)
// ---------------------------------------------------------------------------

describe("adminCompanyRowSchema (output validation)", () => {
  it("accepts a valid company row", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Test Company",
      email: "test@company.com",
      owner: "John",
      requests: 5,
      status: "Approved",
      rate: "10.000 KWD",
      updated: "Jun 10, 2026",
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal fields with defaults", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Test Company",
      status: "Approved",
      rate: "10 KWD",
      updated: "Jun 10, 2026",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("No email");
      expect(r.data.owner).toBe("Unassigned");
      expect(r.data.requests).toBe(0);
    }
  });

  it("rejects missing required id", () => {
    expect(
      adminCompanyRowSchema.safeParse({
        name: "Test",
        status: "OK",
        rate: "10 KWD",
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });

  it("rejects negative id", () => {
    expect(
      adminCompanyRowSchema.safeParse({
        id: -1,
        name: "Test",
        status: "OK",
        rate: "10 KWD",
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      adminCompanyRowSchema.safeParse({
        id: 1,
        name: "",
        status: "OK",
        rate: "10 KWD",
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyDetailSchema (output validation)
// ---------------------------------------------------------------------------

describe("adminCompanyDetailSchema (output validation)", () => {
  const validDetail = {
    company: {
      company_id: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_email: "acme@example.com",
      company_website: "https://acme.com",
      company_approved_to_hire: true,
      company_hourly_rate: 15.5,
      currency_code: "KWD",
      no_of_active_requests: 3,
      company_created_at: new Date("2026-01-01"),
      company_updated_at: new Date("2026-06-10"),
      staff_name: "Admin",
      staff_email: "admin@example.com",
      country_name_en: "Kuwait",
    },
    metrics: [
      { label: "Requests", value: 3, note: "Active" },
      { label: "Rate", value: "15.500 KWD", note: "Hourly" },
    ],
    requests: [
      { id: "req-uuid-1", title: "Engineer", subtitle: "3 seats", meta: "open" },
    ],
    contacts: [
      { id: "contact-uuid-1", title: "Contact Name", subtitle: "email@test.com", meta: "Manager" },
    ],
    stores: [
      { id: 1, title: "Store A", subtitle: "Status 10", meta: "Active store" },
    ],
    notes: [
      { id: "note-uuid-1", title: "Note", subtitle: "Some text", meta: "Jun 10" },
    ],
  };

  it("accepts a valid company detail", () => {
    const r = adminCompanyDetailSchema.safeParse(validDetail);
    expect(r.success).toBe(true);
  });

  it("accepts company as null", () => {
    const r = adminCompanyDetailSchema.safeParse({
      ...validDetail,
      company: null,
    });
    expect(r.success).toBe(true);
  });

  it("provides defaults for optional sub-fields", () => {
    const r = adminCompanyDetailSchema.safeParse({
      company: null,
      metrics: [{ label: "Requests", value: 3, note: "Active" }],
      requests: [{ id: "req-1" }],
      contacts: [{ id: "con-1" }],
      stores: [{ id: 1, title: "Store A" }],
      notes: [{ id: "note-1" }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.requests[0].title).toBe("Untitled request");
      expect(r.data.contacts[0].title).toBe("Contact");
      expect(r.data.notes[0].subtitle).toBe("Empty note");
    }
  });

  it("rejects missing metrics array", () => {
    expect(
      adminCompanyDetailSchema.safeParse({
        company: null,
        requests: [],
        contacts: [],
        stores: [],
        notes: [],
      }).success,
    ).toBe(false);
  });

  it("rejects missing requests array", () => {
    expect(
      adminCompanyDetailSchema.safeParse({
        company: null,
        metrics: [],
        contacts: [],
        stores: [],
        notes: [],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyListResponseSchema (output validation)
// ---------------------------------------------------------------------------

describe("adminCompanyListResponseSchema (output validation)", () => {
  const validResponse = {
    items: [
      {
        id: 1,
        name: "Acme Corp",
        email: "acme@test.com",
        owner: "Owner",
        requests: 3,
        status: "Approved",
        rate: "10.000 KWD",
        updated: "Jun 10, 2026",
      },
    ],
    total: 1,
    page: 1,
    limit: 60,
    totalPages: 1,
  };

  it("accepts a valid list response", () => {
    const r = adminCompanyListResponseSchema.safeParse(validResponse);
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = adminCompanyListResponseSchema.safeParse({
      ...validResponse,
      items: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    expect(
      adminCompanyListResponseSchema.safeParse({
        items: [],
        page: 1,
        limit: 60,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      adminCompanyListResponseSchema.safeParse({
        ...validResponse,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid item in items array", () => {
    const r = adminCompanyListResponseSchema.safeParse({
      ...validResponse,
      items: [{ id: "not-a-number", name: "Bad" }],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyToggleResponseSchema (output validation)
// ---------------------------------------------------------------------------

describe("adminCompanyToggleResponseSchema (output validation)", () => {
  it("accepts success response", () => {
    const r = adminCompanyToggleResponseSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success response with error", () => {
    const r = adminCompanyToggleResponseSchema.safeParse({
      success: false,
      error: "Company not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects response without success field", () => {
    expect(adminCompanyToggleResponseSchema.safeParse({}).success).toBe(false);
  });

  it("rejects response with wrong type for success", () => {
    expect(
      adminCompanyToggleResponseSchema.safeParse({ success: "true" }).success,
    ).toBe(false);
  });
});
