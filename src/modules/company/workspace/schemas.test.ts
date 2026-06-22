import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  findContactByUuidSchema,
  getCompanyLinksForWorkspaceSchema,
  getWorkspaceStatsTxSchema,
  updateContactSchema,
  type ContactResult,
  type CompanyLinkWithCompany,
  type WorkspaceStats,
  type ContactUpdateResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — findContactByUuidSchema
// ---------------------------------------------------------------------------

describe("findContactByUuidSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = findContactByUuidSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty contact UUID", () => {
    const result = findContactByUuidSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contact UUID", () => {
    const result = findContactByUuidSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — getCompanyLinksForWorkspaceSchema
// ---------------------------------------------------------------------------

describe("getCompanyLinksForWorkspaceSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = getCompanyLinksForWorkspaceSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty contact UUID", () => {
    const result = getCompanyLinksForWorkspaceSchema.safeParse({
      contactUuid: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — getWorkspaceStatsTxSchema
// ---------------------------------------------------------------------------

describe("getWorkspaceStatsTxSchema", () => {
  it("accepts an array of company IDs", () => {
    const result = getWorkspaceStatsTxSchema.safeParse({
      companyIds: [1, 2, 3],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty array", () => {
    const result = getWorkspaceStatsTxSchema.safeParse({ companyIds: [] });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive integers", () => {
    const result = getWorkspaceStatsTxSchema.safeParse({
      companyIds: [0, -1],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-array input", () => {
    const result = getWorkspaceStatsTxSchema.safeParse({
      companyIds: "not-an-array",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — updateContactSchema
// ---------------------------------------------------------------------------

describe("updateContactSchema", () => {
  it("accepts valid contact UUID with data", () => {
    const result = updateContactSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
      data: { contact_name: "Updated Name" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty data object", () => {
    const result = updateContactSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
      data: {},
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    const result = updateContactSchema.safeParse({
      data: { contact_name: "Name" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    const result = updateContactSchema.safeParse({
      contactUuid: "",
      data: { contact_name: "Name" },
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type-level tests (compile-time assertions)
// ---------------------------------------------------------------------------

describe("ContactResult type", () => {
  it("accepts a valid contact object", () => {
    const contact: ContactResult = {
      contact_name: "Jane Doe",
      contact_email: "jane@example.com",
    };
    expect(contact.contact_name).toBe("Jane Doe");
  });

  it("accepts null for nullable email", () => {
    const contact: ContactResult = {
      contact_name: "John Smith",
      contact_email: null,
    };
    expect(contact.contact_email).toBeNull();
  });

  it("accepts null contact", () => {
    const contact: ContactResult = null;
    expect(contact).toBeNull();
  });
});

describe("CompanyLinkWithCompany type", () => {
  it("accepts a valid company link", () => {
    const link: CompanyLinkWithCompany = {
      company_contact_uuid: "cc_uuid_1",
      contact_position: "Manager",
      allow_access: true,
      company: {
        company_id: 42,
        company_name: "ACME Corp",
        company_email: "info@acme.com",
        no_of_active_requests: 5,
        company_approved_to_hire: true,
      },
    };
    expect(link.company?.company_name).toBe("ACME Corp");
  });

  it("accepts nullable fields", () => {
    const link: CompanyLinkWithCompany = {
      company_contact_uuid: "cc_uuid_2",
      contact_position: null,
      allow_access: null,
      company: null,
    };
    expect(link.company).toBeNull();
  });
});

describe("WorkspaceStats type", () => {
  it("accepts valid stats", () => {
    const stats: WorkspaceStats = {
      requestCount: 12,
      storeCount: 3,
      noteCount: 8,
      recentRequests: [],
    };
    expect(stats.requestCount).toBe(12);
  });
});

describe("ContactUpdateResult type", () => {
  it("accepts a valid result", () => {
    const result: ContactUpdateResult = {
      contact_uuid: "550e8400-e29b-41d4-a716-446655440000",
    };
    expect(result.contact_uuid).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Zod type inference tests
// ---------------------------------------------------------------------------

describe("inferred types match input schemas", () => {
  it("z.input unwraps correctly for findContactByUuidSchema", () => {
    type Input = z.input<typeof findContactByUuidSchema>;
    const valid: Input = { contactUuid: "abc" };
    const parsed = findContactByUuidSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("z.output unwraps correctly for getWorkspaceStatsTxSchema", () => {
    type Output = z.output<typeof getWorkspaceStatsTxSchema>;
    const valid: Output = { companyIds: [1, 2, 3] };
    const parsed = getWorkspaceStatsTxSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
