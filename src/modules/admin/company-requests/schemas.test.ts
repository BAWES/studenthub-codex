import { describe, it, expect } from "vitest";
import {
  companyRequestRowSchema,
  listCompanyRequestsOutputSchema,
  getCompanyRequestOutputSchema,
  updateCompanyRequestStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// companyRequestRowSchema
// ---------------------------------------------------------------------------
describe("companyRequestRowSchema", () => {
  const validRow = {
    company_request_uuid: "cr-001-abc-def",
    company_name: "Acme Corp",
    company_email: "hr@acme.com",
    contact_name: "John Doe",
    contact_position: "HR Manager",
    phone_number: "+971501234567",
    requesting_for: "self",
    currency_code: "AED",
    country_id: 1,
    country_name_en: "United Arab Emirates",
    status: 0,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  };

  it("accepts a valid row", () => {
    expect(companyRequestRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      companyRequestRowSchema.safeParse({
        company_request_uuid: "cr-002",
        company_name: null,
        company_email: null,
        contact_name: null,
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_id: null,
        country_name_en: null,
        status: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts approved status", () => {
    expect(companyRequestRowSchema.safeParse({ ...validRow, status: 1 }).success).toBe(true);
  });

  it("rejects missing company_request_uuid", () => {
    const { company_request_uuid: _, ...rest } = validRow;
    expect(companyRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty company_request_uuid", () => {
    expect(companyRequestRowSchema.safeParse({ ...validRow, company_request_uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type for country_id", () => {
    expect(companyRequestRowSchema.safeParse({ ...validRow, country_id: "one" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanyRequestsOutputSchema
// ---------------------------------------------------------------------------
describe("listCompanyRequestsOutputSchema", () => {
  const validOutput = {
    items: [
      {
        company_request_uuid: "cr-001",
        company_name: null,
        company_email: null,
        contact_name: null,
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_id: null,
        country_name_en: null,
        status: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list output", () => {
    expect(listCompanyRequestsOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCompanyRequestsOutputSchema.safeParse({ ...validOutput, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validOutput;
    expect(listCompanyRequestsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listCompanyRequestsOutputSchema.safeParse({ ...validOutput, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCompanyRequestsOutputSchema.safeParse({ ...validOutput, page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyRequestOutputSchema
// ---------------------------------------------------------------------------
describe("getCompanyRequestOutputSchema", () => {
  it("accepts a valid request detail", () => {
    expect(
      getCompanyRequestOutputSchema.safeParse({
        request: {
          company_request_uuid: "cr-001",
          company_name: "Acme",
          company_email: "hr@acme.com",
          contact_name: "John",
          contact_position: "HR",
          phone_number: "+971501234567",
          requesting_for: "self",
          currency_code: "AED",
          country_id: 1,
          country_name_en: "UAE",
          status: 0,
          created_at: null,
          updated_at: null,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts null request", () => {
    expect(getCompanyRequestOutputSchema.safeParse({ request: null }).success).toBe(true);
  });

  it("rejects missing request key", () => {
    expect(getCompanyRequestOutputSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanyRequestStatusOutputSchema
// ---------------------------------------------------------------------------
describe("updateCompanyRequestStatusOutputSchema", () => {
  it("accepts success response", () => {
    expect(updateCompanyRequestStatusOutputSchema.safeParse({ operation: "success", message: "Approved" }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(updateCompanyRequestStatusOutputSchema.safeParse({ operation: "error", message: "Cannot approve" }).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(updateCompanyRequestStatusOutputSchema.safeParse({ message: "No op" }).success).toBe(false);
  });

  it("rejects invalid operation", () => {
    expect(updateCompanyRequestStatusOutputSchema.safeParse({ operation: "maybe", message: "Bad" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(updateCompanyRequestStatusOutputSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});
