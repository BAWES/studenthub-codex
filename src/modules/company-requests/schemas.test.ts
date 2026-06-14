import { describe, it, expect } from "vitest";
import {
  companyRequestItemSchema,
  listCompanyRequestsResultSchema,
  companyRequestMutationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// companyRequestItemSchema
// ---------------------------------------------------------------------------
describe("companyRequestItemSchema", () => {
  const valid = {
    company_request_uuid: "uuid-001",
    company_name: "Acme Corp",
    company_email: "contact@acme.com",
    contact_name: "John Doe",
    contact_position: "Manager",
    phone_number: "+965 1234 5678",
    requesting_for: "Internships",
    status: true,
    currency_code: "KWD",
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-13T12:00:00.000Z",
  };

  it("accepts a valid company request item", () => {
    expect(companyRequestItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      companyRequestItemSchema.safeParse({
        ...valid,
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        status: null,
        currency_code: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_request_uuid", () => {
    const { company_request_uuid: _, ...rest } = valid;
    expect(companyRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = valid;
    expect(companyRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing contact_name", () => {
    const { contact_name: _, ...rest } = valid;
    expect(companyRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string company_email", () => {
    expect(
      companyRequestItemSchema.safeParse({ ...valid, company_email: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-boolean status", () => {
    expect(
      companyRequestItemSchema.safeParse({ ...valid, status: "yes" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanyRequestsResultSchema
// ---------------------------------------------------------------------------
describe("listCompanyRequestsResultSchema", () => {
  const valid = () => ({
    requests: [
      {
        company_request_uuid: "uuid-001",
        company_name: "Acme Corp",
        company_email: "contact@acme.com",
        contact_name: "John Doe",
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        status: null,
        currency_code: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listCompanyRequestsResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty requests array", () => {
    expect(
      listCompanyRequestsResultSchema.safeParse({ ...valid(), requests: [] }).success,
    ).toBe(true);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = valid();
    expect(listCompanyRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listCompanyRequestsResultSchema.safeParse({ ...valid(), total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCompanyRequestsResultSchema.safeParse({ ...valid(), page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      listCompanyRequestsResultSchema.safeParse({ ...valid(), limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      listCompanyRequestsResultSchema.safeParse({ ...valid(), limit: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyRequestMutationResultSchema
// ---------------------------------------------------------------------------
describe("companyRequestMutationResultSchema", () => {
  const valid = { operation: "approve", message: "Request approved" };

  it("accepts a valid mutation result with message", () => {
    expect(companyRequestMutationResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a valid mutation result without message", () => {
    expect(
      companyRequestMutationResultSchema.safeParse({ operation: "reject" }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = valid;
    expect(companyRequestMutationResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string operation", () => {
    expect(
      companyRequestMutationResultSchema.safeParse({ ...valid, operation: 42 }).success,
    ).toBe(false);
  });
});
