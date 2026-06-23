import { describe, it, expect } from "vitest";
import {
  listCompanyRequestsSchema,
  getCompanyRequestSchema,
  approveCompanyRequestSchema,
  rejectCompanyRequestSchema,
  createCompanyRequestSchema,
  updateCompanyRequestSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCompanyRequestsSchema
// ---------------------------------------------------------------------------

describe("listCompanyRequestsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listCompanyRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts custom pagination", () => {
    const result = listCompanyRequestsSchema.safeParse({
      page: 2,
      limit: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts status filter as boolean string", () => {
    const result = listCompanyRequestsSchema.safeParse({
      status: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(true);
    }
  });

  it("coerces string numbers", () => {
    const result = listCompanyRequestsSchema.safeParse({
      page: "3",
      limit: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects page 0", () => {
    const result = listCompanyRequestsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCompanyRequestsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit 0", () => {
    const result = listCompanyRequestsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const result = listCompanyRequestsSchema.safeParse({ limit: 150 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyRequestSchema
// ---------------------------------------------------------------------------

describe("getCompanyRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = getCompanyRequestSchema.safeParse({
      uuid: "req-uuid-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getCompanyRequestSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getCompanyRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveCompanyRequestSchema
// ---------------------------------------------------------------------------

describe("approveCompanyRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = approveCompanyRequestSchema.safeParse({
      uuid: "abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = approveCompanyRequestSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rejectCompanyRequestSchema
// ---------------------------------------------------------------------------

describe("rejectCompanyRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = rejectCompanyRequestSchema.safeParse({
      uuid: "def-456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = rejectCompanyRequestSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("CompanyRequestItem type shape", () => {
  type CompanyRequestItem = {
    company_request_uuid: string;
    company_name: string;
    company_email: string;
    contact_name: string;
    contact_position: string | null;
    phone_number: string | null;
    requesting_for: string | null;
    status: boolean | null;
    currency_code: string | null;
    created_at: string | null;
    updated_at: string | null;
  };

  it("shapes a complete item", () => {
    const item: CompanyRequestItem = {
      company_request_uuid: "uuid-1",
      company_name: "Acme Corp",
      company_email: "admin@acme.com",
      contact_name: "John Doe",
      contact_position: "HR Manager",
      phone_number: "+965 5555 1234",
      requesting_for: "staffing",
      status: false,
      currency_code: "KWD",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: null,
    };
    expect(item.company_name).toBe("Acme Corp");
    expect(item.status).toBe(false);
    expect(item.contact_position).toBe("HR Manager");
  });

  it("allows null contact_position", () => {
    const item: CompanyRequestItem = {
      company_request_uuid: "uuid-2",
      company_name: "Beta LLC",
      company_email: "info@beta.com",
      contact_name: "Jane",
      contact_position: null,
      phone_number: null,
      requesting_for: null,
      status: true,
      currency_code: null,
      created_at: null,
      updated_at: null,
    };
    expect(item.contact_position).toBeNull();
    expect(item.phone_number).toBeNull();
  });
});

describe("ListCompanyRequestsResult shape", () => {
  it("calculates totalPages", () => {
    const total = 55;
    const limit = 20;
    const totalPages = Math.ceil(total / limit);
    expect(totalPages).toBe(3);
  });

  it("handles zero total", () => {
    const totalPages = Math.ceil(0 / 20);
    expect(totalPages).toBe(0);
  });
});

describe("CompanyRequestMutationResult shape", () => {
  it("shapes a success result", () => {
    const result: { operation: string; message?: string } = {
      operation: "success",
      message: "Company request approved",
    };
    expect(result.operation).toBe("success");
  });

  it("shapes an error result", () => {
    const result: { operation: string; message?: string } = {
      operation: "error",
      message: "Company request not found",
    };
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// createCompanyRequestSchema
// ---------------------------------------------------------------------------

describe("createCompanyRequestSchema", () => {
  it("accepts valid create params with required fields only", () => {
    const result = createCompanyRequestSchema.safeParse({
      company_name: "Acme Corp",
      company_email: "admin@acme.com",
      contact_name: "John Doe",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_name).toBe("Acme Corp");
      expect(result.data.company_email).toBe("admin@acme.com");
      expect(result.data.contact_name).toBe("John Doe");
    }
  });

  it("accepts all optional fields", () => {
    const result = createCompanyRequestSchema.safeParse({
      company_name: "Beta LLC",
      company_email: "info@beta.com",
      contact_name: "Jane Smith",
      contact_position: "HR Manager",
      phone_number: "+965 5555 1234",
      requesting_for: "staffing",
      currency_code: "USD",
      country_id: 1,
      contact_receive_email: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company_name", () => {
    const result = createCompanyRequestSchema.safeParse({
      company_email: "admin@acme.com",
      contact_name: "John",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing company_email", () => {
    const result = createCompanyRequestSchema.safeParse({
      company_name: "Acme Corp",
      contact_name: "John",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = createCompanyRequestSchema.safeParse({
      company_name: "Acme Corp",
      company_email: "not-an-email",
      contact_name: "John",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty contact_name", () => {
    const result = createCompanyRequestSchema.safeParse({
      company_name: "Acme",
      company_email: "admin@acme.com",
      contact_name: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanyRequestSchema
// ---------------------------------------------------------------------------

describe("updateCompanyRequestSchema", () => {
  it("accepts UUID with partial fields", () => {
    const result = updateCompanyRequestSchema.safeParse({
      uuid: "req-uuid-123",
      company_name: "Acme Corp Updated",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("req-uuid-123");
      expect(result.data.company_name).toBe("Acme Corp Updated");
    }
  });

  it("accepts UUID with multiple update fields", () => {
    const result = updateCompanyRequestSchema.safeParse({
      uuid: "req-uuid-456",
      company_name: "Beta LLC",
      company_email: "new@beta.com",
      contact_name: "Jane Updated",
      status: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = updateCompanyRequestSchema.safeParse({
      uuid: "",
      company_name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateCompanyRequestSchema.safeParse({
      company_name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects status as non-boolean", () => {
    const result = updateCompanyRequestSchema.safeParse({
      uuid: "uuid-1",
      status: "yes",
    });
    expect(result.success).toBe(false);
  });
});
