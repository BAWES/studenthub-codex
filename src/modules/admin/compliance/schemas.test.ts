import { describe, it, expect } from "vitest";
import {
  complianceRowSchema,
  complianceSummarySchema,
  companyComplianceDetailSchema,
  idRequestComplianceDetailSchema,
  listComplianceRecordsResponseSchema,
  complianceMutationResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// complianceRowSchema
// ---------------------------------------------------------------------------
describe("complianceRowSchema", () => {
  const validRow = {
    id: "rec-001",
    type: "company" as const,
    title: "Acme Corp",
    subtitle: "Pending review",
    status: "pending",
    updated: "2026-06-14",
  };

  it("accepts a valid compliance row", () => {
    expect(complianceRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts id_request type", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, type: "id_request" }).success).toBe(true);
  });

  it("accepts candidate type", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, type: "candidate" }).success).toBe(true);
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

  it("rejects missing title", () => {
    const { title: _, ...rest } = validRow;
    expect(complianceRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, title: "" }).success).toBe(false);
  });

  it("rejects empty status", () => {
    expect(complianceRowSchema.safeParse({ ...validRow, status: "" }).success).toBe(false);
  });

  it("rejects missing updated", () => {
    const { updated: _, ...rest } = validRow;
    expect(complianceRowSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceSummarySchema
// ---------------------------------------------------------------------------
describe("complianceSummarySchema", () => {
  const validSummary = {
    totalCompanies: 100,
    unapprovedCompanies: 25,
    pendingIdRequests: 12,
    unapprovedCandidates: 8,
    incompleteCandidates: 3,
  };

  it("accepts a valid compliance summary", () => {
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

  it("rejects negative totalCompanies", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, totalCompanies: -1 }).success).toBe(false);
  });

  it("rejects negative unapprovedCompanies", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, unapprovedCompanies: -1 }).success).toBe(false);
  });

  it("rejects negative pendingIdRequests", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, pendingIdRequests: -1 }).success).toBe(false);
  });

  it("rejects negative unapprovedCandidates", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, unapprovedCandidates: -1 }).success).toBe(false);
  });

  it("rejects negative incompleteCandidates", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, incompleteCandidates: -1 }).success).toBe(false);
  });

  it("rejects non-integer values", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, totalCompanies: 10.5 }).success).toBe(false);
  });

  it("rejects string values", () => {
    expect(complianceSummarySchema.safeParse({ ...validSummary, totalCompanies: "10" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyComplianceDetailSchema
// ---------------------------------------------------------------------------
describe("companyComplianceDetailSchema", () => {
  const validDetail = {
    type: "company" as const,
    company: {
      company_id: 42,
      company_name: "Acme Corp",
      company_email: "admin@acme.com",
      company_approved_to_hire: true,
      company_created_at: new Date("2026-01-01"),
      company_updated_at: new Date("2026-06-01"),
      staff_name: "John Doe",
      country_name_en: "Kuwait",
      no_of_active_requests: 5,
    },
    metrics: [
      { label: "Total Invoices", value: 150, note: "Q2 2026" },
    ],
    idRequests: [
      { id: "idr-001", status: "pending", rejection_reason: null, created_at: new Date("2026-06-10") },
    ],
  };

  it("accepts a valid company compliance detail", () => {
    expect(companyComplianceDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null company", () => {
    expect(companyComplianceDetailSchema.safeParse({ ...validDetail, company: null }).success).toBe(true);
  });

  it("accepts empty metrics", () => {
    expect(companyComplianceDetailSchema.safeParse({ ...validDetail, metrics: [] }).success).toBe(true);
  });

  it("accepts empty idRequests", () => {
    expect(companyComplianceDetailSchema.safeParse({ ...validDetail, idRequests: [] }).success).toBe(true);
  });

  it("accepts null fields on company", () => {
    expect(
      companyComplianceDetailSchema.safeParse({
        ...validDetail,
        company: {
          company_id: 1,
          company_name: "Test",
          company_email: null,
          company_approved_to_hire: null,
          company_created_at: null,
          company_updated_at: null,
          staff_name: null,
          country_name_en: null,
          no_of_active_requests: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validDetail;
    expect(companyComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(companyComplianceDetailSchema.safeParse({ ...validDetail, type: "id_request" }).success).toBe(false);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validDetail.company;
    expect(companyComplianceDetailSchema.safeParse({ ...validDetail, company: rest }).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(companyComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid metric in array", () => {
    expect(
      companyComplianceDetailSchema.safeParse({
        ...validDetail,
        metrics: [{ label: "", value: "x", note: "x" }],
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for value", () => {
    expect(complianceSummarySchema.safeParse({ ...validDetail, type: false }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestComplianceDetailSchema
// ---------------------------------------------------------------------------
describe("idRequestComplianceDetailSchema", () => {
  const validDetail = {
    type: "id_request" as const,
    record: {
      cir_uuid: "cir-abc-123",
      candidate_ids: "cand-001,cand-002",
      status: "pending",
      rejection_reason: null,
      created_at: new Date("2026-06-10"),
      updated_at: new Date("2026-06-12"),
    },
    metrics: [
      { label: "Age", value: "5 days", note: "Since submission" },
    ],
  };

  it("accepts a valid id_request compliance detail", () => {
    expect(idRequestComplianceDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null record", () => {
    expect(idRequestComplianceDetailSchema.safeParse({ ...validDetail, record: null }).success).toBe(true);
  });

  it("accepts empty metrics", () => {
    expect(idRequestComplianceDetailSchema.safeParse({ ...validDetail, metrics: [] }).success).toBe(true);
  });

  it("accepts null fields on record", () => {
    expect(
      idRequestComplianceDetailSchema.safeParse({
        ...validDetail,
        record: {
          cir_uuid: "cir-001",
          candidate_ids: null,
          status: null,
          rejection_reason: null,
          created_at: null,
          updated_at: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validDetail;
    expect(idRequestComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(idRequestComplianceDetailSchema.safeParse({ ...validDetail, type: "company" }).success).toBe(false);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validDetail.record;
    expect(idRequestComplianceDetailSchema.safeParse({ ...validDetail, record: rest }).success).toBe(false);
  });

  it("rejects empty cir_uuid", () => {
    expect(
      idRequestComplianceDetailSchema.safeParse({
        ...validDetail,
        record: { ...validDetail.record, cir_uuid: "" },
      }).success,
    ).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(idRequestComplianceDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listComplianceRecordsResponseSchema
// ---------------------------------------------------------------------------
describe("listComplianceRecordsResponseSchema", () => {
  const validResponse = {
    items: [
      {
        id: "rec-001",
        type: "company" as const,
        title: "Acme Corp",
        subtitle: "Pending review",
        status: "pending",
        updated: "2026-06-14",
      },
    ],
    total: 42,
    page: 1,
    limit: 20,
    totalPages: 3,
    summary: {
      totalCompanies: 100,
      unapprovedCompanies: 25,
      pendingIdRequests: 12,
      unapprovedCandidates: 8,
      incompleteCandidates: 3,
    },
  };

  it("accepts a valid list response", () => {
    expect(listComplianceRecordsResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({ ...validResponse, items: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("accepts single item", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({ ...validResponse, items: [validResponse.items[0]] })
        .success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResponse;
    expect(listComplianceRecordsResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid item in items array", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({
        ...validResponse,
        items: [{ id: "" }],
      }).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listComplianceRecordsResponseSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listComplianceRecordsResponseSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });

  it("rejects negative limit", () => {
    expect(listComplianceRecordsResponseSchema.safeParse({ ...validResponse, limit: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({ ...validResponse, totalPages: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing summary", () => {
    const { summary: _, ...rest } = validResponse;
    expect(listComplianceRecordsResponseSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// complianceMutationResponseSchema
// ---------------------------------------------------------------------------
describe("complianceMutationResponseSchema", () => {
  it("accepts a valid mutation response with company type", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "rec-001", type: "company" }).success).toBe(true);
  });

  it("accepts a valid mutation response with id_request type", () => {
    expect(
      complianceMutationResponseSchema.safeParse({ id: "rec-001", type: "id_request" }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    expect(complianceMutationResponseSchema.safeParse({ type: "company" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "", type: "company" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "rec-001", type: "candidate" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(complianceMutationResponseSchema.safeParse({ id: "rec-001" }).success).toBe(false);
  });
});
