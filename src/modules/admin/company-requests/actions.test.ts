import { describe, it, expect } from "vitest";

import {
  listCompanyRequestsSchema,
  getCompanyRequestSchema,
  updateCompanyRequestStatusSchema,
  companyRequestRowSchema,
  listCompanyRequestsOutputSchema,
  getCompanyRequestOutputSchema,
  updateCompanyRequestStatusOutputSchema,
  type CompanyRequestRow,
  type ListCompanyRequestsOutput,
  type GetCompanyRequestOutput,
  type UpdateCompanyRequestStatusOutput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listCompanyRequestsSchema
// ---------------------------------------------------------------------------

describe("listCompanyRequestsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listCompanyRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.countryId).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts explicit page, limit, countryId, and status", () => {
    const result = listCompanyRequestsSchema.safeParse({
      page: "2",
      limit: "50",
      countryId: "5",
      status: "pending",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
      expect(result.data.countryId).toBe(5);
      expect(result.data.status).toBe("pending");
    }
  });

  it("accepts approved status filter", () => {
    const result = listCompanyRequestsSchema.safeParse({ status: "approved" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("approved");
  });

  it("rejects invalid status value", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects page less than 1", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ page: "0" }).success,
    ).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ limit: "101" }).success,
    ).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ limit: "0" }).success,
    ).toBe(false);
  });

  it("rejects non-positive countryId", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ countryId: "0" }).success,
    ).toBe(false);
  });

  it("coerces string page and countryId to numbers", () => {
    const result = listCompanyRequestsSchema.safeParse({
      page: "3",
      countryId: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.countryId).toBe(10);
    }
  });
});

// ---------------------------------------------------------------------------
// Input schema: getCompanyRequestSchema
// ---------------------------------------------------------------------------

describe("getCompanyRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = getCompanyRequestSchema.safeParse({
      companyRequestUuid: "req-123",
    });
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data.companyRequestUuid).toBe("req-123");
  });

  it("rejects empty UUID", () => {
    expect(
      getCompanyRequestSchema.safeParse({ companyRequestUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing companyRequestUuid", () => {
    expect(getCompanyRequestSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateCompanyRequestStatusSchema
// ---------------------------------------------------------------------------

describe("updateCompanyRequestStatusSchema", () => {
  it("accepts valid approved status", () => {
    const result = updateCompanyRequestStatusSchema.safeParse({
      companyRequestUuid: "req-123",
      status: "approved",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyRequestUuid).toBe("req-123");
      expect(result.data.status).toBe("approved");
    }
  });

  it("accepts pending status", () => {
    const result = updateCompanyRequestStatusSchema.safeParse({
      companyRequestUuid: "req-123",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      updateCompanyRequestStatusSchema.safeParse({
        companyRequestUuid: "req-123",
        status: "rejected",
      }).success,
    ).toBe(false);
  });

  it("rejects empty companyRequestUuid", () => {
    expect(
      updateCompanyRequestStatusSchema.safeParse({
        companyRequestUuid: "",
        status: "approved",
      }).success,
    ).toBe(false);
  });

  it("rejects missing companyRequestUuid", () => {
    expect(
      updateCompanyRequestStatusSchema.safeParse({ status: "approved" })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: companyRequestRowSchema
// ---------------------------------------------------------------------------

describe("companyRequestRowSchema", () => {
  it("accepts a valid row with all fields", () => {
    const result = companyRequestRowSchema.safeParse({
      company_request_uuid: "cr-001",
      company_name: "Acme Corp",
      company_email: "acme@example.com",
      contact_name: "John",
      contact_position: "Manager",
      phone_number: "+965****0000",
      requesting_for: "self",
      currency_code: "KWD",
      country_id: 1,
      country_name_en: "Kuwait",
      status: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a row with null fields", () => {
    const result = companyRequestRowSchema.safeParse({
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
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company_request_uuid", () => {
    expect(
      companyRequestRowSchema.safeParse({
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
    ).toBe(false);
  });

  it("rejects empty company_request_uuid", () => {
    expect(
      companyRequestRowSchema.safeParse({
        company_request_uuid: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listCompanyRequestsOutputSchema
// ---------------------------------------------------------------------------

describe("listCompanyRequestsOutputSchema", () => {
  const validRow = {
    company_request_uuid: "cr-001",
    company_name: "Acme",
    company_email: "acme@test.com",
    contact_name: null,
    contact_position: null,
    phone_number: null,
    requesting_for: null,
    currency_code: null,
    country_id: null,
    country_name_en: null,
    status: 0,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid list result", () => {
    const result = listCompanyRequestsOutputSchema.safeParse({
      items: [validRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items).toHaveLength(1);
  });

  it("accepts empty results", () => {
    const result = listCompanyRequestsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
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

  it("rejects missing items array", () => {
    expect(
      listCompanyRequestsOutputSchema.safeParse({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive page", () => {
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

// ---------------------------------------------------------------------------
// Output schema: getCompanyRequestOutputSchema
// ---------------------------------------------------------------------------

describe("getCompanyRequestOutputSchema", () => {
  it("accepts a valid request", () => {
    const result = getCompanyRequestOutputSchema.safeParse({
      request: {
        company_request_uuid: "cr-001",
        company_name: "Acme",
        company_email: "acme@test.com",
        contact_name: null,
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
    expect(result.success).toBe(true);
  });

  it("accepts null request (not found)", () => {
    const result = getCompanyRequestOutputSchema.safeParse({ request: null });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema: updateCompanyRequestStatusOutputSchema
// ---------------------------------------------------------------------------

describe("updateCompanyRequestStatusOutputSchema", () => {
  it("accepts a success response", () => {
    const result = updateCompanyRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = updateCompanyRequestStatusOutputSchema.safeParse({
      operation: "error",
      message: "Failed to update",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateCompanyRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateCompanyRequestStatusOutputSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      updateCompanyRequestStatusOutputSchema.safeParse({
        operation: "error",
        message: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("CompanyRequestRow type shape", () => {
  it("conforms to expected structure", () => {
    const row: CompanyRequestRow = {
      company_request_uuid: "cr-001",
      company_name: "Acme",
      company_email: "acme@test.com",
      contact_name: null,
      contact_position: null,
      phone_number: null,
      requesting_for: null,
      currency_code: null,
      country_id: null,
      country_name_en: null,
      status: 0,
      created_at: null,
      updated_at: null,
    };
    expect(row.company_request_uuid).toBe("cr-001");
    expect(row.status).toBe(0);
  });

  it("supports null fields", () => {
    const row: CompanyRequestRow = {
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
    };
    expect(row.contact_name).toBeNull();
  });
});

describe("ListCompanyRequestsOutput type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListCompanyRequestsOutput = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
  });
});

describe("GetCompanyRequestOutput type shape", () => {
  it("supports found request", () => {
    const row: CompanyRequestRow = {
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
    };
    const r: GetCompanyRequestOutput = { request: row };
    expect(r.request).not.toBeNull();
  });

  it("supports null request", () => {
    const r: GetCompanyRequestOutput = { request: null };
    expect(r.request).toBeNull();
  });
});

describe("UpdateCompanyRequestStatusOutput type shape", () => {
  it("supports success", () => {
    const r: UpdateCompanyRequestStatusOutput = {
      operation: "success",
      message: "Updated",
    };
    expect(r.operation).toBe("success");
  });

  it("supports error", () => {
    const r: UpdateCompanyRequestStatusOutput = {
      operation: "error",
      message: "Failed",
    };
    expect(r.operation).toBe("error");
  });
});
