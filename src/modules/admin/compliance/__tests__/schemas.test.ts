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
} from "../schemas";

// ---------------------------------------------------------------------------
// listComplianceRecordsSchema
// ---------------------------------------------------------------------------
describe("listComplianceRecordsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listComplianceRecordsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listComplianceRecordsSchema.safeParse({ page: 2, limit: 50, q: "test", type: "company", status: "pending" }).success,
    ).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listComplianceRecordsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listComplianceRecordsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(listComplianceRecordsSchema.safeParse({ type: "invalid" }).success).toBe(false);
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
    expect(getComplianceRecordSchema.safeParse({ id: "rec-1", type: "invalid" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveComplianceSchema
// ---------------------------------------------------------------------------
describe("approveComplianceSchema", () => {
  it("accepts valid input", () => {
    expect(approveComplianceSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(true);
  });

  it("accepts id_request type", () => {
    expect(approveComplianceSchema.safeParse({ id: "rec-1", type: "id_request" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(approveComplianceSchema.safeParse({ type: "company" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// denyComplianceSchema
// ---------------------------------------------------------------------------
describe("denyComplianceSchema", () => {
  it("accepts valid input", () => {
    expect(denyComplianceSchema.safeParse({ id: "rec-1", type: "company", reason: "Documentation incomplete" }).success).toBe(true);
  });

  it("rejects missing reason", () => {
    expect(denyComplianceSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(denyComplianceSchema.safeParse({ id: "rec-1", type: "company", reason: "" }).success).toBe(false);
  });

  it("rejects reason over 2000 chars", () => {
    expect(denyComplianceSchema.safeParse({ id: "rec-1", type: "company", reason: "x".repeat(2001) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createComplianceRecordSchema
// ---------------------------------------------------------------------------
describe("createComplianceRecordSchema", () => {
  it("accepts valid minimal input", () => {
    expect(createComplianceRecordSchema.safeParse({ type: "company", company_name: "Acme Corp" }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      createComplianceRecordSchema.safeParse({
        type: "company",
        company_name: "Acme Corp",
        company_email: "hr@acme.com",
        company_approved_to_hire: true,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_name", () => {
    expect(createComplianceRecordSchema.safeParse({ type: "company" }).success).toBe(false);
  });

  it("rejects empty company_name", () => {
    expect(createComplianceRecordSchema.safeParse({ type: "company", company_name: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createComplianceRecordSchema.safeParse({ type: "company", company_name: "Acme", company_email: "not-an-email" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateComplianceRecordSchema
// ---------------------------------------------------------------------------
describe("updateComplianceRecordSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateComplianceRecordSchema.safeParse({ id: "rec-1", type: "company", company_approved_to_hire: true }).success,
    ).toBe(true);
  });

  it("accepts partial update", () => {
    expect(updateComplianceRecordSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(updateComplianceRecordSchema.safeParse({ type: "company" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceRowSchema
// ---------------------------------------------------------------------------
describe("complianceRowSchema", () => {
  const validRow = {
    id: "row-1",
    type: "company",
    title: "Acme Corp",
    subtitle: "Compliance Review",
    status: "approved",
    updated: "2026-06-01",
  };

  it("accepts a valid row", () => {
    expect(complianceRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts candidate type", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, type: "candidate" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(complianceRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, type: "invalid" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceSummarySchema
// ---------------------------------------------------------------------------
describe("complianceSummarySchema", () => {
  const validSummary = {
    totalCompanies: 10,
    unapprovedCompanies: 3,
    pendingIdRequests: 5,
    unapprovedCandidates: 2,
    incompleteCandidates: 1,
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

  it("rejects negative values", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, totalCompanies: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyComplianceDetailSchema
// ---------------------------------------------------------------------------
describe("companyComplianceDetailSchema", () => {
  it("accepts a valid detail with all fields", () => {
    expect(
      companyComplianceDetailSchema.safeParse({
        type: "company",
        company: {
          company_id: 1,
          company_name: "Acme",
          company_email: "hr@acme.com",
          company_approved_to_hire: true,
          company_created_at: new Date(),
          company_updated_at: new Date(),
          staff_name: "Staff 1",
          country_name_en: "Kuwait",
          no_of_active_requests: 5,
        },
        metrics: [{ label: "Active Requests", value: 5, note: "Pending review" }],
        idRequests: [{ id: "ir-1", status: "pending", rejection_reason: null, created_at: new Date() }],
      }).success,
    ).toBe(true);
  });

  it("accepts nullable company", () => {
    expect(
      companyComplianceDetailSchema.safeParse({
        type: "company",
        company: null,
        metrics: [],
        idRequests: [],
      }).success,
    ).toBe(true);
  });

  it("rejects wrong type literal", () => {
    expect(
      companyComplianceDetailSchema.safeParse({
        type: "id_request",
        company: null,
        metrics: [],
        idRequests: [],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestComplianceDetailSchema
// ---------------------------------------------------------------------------
describe("idRequestComplianceDetailSchema", () => {
  it("accepts a valid detail", () => {
    expect(
      idRequestComplianceDetailSchema.safeParse({
        type: "id_request",
        record: {
          cir_uuid: "cir-1",
          candidate_ids: "42,43",
          status: "pending",
          rejection_reason: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        metrics: [{ label: "Days Open", value: 3, note: "Since creation" }],
      }).success,
    ).toBe(true);
  });

  it("accepts nullable record", () => {
    expect(
      idRequestComplianceDetailSchema.safeParse({
        type: "id_request",
        record: null,
        metrics: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing metrics", () => {
    expect(
      idRequestComplianceDetailSchema.safeParse({
        type: "id_request",
        record: null,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listComplianceRecordsResponseSchema
// ---------------------------------------------------------------------------
describe("listComplianceRecordsResponseSchema", () => {
  it("accepts a valid response", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({
        items: [
          { id: "r1", type: "company", title: "Acme", subtitle: "Review", status: "pending", updated: "2026-06-01" },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        summary: {
          totalCompanies: 10,
          unapprovedCompanies: 3,
          pendingIdRequests: 5,
          unapprovedCandidates: 2,
          incompleteCandidates: 1,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
        summary: { totalCompanies: 0, unapprovedCompanies: 0, pendingIdRequests: 0, unapprovedCandidates: 0, incompleteCandidates: 0 },
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceMutationResponseSchema
// ---------------------------------------------------------------------------
describe("complianceMutationResponseSchema", () => {
  it("accepts a valid response", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "rec-1", type: "company" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(complianceMutationResponseSchema.safeParse({ type: "company" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "rec-1", type: "candidate" }).success).toBe(false);
  });
});
