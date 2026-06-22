import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from schemas.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listComplianceRecordsSchema,
  getComplianceRecordSchema,
  approveComplianceSchema,
  denyComplianceSchema,
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
  listComplianceRecordsResponseSchema,
  companyComplianceDetailSchema,
  idRequestComplianceDetailSchema,
  complianceSummarySchema,
  complianceMutationResponseSchema,
  complianceRowSchema,
  type ComplianceRow,
  type ComplianceSummary,
  type CompanyComplianceDetail,
  type IdRequestComplianceDetail,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listComplianceRecordsSchema
// ---------------------------------------------------------------------------

describe("listComplianceRecordsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listComplianceRecordsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.type).toBe("all");
      expect(result.data.q).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts explicit page, limit, type, and status", () => {
    const result = listComplianceRecordsSchema.safeParse({
      page: "3",
      limit: "50",
      type: "company",
      status: "not_approved",
      q: "Acme",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
      expect(result.data.type).toBe("company");
      expect(result.data.status).toBe("not_approved");
      expect(result.data.q).toBe("Acme");
    }
  });

  it("accepts all valid type values", () => {
    for (const t of ["company", "id_request", "candidate", "all"]) {
      expect(listComplianceRecordsSchema.safeParse({ type: t }).success).toBe(true);
    }
  });

  it("rejects invalid type value", () => {
    expect(listComplianceRecordsSchema.safeParse({ type: "invalid" }).success).toBe(false);
  });

  it("rejects page less than 1", () => {
    expect(listComplianceRecordsSchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listComplianceRecordsSchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listComplianceRecordsSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Input schema: getComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("getComplianceRecordSchema", () => {
  it("accepts company type with valid id", () => {
    const result = getComplianceRecordSchema.safeParse({ id: "5", type: "company" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("5");
      expect(result.data.type).toBe("company");
    }
  });

  it("accepts id_request type", () => {
    const result = getComplianceRecordSchema.safeParse({ id: "cir-uuid-123", type: "id_request" });
    expect(result.success).toBe(true);
  });

  it("accepts candidate type", () => {
    const result = getComplianceRecordSchema.safeParse({ id: "42", type: "candidate" });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    expect(getComplianceRecordSchema.safeParse({ id: "", type: "company" }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(getComplianceRecordSchema.safeParse({ type: "company" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(getComplianceRecordSchema.safeParse({ id: "1", type: "invalid" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(getComplianceRecordSchema.safeParse({ id: "1" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: approveComplianceSchema
// ---------------------------------------------------------------------------

describe("approveComplianceSchema", () => {
  it("accepts valid company approval", () => {
    const result = approveComplianceSchema.safeParse({ id: "5", type: "company" });
    expect(result.success).toBe(true);
  });

  it("accepts valid id_request approval", () => {
    const result = approveComplianceSchema.safeParse({ id: "cir-abc", type: "id_request" });
    expect(result.success).toBe(true);
  });

  it("rejects candidate type (not allowed)", () => {
    expect(approveComplianceSchema.safeParse({ id: "1", type: "candidate" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(approveComplianceSchema.safeParse({ id: "", type: "company" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: denyComplianceSchema
// ---------------------------------------------------------------------------

describe("denyComplianceSchema", () => {
  it("accepts valid denial with reason", () => {
    const result = denyComplianceSchema.safeParse({
      id: "5",
      type: "company",
      reason: "Missing required documentation",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("Missing required documentation");
    }
  });

  it("rejects empty reason", () => {
    expect(
      denyComplianceSchema.safeParse({ id: "5", type: "company", reason: "" }).success,
    ).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(denyComplianceSchema.safeParse({ id: "5", type: "company" }).success).toBe(false);
  });

  it("rejects reason exceeding 2000 chars", () => {
    expect(
      denyComplianceSchema.safeParse({
        id: "5",
        type: "company",
        reason: "x".repeat(2001),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: createComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("createComplianceRecordSchema", () => {
  it("accepts valid company compliance input with optional fields", () => {
    const result = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Acme Corp",
      company_email: "acme@example.com",
      company_approved_to_hire: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_name).toBe("Acme Corp");
      expect(result.data.company_email).toBe("acme@example.com");
      expect(result.data.company_approved_to_hire).toBe(true);
    }
  });

  it("accepts minimal input with defaults", () => {
    const result = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Test Co",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_approved_to_hire).toBe(false);
      expect(result.data.company_email).toBeUndefined();
    }
  });

  it("rejects empty company name", () => {
    expect(
      createComplianceRecordSchema.safeParse({ type: "company", company_name: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createComplianceRecordSchema.safeParse({
        type: "company",
        company_name: "Test",
        company_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects unsupported type", () => {
    expect(
      createComplianceRecordSchema.safeParse({
        type: "candidate",
        company_name: "Test",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("updateComplianceRecordSchema", () => {
  it("accepts full update with all fields", () => {
    const result = updateComplianceRecordSchema.safeParse({
      id: "5",
      type: "company",
      company_approved_to_hire: true,
      company_followup: true,
      company_status_override: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("5");
      expect(result.data.company_approved_to_hire).toBe(true);
    }
  });

  it("accepts partial update with only id and type", () => {
    const result = updateComplianceRecordSchema.safeParse({
      id: "5",
      type: "company",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    expect(
      updateComplianceRecordSchema.safeParse({ id: "", type: "company" }).success,
    ).toBe(false);
  });

  it("rejects non-company type", () => {
    expect(
      updateComplianceRecordSchema.safeParse({ id: "1", type: "id_request" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: complianceRowSchema
// ---------------------------------------------------------------------------

describe("complianceRowSchema", () => {
  it("accepts a valid company compliance row", () => {
    const result = complianceRowSchema.safeParse({
      id: "company-5",
      type: "company",
      title: "Acme Corp",
      subtitle: "acme@example.com",
      status: "Not approved",
      updated: "2d ago",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid id_request row", () => {
    const result = complianceRowSchema.safeParse({
      id: "id_request-abc123",
      type: "id_request",
      title: "ID Request abc123def456…",
      subtitle: "Candidates: 1,2,3",
      status: "pending",
      updated: "just now",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    expect(
      complianceRowSchema.safeParse({
        id: "company-1",
        type: "company",
        subtitle: "test",
        status: "OK",
        updated: "now",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(
      complianceRowSchema.safeParse({
        id: "x",
        type: "invalid",
        title: "Test",
        subtitle: "test",
        status: "OK",
        updated: "now",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: complianceSummarySchema
// ---------------------------------------------------------------------------

describe("complianceSummarySchema", () => {
  it("accepts a valid summary", () => {
    const result = complianceSummarySchema.safeParse({
      totalCompanies: 524,
      unapprovedCompanies: 12,
      pendingIdRequests: 3,
      unapprovedCandidates: 45,
      incompleteCandidates: 18,
    });
    expect(result.success).toBe(true);
  });

  it("accepts zero values", () => {
    const result = complianceSummarySchema.safeParse({
      totalCompanies: 0,
      unapprovedCompanies: 0,
      pendingIdRequests: 0,
      unapprovedCandidates: 0,
      incompleteCandidates: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative values", () => {
    expect(
      complianceSummarySchema.safeParse({
        totalCompanies: -1,
        unapprovedCompanies: 0,
        pendingIdRequests: 0,
        unapprovedCandidates: 0,
        incompleteCandidates: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(
      complianceSummarySchema.safeParse({
        totalCompanies: 100,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listComplianceRecordsResponseSchema
// ---------------------------------------------------------------------------

describe("listComplianceRecordsResponseSchema", () => {
  const validSummary = {
    totalCompanies: 524,
    unapprovedCompanies: 12,
    pendingIdRequests: 3,
    unapprovedCandidates: 45,
    incompleteCandidates: 18,
  };

  it("accepts a valid paginated response", () => {
    const result = listComplianceRecordsResponseSchema.safeParse({
      items: [
        {
          id: "company-1",
          type: "company",
          title: "Acme",
          subtitle: "acme@test.com",
          status: "Approved",
          updated: "1d ago",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      summary: validSummary,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
    }
  });

  it("accepts an empty response", () => {
    const result = listComplianceRecordsResponseSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      summary: validSummary,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing summary", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listComplianceRecordsResponseSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: -1,
        summary: validSummary,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: complianceMutationResponseSchema
// ---------------------------------------------------------------------------

describe("complianceMutationResponseSchema", () => {
  it("accepts company mutation result", () => {
    const result = complianceMutationResponseSchema.safeParse({
      id: "company-5",
      type: "company",
    });
    expect(result.success).toBe(true);
  });

  it("accepts id_request mutation result", () => {
    const result = complianceMutationResponseSchema.safeParse({
      id: "company-5",
      type: "id_request",
    });
    expect(result.success).toBe(true);
  });

  it("rejects candidate mutation type", () => {
    expect(
      complianceMutationResponseSchema.safeParse({ id: "1", type: "candidate" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("ComplianceRow type shape", () => {
  it("conforms to expected structure", () => {
    const row: ComplianceRow = {
      id: "company-5",
      type: "company",
      title: "Acme Corp",
      subtitle: "acme@example.com",
      status: "Approved",
      updated: "2d ago",
    };
    expect(row.id).toBe("company-5");
    expect(row.type).toBe("company");
    expect(row.status).toBe("Approved");
  });

  it("supports all three type variants", () => {
    const types: ComplianceRow["type"][] = ["company", "id_request", "candidate"];
    expect(types).toHaveLength(3);
  });
});

describe("ComplianceSummary type shape", () => {
  it("conforms to expected structure", () => {
    const s: ComplianceSummary = {
      totalCompanies: 100,
      unapprovedCompanies: 5,
      pendingIdRequests: 2,
      unapprovedCandidates: 10,
      incompleteCandidates: 3,
    };
    expect(s.totalCompanies).toBe(100);
    expect(s.unapprovedCompanies).toBe(5);
  });
});

describe("CompanyComplianceDetail type shape", () => {
  it("conforms to expected structure", () => {
    const detail: CompanyComplianceDetail = {
      type: "company",
      company: {
        company_id: 1,
        company_name: "Acme",
        company_email: "acme@test.com",
        company_approved_to_hire: true,
        company_created_at: new Date("2024-01-01"),
        company_updated_at: null,
        staff_name: "John",
        country_name_en: "Kuwait",
        no_of_active_requests: 3,
      },
      metrics: [{ label: "Status", value: "Yes", note: "Compliance" }],
      idRequests: [{ id: "cir-1", status: "pending", rejection_reason: null, created_at: new Date() }],
    };
    expect(detail.type).toBe("company");
    expect(detail.company?.company_name).toBe("Acme");
  });

  it("supports null company (not found)", () => {
    const detail: CompanyComplianceDetail = {
      type: "company",
      company: null,
      metrics: [],
      idRequests: [],
    };
    expect(detail.company).toBeNull();
  });
});

describe("IdRequestComplianceDetail type shape", () => {
  it("conforms to expected structure", () => {
    const detail: IdRequestComplianceDetail = {
      type: "id_request",
      record: {
        cir_uuid: "cir-abc",
        candidate_ids: "1,2,3",
        status: "pending",
        rejection_reason: null,
        created_at: new Date(),
        updated_at: null,
      },
      metrics: [{ label: "Status", value: "pending", note: "Current" }],
    };
    expect(detail.type).toBe("id_request");
    expect(detail.record?.cir_uuid).toBe("cir-abc");
  });

  it("supports null record (not found)", () => {
    const detail: IdRequestComplianceDetail = {
      type: "id_request",
      record: null,
      metrics: [],
    };
    expect(detail.record).toBeNull();
  });
});
