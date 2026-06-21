import { describe, it, expect } from "vitest";
import {
  listAdminCompaniesSchema,
  getAdminCompanySchema,
  adminCompanyRowSchema,
  adminCompanyListResponseSchema,
  adminCompanyDetailSchema,
  adminCompanyToggleResponseSchema,
} from "./schemas";

/**
 * Page migration test for admin/companies.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin companies page — data contract", () => {
  it("listAdminCompaniesSchema parses with defaults", () => {
    const r = listAdminCompaniesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(60);
      expect(r.data.status).toBe("all");
    }
  });

  it("listAdminCompaniesSchema accepts filters", () => {
    const r = listAdminCompaniesSchema.safeParse({
      q: "acme",
      status: "approved",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("acme");
      expect(r.data.status).toBe("approved");
    }
  });

  it("getAdminCompanySchema validates with companyId", () => {
    const r = getAdminCompanySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
  });

  it("getAdminCompanySchema rejects missing companyId", () => {
    const r = getAdminCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("adminCompanyRowSchema validates a row with all fields", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Acme Corp",
      email: "acme@test.com",
      owner: "John Doe",
      requests: 5,
      status: "approved",
      rate: "5 KWD/hr",
      updated: "2026-06-14",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe(1);
      expect(r.data.name).toBe("Acme Corp");
    }
  });

  it("adminCompanyRowSchema applies defaults for optional fields", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 2,
      name: "Beta Inc",
      status: "not_approved",
      rate: "3 KWD/hr",
      updated: "2026-06-13",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("No email");
      expect(r.data.owner).toBe("Unassigned");
      expect(r.data.requests).toBe(0);
    }
  });

  it("adminCompanyRowSchema rejects missing required id", () => {
    const r = adminCompanyRowSchema.safeParse({
      name: "Acme Corp",
      status: "approved",
      rate: "5 KWD/hr",
      updated: "2026-06-14",
    });
    expect(r.success).toBe(false);
  });

  it("adminCompanyRowSchema rejects missing required name", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      status: "approved",
      rate: "5 KWD/hr",
      updated: "2026-06-14",
    });
    expect(r.success).toBe(false);
  });

  it("adminCompanyRowSchema rejects missing required status", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Acme Corp",
      rate: "5 KWD/hr",
      updated: "2026-06-14",
    });
    expect(r.success).toBe(false);
  });

  it("adminCompanyRowSchema rejects missing required rate", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Acme Corp",
      status: "approved",
      updated: "2026-06-14",
    });
    expect(r.success).toBe(false);
  });

  it("adminCompanyRowSchema rejects missing required updated", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Acme Corp",
      status: "approved",
      rate: "5 KWD/hr",
    });
    expect(r.success).toBe(false);
  });

  it("adminCompanyListResponseSchema validates paginated result", () => {
    const r = adminCompanyListResponseSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 60,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("adminCompanyListResponseSchema validates with items", () => {
    const r = adminCompanyListResponseSchema.safeParse({
      items: [
        {
          id: 1,
          name: "Acme Corp",
          email: "acme@test.com",
          owner: "John Doe",
          requests: 3,
          status: "approved",
          rate: "5 KWD/hr",
          updated: "2026-06-14",
        },
      ],
      total: 1,
      page: 1,
      limit: 60,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.items.length).toBe(1);
      expect(r.data.total).toBe(1);
    }
  });

  it("adminCompanyToggleResponseSchema validates success", () => {
    const r = adminCompanyToggleResponseSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("adminCompanyToggleResponseSchema validates failure with error", () => {
    const r = adminCompanyToggleResponseSchema.safeParse({
      success: false,
      error: "Company not found",
    });
    expect(r.success).toBe(true);
  });

  it("adminCompanyDetailSchema validates with nullable company", () => {
    const r = adminCompanyDetailSchema.safeParse({
      company: null,
      metrics: [],
      requests: [],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("adminCompanyDetailSchema validates with full data", () => {
    const r = adminCompanyDetailSchema.safeParse({
      company: {
        company_id: 1,
        company_name: "Acme Corp",
        company_common_name_en: "Acme",
        company_email: "acme@test.com",
        company_website: "https://acme.com",
        company_approved_to_hire: true,
        company_hourly_rate: 5.0,
        currency_code: "KWD",
        no_of_active_requests: 3,
        company_created_at: new Date("2026-01-01"),
        company_updated_at: new Date("2026-06-14"),
        staff_name: "John Doe",
        staff_email: "john@acme.com",
        country_name_en: "Kuwait",
      },
      metrics: [
        { label: "Total Requests", value: 15, note: "All time" },
      ],
      requests: [
        { id: "req-001", title: "Software Engineer", subtitle: "Active", meta: "2 candidates" },
      ],
      contacts: [
        { id: "cnt-001", title: "HR Manager", subtitle: "hr@acme.com", meta: "Primary" },
      ],
      stores: [
        { id: 1, title: "Main Branch", subtitle: "Kuwait City", meta: "Active" },
      ],
      notes: [
        { id: "note-001", title: "Follow up", subtitle: "Call back in 2 weeks", meta: "2026-06-14" },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company?.company_name).toBe("Acme Corp");
      expect(r.data.metrics.length).toBe(1);
      expect(r.data.requests.length).toBe(1);
    }
  });

  it("adminCompanyDetailSchema accepts nullable nested fields", () => {
    const r = adminCompanyDetailSchema.safeParse({
      company: {
        company_id: 1,
        company_name: "Acme Corp",
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
      metrics: [],
      requests: [],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(true);
  });
});
