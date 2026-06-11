import { describe, it, expect } from "vitest";
import {
  listComplianceRecordsSchema,
  getComplianceRecordSchema,
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
  approveComplianceSchema,
  denyComplianceSchema,
  complianceRowSchema,
  complianceSummarySchema,
  companyComplianceDetailSchema,
  idRequestComplianceDetailSchema,
  listComplianceRecordsResponseSchema,
  complianceMutationResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listComplianceRecordsSchema
// ---------------------------------------------------------------------------

describe("listComplianceRecordsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listComplianceRecordsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.type).toBe("all");
    }
  });

  it("accepts type filter", () => {
    const r = listComplianceRecordsSchema.safeParse({ type: "company" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.type).toBe("company");
  });

  it("accepts status filter", () => {
    const r = listComplianceRecordsSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const r = listComplianceRecordsSchema.safeParse({ type: "invalid" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("getComplianceRecordSchema", () => {
  it("accepts valid id + type", () => {
    const r = getComplianceRecordSchema.safeParse({
      id: "42",
      type: "company",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = getComplianceRecordSchema.safeParse({ type: "company" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const r = getComplianceRecordSchema.safeParse({
      id: "42",
      type: "invalid",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("createComplianceRecordSchema", () => {
  it("accepts valid company data", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Acme Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_approved_to_hire).toBe(false);
    }
  });

  it("accepts all fields", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Acme Corp",
      company_email: "info@acme.example.com",
      company_approved_to_hire: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_name", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Acme Corp",
      company_email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("updateComplianceRecordSchema", () => {
  it("accepts valid company update", () => {
    const r = updateComplianceRecordSchema.safeParse({
      id: "42",
      type: "company",
      company_approved_to_hire: true,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.company_approved_to_hire).toBe(true);
  });

  it("rejects missing id", () => {
    const r = updateComplianceRecordSchema.safeParse({
      type: "company",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const r = updateComplianceRecordSchema.safeParse({
      id: "42",
      type: "id_request",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveComplianceSchema
// ---------------------------------------------------------------------------

describe("approveComplianceSchema", () => {
  it("accepts valid company approve", () => {
    const r = approveComplianceSchema.safeParse({
      id: "42",
      type: "company",
    });
    expect(r.success).toBe(true);
  });

  it("accepts valid id_request approve", () => {
    const r = approveComplianceSchema.safeParse({
      id: "uuid-12345",
      type: "id_request",
    });
    expect(r.success).toBe(true);
  });

  it("rejects candidate type", () => {
    const r = approveComplianceSchema.safeParse({
      id: "42",
      type: "candidate",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = approveComplianceSchema.safeParse({ type: "company" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// denyComplianceSchema
// ---------------------------------------------------------------------------

describe("denyComplianceSchema", () => {
  it("accepts valid deny with reason", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
      reason: "Missing documentation",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing reason", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty reason", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
      reason: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects reason over 2000 chars", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
      reason: "x".repeat(2001),
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceRowSchema — output validation
// ---------------------------------------------------------------------------

describe("complianceRowSchema (output)", () => {
  it("accepts a valid compliance row", () => {
    const r = complianceRowSchema.safeParse({
      id: "company-1",
      type: "company",
      title: "Acme Corp",
      subtitle: "info@acme.example.com",
      status: "Approved",
      updated: "2024-01-15",
    });
    expect(r.success).toBe(true);
  });

  it("accepts all three types", () => {
    const r1 = complianceRowSchema.safeParse({ id: "c-1", type: "company", title: "t", subtitle: "s", status: "ok", updated: "d" });
    const r2 = complianceRowSchema.safeParse({ id: "c-2", type: "id_request", title: "t", subtitle: "s", status: "ok", updated: "d" });
    const r3 = complianceRowSchema.safeParse({ id: "c-3", type: "candidate", title: "t", subtitle: "s", status: "ok", updated: "d" });
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const r = complianceRowSchema.safeParse({ id: "c-1", type: "invalid", title: "t", subtitle: "s", status: "ok", updated: "d" });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = complianceRowSchema.safeParse({ id: "c-1" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceSummarySchema — output validation
// ---------------------------------------------------------------------------

describe("complianceSummarySchema (output)", () => {
  it("accepts valid summary", () => {
    const r = complianceSummarySchema.safeParse({
      totalCompanies: 100,
      unapprovedCompanies: 5,
      pendingIdRequests: 3,
      unapprovedCandidates: 12,
      incompleteCandidates: 7,
    });
    expect(r.success).toBe(true);
  });

  it("accepts all zeros", () => {
    const r = complianceSummarySchema.safeParse({
      totalCompanies: 0,
      unapprovedCompanies: 0,
      pendingIdRequests: 0,
      unapprovedCandidates: 0,
      incompleteCandidates: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative numbers", () => {
    const r = complianceSummarySchema.safeParse({
      totalCompanies: -1,
      unapprovedCompanies: 0,
      pendingIdRequests: 0,
      unapprovedCandidates: 0,
      incompleteCandidates: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const r = complianceSummarySchema.safeParse({ totalCompanies: 100 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listComplianceRecordsResponseSchema — output validation
// ---------------------------------------------------------------------------

describe("listComplianceRecordsResponseSchema (output)", () => {
  it("accepts valid list response", () => {
    const r = listComplianceRecordsResponseSchema.safeParse({
      items: [{ id: "c-1", type: "company", title: "Acme", subtitle: "e@e.com", status: "Approved", updated: "2024-01-15" }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      summary: { totalCompanies: 1, unapprovedCompanies: 0, pendingIdRequests: 0, unapprovedCandidates: 0, incompleteCandidates: 0 },
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = listComplianceRecordsResponseSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      summary: { totalCompanies: 0, unapprovedCompanies: 0, pendingIdRequests: 0, unapprovedCandidates: 0, incompleteCandidates: 0 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing summary", () => {
    const r = listComplianceRecordsResponseSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceMutationResponseSchema — output validation
// ---------------------------------------------------------------------------

describe("complianceMutationResponseSchema (output)", () => {
  it("accepts valid mutation response", () => {
    const r = complianceMutationResponseSchema.safeParse({ id: "company-42", type: "company" });
    expect(r.success).toBe(true);
  });

  it("accepts id_request type", () => {
    const r = complianceMutationResponseSchema.safeParse({ id: "uuid-123", type: "id_request" });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = complianceMutationResponseSchema.safeParse({ type: "company" });
    expect(r.success).toBe(false);
  });

  it("rejects missing type", () => {
    const r = complianceMutationResponseSchema.safeParse({ id: "company-42" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyComplianceDetailSchema — output validation
// ---------------------------------------------------------------------------

describe("companyComplianceDetailSchema (output)", () => {
  const validCompanyDetail = {
    type: "company" as const,
    company: {
      company_id: 1,
      company_name: "Acme Corp",
      company_email: "info@acme.example.com",
      company_approved_to_hire: true,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
      staff_name: "John Doe",
      country_name_en: "Kuwait",
      no_of_active_requests: 3,
    },
    metrics: [
      { label: "Approved to Hire", value: "Yes", note: "Status" },
      { label: "Active Requests", value: 3, note: "Count" },
    ],
    idRequests: [
      { id: "uuid-1", status: "pending", rejection_reason: null, created_at: new Date("2024-05-01") },
    ],
  };

  it("accepts valid company detail", () => {
    const r = companyComplianceDetailSchema.safeParse(validCompanyDetail);
    expect(r.success).toBe(true);
  });

  it("accepts null company", () => {
    const r = companyComplianceDetailSchema.safeParse({
      ...validCompanyDetail,
      company: null,
      metrics: [],
      idRequests: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects wrong type literal", () => {
    const r = companyComplianceDetailSchema.safeParse({ ...validCompanyDetail, type: "id_request" });
    expect(r.success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const r = companyComplianceDetailSchema.safeParse({ ...validCompanyDetail, metrics: undefined });
    expect(r.success).toBe(false);
  });

  it("rejects missing idRequests", () => {
    const r = companyComplianceDetailSchema.safeParse({ ...validCompanyDetail, idRequests: undefined });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestComplianceDetailSchema — output validation
// ---------------------------------------------------------------------------

describe("idRequestComplianceDetailSchema (output)", () => {
  const validIdRequestDetail = {
    type: "id_request" as const,
    record: {
      cir_uuid: "uuid-123",
      candidate_ids: "1,2,3",
      status: "pending",
      rejection_reason: null,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-06-01"),
    },
    metrics: [
      { label: "Status", value: "pending", note: "Current status" },
    ],
  };

  it("accepts valid id_request detail", () => {
    const r = idRequestComplianceDetailSchema.safeParse(validIdRequestDetail);
    expect(r.success).toBe(true);
  });

  it("accepts null record", () => {
    const r = idRequestComplianceDetailSchema.safeParse({
      ...validIdRequestDetail,
      record: null,
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects wrong type literal", () => {
    const r = idRequestComplianceDetailSchema.safeParse({ ...validIdRequestDetail, type: "company" });
    expect(r.success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const r = idRequestComplianceDetailSchema.safeParse({ ...validIdRequestDetail, metrics: undefined });
    expect(r.success).toBe(false);
  });
});
