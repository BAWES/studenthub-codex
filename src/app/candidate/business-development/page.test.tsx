import { describe, it, expect } from "vitest";
import {
  businessDevelopmentItemOutputSchema,
  listBusinessDevelopmentResultOutputSchema,
  businessDevelopmentActionResultOutputSchema,
} from "./schemas";

describe("candidate business-development page — data contract", () => {
  it("businessDevelopmentItemOutputSchema validates a valid item", () => {
    const r = businessDevelopmentItemOutputSchema.safeParse({
      company_request_uuid: "uuid-123",
      company_name: "Test Corp",
      company_email: "test@corp.com",
      contact_name: "Ahmed",
      contact_position: "Manager",
      phone_number: "+965****5678",
      requesting_for: "Staffing",
      status: true,
      country_id: 1,
      currency_code: "KWD",
      country_name_en: "Kuwait",
      country_name_ar: "الكويت",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("businessDevelopmentItemOutputSchema rejects missing company_request_uuid", () => {
    const r = businessDevelopmentItemOutputSchema.safeParse({ company_name: "Test" });
    expect(r.success).toBe(false);
  });

  it("listBusinessDevelopmentResultOutputSchema validates paginated list", () => {
    const r = listBusinessDevelopmentResultOutputSchema.safeParse({
      items: [{
        company_request_uuid: "u1", company_name: "C1", company_email: "c1@c.com",
        contact_name: "A", contact_position: null, phone_number: null,
        requesting_for: null, status: null, country_id: null, currency_code: null,
        country_name_en: null, country_name_ar: null, created_at: null, updated_at: null,
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("businessDevelopmentActionResultOutputSchema validates success", () => {
    const r = businessDevelopmentActionResultOutputSchema.safeParse({ success: true, uuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("businessDevelopmentActionResultOutputSchema validates failure", () => {
    const r = businessDevelopmentActionResultOutputSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("businessDevelopmentActionResultOutputSchema rejects invalid discriminant", () => {
    const r = businessDevelopmentActionResultOutputSchema.safeParse({ success: true, error: "extra" });
    expect(r.success).toBe(false);
  });
});
