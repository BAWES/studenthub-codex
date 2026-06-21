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

describe("listCompanyRequestsSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listCompanyRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit values", () => {
    const r = listCompanyRequestsSchema.safeParse({
      page: 2,
      limit: 50,
      status: "pending",
    });
    expect(r.success).toBe(true);
  });

  it("accepts countryId filter", () => {
    expect(listCompanyRequestsSchema.safeParse({ countryId: 1 }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(listCompanyRequestsSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });

  it("rejects rejected status (only pending/approved allowed)", () => {
    expect(listCompanyRequestsSchema.safeParse({ status: "rejected" }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listCompanyRequestsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCompanyRequestsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCompanyRequestsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe("getCompanyRequestSchema", () => {
  it("accepts valid UUID", () => {
    expect(getCompanyRequestSchema.safeParse({ companyRequestUuid: "cr-001" }).success).toBe(true);
  });

  it("rejects missing companyRequestUuid", () => {
    expect(getCompanyRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty companyRequestUuid", () => {
    expect(getCompanyRequestSchema.safeParse({ companyRequestUuid: "" }).success).toBe(false);
  });
});

describe("updateCompanyRequestStatusSchema", () => {
  it("accepts valid input with approve", () => {
    const r = updateCompanyRequestStatusSchema.safeParse({
      companyRequestUuid: "cr-001",
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("accepts pending status", () => {
    const r = updateCompanyRequestStatusSchema.safeParse({
      companyRequestUuid: "cr-001",
      status: "pending",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyRequestUuid", () => {
    expect(updateCompanyRequestStatusSchema.safeParse({ status: "approved" }).success).toBe(false);
  });

  it("rejects empty companyRequestUuid", () => {
    expect(
      updateCompanyRequestStatusSchema.safeParse({ companyRequestUuid: "", status: "approved" }).success,
    ).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(
      updateCompanyRequestStatusSchema.safeParse({ companyRequestUuid: "cr-001", status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects rejected status (only pending/approved)", () => {
    expect(
      updateCompanyRequestStatusSchema.safeParse({ companyRequestUuid: "cr-001", status: "rejected" }).success,
    ).toBe(false);
  });
});

describe("companyRequestRowSchema", () => {
  const validRow = {
    company_request_uuid: "cr-001",
    company_name: "Acme Corp",
    company_email: "admin@acme.com",
    contact_name: "John Doe",
    contact_position: "CEO",
    phone_number: "+96512345678",
    requesting_for: "jobs",
    currency_code: "KWD",
    country_id: 1,
    country_name_en: "Kuwait",
    status: 0,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
  };

  it("accepts a valid row", () => {
    expect(companyRequestRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null fields", () => {
    expect(
      companyRequestRowSchema.safeParse({
        ...validRow,
        company_email: null,
        contact_name: null,
        contact_position: null,
        phone_number: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_request_uuid", () => {
    const { company_request_uuid: _, ...rest } = validRow;
    expect(companyRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty company_request_uuid", () => {
    expect(companyRequestRowSchema.safeParse({ ...validRow, company_request_uuid: "" }).success).toBe(false);
  });
});

describe("listCompanyRequestsOutputSchema", () => {
  it("accepts valid output", () => {
    const r = listCompanyRequestsOutputSchema.safeParse({
      items: [
        {
          company_request_uuid: "cr-001",
          company_name: "Acme Corp",
          company_email: null,
          contact_name: "John",
          contact_position: null,
          phone_number: null,
          requesting_for: null,
          currency_code: null,
          country_id: null,
          country_name_en: null,
          status: 0,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    expect(
      listCompanyRequestsOutputSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listCompanyRequestsOutputSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCompanyRequestsOutputSchema.safeParse({
        items: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

describe("getCompanyRequestOutputSchema", () => {
  it("accepts a valid request", () => {
    const r = getCompanyRequestOutputSchema.safeParse({
      request: {
        company_request_uuid: "cr-001",
        company_name: "Acme Corp",
        company_email: null,
        contact_name: "John",
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_id: null,
        country_name_en: null,
        status: 0,
        created_at: null,
        updated_at: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null request", () => {
    expect(getCompanyRequestOutputSchema.safeParse({ request: null }).success).toBe(true);
  });
});

describe("updateCompanyRequestStatusOutputSchema", () => {
  it("accepts success response", () => {
    expect(
      updateCompanyRequestStatusOutputSchema.safeParse({ operation: "success", message: "Updated" }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      updateCompanyRequestStatusOutputSchema.safeParse({ operation: "error", message: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects unknown operation", () => {
    expect(
      updateCompanyRequestStatusOutputSchema.safeParse({ operation: "invalid", message: "Oops" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(updateCompanyRequestStatusOutputSchema.safeParse({ operation: "success" }).success).toBe(false);
  });
});
