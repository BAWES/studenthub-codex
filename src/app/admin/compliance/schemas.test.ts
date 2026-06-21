import { describe, it, expect } from "vitest";
import {
  listComplianceRecordsSchema,
  getComplianceRecordSchema,
  approveComplianceSchema,
  denyComplianceSchema,
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
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
  it("accepts empty input with defaults", () => {
    expect(listComplianceRecordsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listComplianceRecordsSchema.safeParse({
        page: 2,
        limit: 50,
        q: "acme",
        type: "company",
        status: "pending",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(listComplianceRecordsSchema.safeParse({ type: "invalid" }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listComplianceRecordsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listComplianceRecordsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listComplianceRecordsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getComplianceRecordSchema
// ---------------------------------------------------------------------------
describe("getComplianceRecordSchema", () => {
  it("accepts valid input", () => {
    expect(getComplianceRecordSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(getComplianceRecordSchema.safeParse({ type: "company" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(getComplianceRecordSchema.safeParse({ id: "", type: "company" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(getComplianceRecordSchema.safeParse({ id: "r-1", type: "invalid" }).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(getComplianceRecordSchema.safeParse({ id: 123, type: "company" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveComplianceSchema
// ---------------------------------------------------------------------------
describe("approveComplianceSchema", () => {
  it("accepts valid input", () => {
    expect(approveComplianceSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(approveComplianceSchema.safeParse({ type: "id_request" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(approveComplianceSchema.safeParse({ id: "", type: "id_request" }).success).toBe(false);
  });

  it("rejects invalid type (candidate not allowed)", () => {
    expect(approveComplianceSchema.safeParse({ id: "r-1", type: "candidate" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// denyComplianceSchema
// ---------------------------------------------------------------------------
describe("denyComplianceSchema", () => {
  it("accepts valid input", () => {
    expect(denyComplianceSchema.safeParse({ id: "rec-1", type: "company", reason: "Missing docs" }).success).toBe(true);
  });

  it("rejects missing reason", () => {
    expect(denyComplianceSchema.safeParse({ id: "r-1", type: "company" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(denyComplianceSchema.safeParse({ id: "r-1", type: "company", reason: "" }).success).toBe(false);
  });

  it("rejects reason exceeding 2000 chars", () => {
    expect(
      denyComplianceSchema.safeParse({ id: "r-1", type: "company", reason: "x".repeat(2001) }).success,
    ).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(denyComplianceSchema.safeParse({ id: "r-1", type: "candidate", reason: "No" }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(denyComplianceSchema.safeParse({ type: "company", reason: "No" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createComplianceRecordSchema
// ---------------------------------------------------------------------------
describe("createComplianceRecordSchema", () => {
  it("accepts minimal input", () => {
    expect(
      createComplianceRecordSchema.safeParse({ type: "company", company_name: "Acme Corp" }).success,
    ).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      createComplianceRecordSchema.safeParse({
        type: "company",
        company_name: "Acme Corp",
        company_email: "admin@acme.com",
        company_approved_to_hire: true,
      }).success,
    ).toBe(true);
  });

  it("rejects missing type", () => {
    expect(createComplianceRecordSchema.safeParse({ company_name: "Acme" }).success).toBe(false);
  });

  it("rejects invalid type (only company allowed)", () => {
    expect(
      createComplianceRecordSchema.safeParse({ type: "id_request", company_name: "Acme" }).success,
    ).toBe(false);
  });

  it("rejects empty company_name", () => {
    expect(
      createComplianceRecordSchema.safeParse({ type: "company", company_name: "" }).success,
    ).toBe(false);
  });

  it("rejects company_name exceeding 255 chars", () => {
    expect(
      createComplianceRecordSchema.safeParse({ type: "company", company_name: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createComplianceRecordSchema.safeParse({
        type: "company",
        company_name: "Acme",
        company_email: "not-email",
      }).success,
    ).toBe(false);
  });

  it("rejects company_email exceeding 225 chars", () => {
    expect(
      createComplianceRecordSchema.safeParse({
        type: "company",
        company_name: "Acme",
        company_email: "x".repeat(226) + "@a.com",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateComplianceRecordSchema
// ---------------------------------------------------------------------------
describe("updateComplianceRecordSchema", () => {
  it("accepts minimal input", () => {
    expect(updateComplianceRecordSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(true);
  });

  it("accepts all boolean fields", () => {
    expect(
      updateComplianceRecordSchema.safeParse({
        id: "rec-1",
        type: "company",
        company_approved_to_hire: true,
        company_followup: false,
        company_status_override: true,
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    expect(updateComplianceRecordSchema.safeParse({ type: "company" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(updateComplianceRecordSchema.safeParse({ id: "", type: "company" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(updateComplianceRecordSchema.safeParse({ id: "r-1", type: "candidate" }).success).toBe(false);
  });

  it("rejects wrong type for boolean fields", () => {
    expect(
      updateComplianceRecordSchema.safeParse({
        id: "r-1",
        type: "company",
        company_approved_to_hire: "yes",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceRowSchema
// ---------------------------------------------------------------------------
describe("complianceRowSchema", () => {
  const validRow = {
    id: "rec-1",
    type: "company",
    title: "Acme Corp",
    subtitle: "Pending review",
    status: "active",
    updated: "2026-06-15",
  };

  it("accepts a valid compliance row", () => {
    expect(complianceRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(complianceRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, id: "" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, type: "invalid" }).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, title: "" }).success).toBe(false);
  });

  it("rejects empty subtitle", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, subtitle: "" }).success).toBe(false);
  });

  it("rejects empty status", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, status: "" }).success).toBe(false);
  });

  it("rejects empty updated", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, updated: "" }).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, id: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceSummarySchema
// ---------------------------------------------------------------------------
describe("complianceSummarySchema", () => {
  const validSummary = {
    totalCompanies: 10,
    unapprovedCompanies: 2,
    pendingIdRequests: 5,
    unapprovedCandidates: 1,
    incompleteCandidates: 3,
  };

  it("accepts a valid summary", () => {
    expect(complianceSummarySchema.safeParse(validSummary).success).toBe(true);
  });

  it("accepts zero values", () => {
    expect(
      complianceSummarySchema.safeParse({
        totalCompanies: 0,
        unapprovedCompanies: 0,
        pendingIdRequests: 0,
        unapprovedCandidates: 0,
        incompleteCandidates: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing totalCompanies", () => {
    const { totalCompanies: _, ...rest } = validSummary;
    expect(complianceSummarySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative values", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, totalCompanies: -1 }).success).toBe(false);
    expect(complianceSummarySchema.safeParse({ ...validSummary, unapprovedCompanies: -1 }).success).toBe(false);
    expect(complianceSummarySchema.safeParse({ ...validSummary, pendingIdRequests: -1 }).success).toBe(false);
    expect(complianceSummarySchema.safeParse({ ...validSummary, unapprovedCandidates: -1 }).success).toBe(false);
    expect(complianceSummarySchema.safeParse({ ...validSummary, incompleteCandidates: -1 }).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, totalCompanies: "ten" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyComplianceDetailSchema
// ---------------------------------------------------------------------------
describe("companyComplianceDetailSchema", () => {
  const validDetail = {
    type: "company" as const,
    company: {
      company_id: 1,
      company_name: "Acme Corp",
      company_email: "admin@acme.com",
      company_approved_to_hire: true,
      company_created_at: new Date(),
      company_updated_at: new Date(),
      staff_name: "John",
      country_name_en: "Kuwait",
      no_of_active_requests: 3,
    },
    metrics: [{ label: "Compliance Score", value: 85, note: "Good" }],
    idRequests: [{ id: "ir-1", status: "approved", rejection_reason: null, created_at: null }],
  };

  it("accepts a valid detail", () => {
    expect(companyComplianceDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null company", () => {
    expect(companyComplianceDetailSchema.safeParse({ ...validDetail, company: null }).success).toBe(true);
  });

  it("rejects invalid type (must be 'company')", () => {
    expect(companyComplianceDetailSchema.safeParse({ ...validDetail, type: "id_request" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validDetail;
    expect(companyComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(companyComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing idRequests", () => {
    const { idRequests: _, ...rest } = validDetail;
    expect(companyComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestComplianceDetailSchema
// ---------------------------------------------------------------------------
describe("idRequestComplianceDetailSchema", () => {
  const validDetail = {
    type: "id_request" as const,
    record: {
      cir_uuid: "cir-1",
      candidate_ids: "1,2,3",
      status: "pending",
      rejection_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    metrics: [{ label: "Days Open", value: 5, note: "Open" }],
  };

  it("accepts a valid detail", () => {
    expect(idRequestComplianceDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null record", () => {
    expect(idRequestComplianceDetailSchema.safeParse({ ...validDetail, record: null }).success).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(idRequestComplianceDetailSchema.safeParse({ ...validDetail, type: "company" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validDetail;
    expect(idRequestComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(idRequestComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listComplianceRecordsResponseSchema (paginated + summary)
// ---------------------------------------------------------------------------
describe("listComplianceRecordsResponseSchema", () => {
  const validResponse = {
    items: [{ id: "r-1", type: "company", title: "Acme", subtitle: "Pending", status: "active", updated: "today" }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    summary: {
      totalCompanies: 10,
      unapprovedCompanies: 2,
      pendingIdRequests: 5,
      unapprovedCandidates: 1,
      incompleteCandidates: 3,
    },
  };

  it("accepts a valid response", () => {
    expect(listComplianceRecordsResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty items", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({
        ...validResponse,
        items: [],
        total: 0,
        totalPages: 0,
        summary: { ...validResponse.summary, totalCompanies: 0 },
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResponse;
    expect(listComplianceRecordsResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing summary", () => {
    const { summary: _, ...rest } = validResponse;
    expect(listComplianceRecordsResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listComplianceRecordsResponseSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listComplianceRecordsResponseSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceMutationResponseSchema
// ---------------------------------------------------------------------------
describe("complianceMutationResponseSchema", () => {
  it("accepts valid mutation response", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(complianceMutationResponseSchema.safeParse({ type: "company" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "", type: "company" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "r-1", type: "candidate" }).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: 123, type: "company" }).success).toBe(false);
  });
});
