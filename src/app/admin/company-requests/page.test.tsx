import { describe, it, expect } from "vitest";
import {
  listCompanyRequestsSchema,
  getCompanyRequestSchema,
  updateCompanyRequestStatusSchema,
  companyRequestRowSchema,
  listCompanyRequestsOutputSchema,
  getCompanyRequestOutputSchema,
  updateCompanyRequestStatusOutputSchema,
} from "./schemas";

/**
 * Page migration test for admin/company-requests.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin company-requests page — data contract", () => {
  it("listCompanyRequestsSchema parses with defaults", () => {
    const r = listCompanyRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listCompanyRequestsSchema accepts filters", () => {
    const r = listCompanyRequestsSchema.safeParse({
      status: "pending",
      countryId: 1,
    });
    expect(r.success).toBe(true);
  });

  it("getCompanyRequestSchema validates with uuid", () => {
    const r = getCompanyRequestSchema.safeParse({
      companyRequestUuid: "req-123",
    });
    expect(r.success).toBe(true);
  });

  it("getCompanyRequestSchema rejects missing uuid", () => {
    const r = getCompanyRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateCompanyRequestStatusSchema validates", () => {
    const r = updateCompanyRequestStatusSchema.safeParse({
      companyRequestUuid: "req-123",
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("companyRequestRowSchema validates a row", () => {
    const r = companyRequestRowSchema.safeParse({
      company_request_uuid: "req-123",
      company_name: "ACME Corp",
      company_email: "info@acme.com",
      contact_name: "John",
      contact_position: "Manager",
      phone_number: "+965 1234 5678",
      requesting_for: "self",
      currency_code: "KWD",
      country_id: 1,
      country_name_en: "Kuwait",
      status: 0,
      created_at: "2026-06-14T08:00:00Z",
      updated_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.company_name).toBe("ACME Corp");
  });

  it("listCompanyRequestsOutputSchema validates paginated output", () => {
    const r = listCompanyRequestsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});
