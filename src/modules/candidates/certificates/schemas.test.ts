import { describe, it, expect } from "vitest";
import {
  listCertificatesSchema,
  getCertificateSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listCertificatesSchema", () => {
  it("accepts empty input (defaults)", () => {
    const r = listCertificatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts custom page and limit", () => {
    const r = listCertificatesSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCertificatesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCertificatesSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getCertificateSchema", () => {
  it("accepts valid UUID", () => {
    expect(getCertificateSchema.safeParse({ uuid: "cert_abc123" }).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getCertificateSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects missing uuid", () => {
    expect(getCertificateSchema.safeParse({}).success).toBe(false);
  });
});

describe("createCertificateSchema", () => {
  it("accepts empty input (all optional fields)", () => {
    expect(createCertificateSchema.safeParse({}).success).toBe(true);
  });

  it("accepts all fields", () => {
    const r = createCertificateSchema.safeParse({
      certificateType: true,
      certificateTitle: "AWS Certified",
      certificateIssuer: "Amazon",
      certificateUrl: "https://aws.com/cert",
      candidateWorkHistoryId: 5,
      examUuid: "exam_1",
      storeId: 10,
      companyId: 3,
      parentCompanyId: 2,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificateTitle).toBe("AWS Certified");
    }
  });
});

describe("updateCertificateSchema", () => {
  it("accepts valid update with required UUID", () => {
    const r = updateCertificateSchema.safeParse({
      certificateUuid: "cert_abc",
      certificateTitle: "Updated Title",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.certificateTitle).toBe("Updated Title");
  });

  it("rejects missing certificateUuid", () => {
    expect(updateCertificateSchema.safeParse({ certificateTitle: "Test" }).success).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(updateCertificateSchema.safeParse({ certificateUuid: "" }).success).toBe(false);
  });
});

describe("deleteCertificateSchema", () => {
  it("accepts valid UUID", () => {
    expect(deleteCertificateSchema.safeParse({ certificateUuid: "cert_123" }).success).toBe(true);
  });

  it("rejects missing certificateUuid", () => {
    expect(deleteCertificateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(deleteCertificateSchema.safeParse({ certificateUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("certificateItemSchema", () => {
  const valid = {
    certificate_uuid: "cert_abc",
    certificate_type: true,
    certificate_title: "AWS Certified Developer",
    certificate_issuer: "Amazon",
    certificate_url: "https://aws.com/cert",
    candidate_id: 1,
    candidate_work_history_id: null,
    exam_uuid: null,
    store_id: null,
    company_id: null,
    parent_company_id: null,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    staff_id: null,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-06-20"),
  };

  it("accepts a valid certificate item", () => {
    expect(certificateItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      certificateItemSchema.safeParse({
        ...valid,
        certificate_uuid: "cert_xyz",
        certificate_type: null,
        certificate_title: null,
        certificate_issuer: null,
        certificate_url: null,
        candidate_work_history_id: null,
        exam_uuid: null,
        store_id: null,
        company_id: null,
        parent_company_id: null,
        staff_id: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing certificate_uuid", () => {
    const { certificate_uuid: _, ...rest } = valid;
    expect(certificateItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = valid;
    expect(certificateItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listCertificatesResultSchema", () => {
  it("accepts valid result with empty certificates", () => {
    expect(
      listCertificatesResultSchema.safeParse({
        certificates: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listCertificatesResultSchema.safeParse({
        certificates: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects missing certificates", () => {
    expect(
      listCertificatesResultSchema.safeParse({ total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(false);
  });
});

describe("certificateActionResultSchema", () => {
  it("accepts success with data", () => {
    const r = certificateActionResultSchema.safeParse({
      operation: "success",
      message: "Certificate created",
      data: {
        certificate_uuid: "cert_new",
        certificate_type: null,
        certificate_title: null,
        certificate_issuer: null,
        certificate_url: null,
        candidate_id: 1,
        candidate_work_history_id: null,
        exam_uuid: null,
        store_id: null,
        company_id: null,
        parent_company_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        created_at: null,
        updated_at: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      certificateActionResultSchema.safeParse({ operation: "error", message: "Not found." }).success,
    ).toBe(true);
  });

  it("rejects unknown operation value", () => {
    expect(
      certificateActionResultSchema.safeParse({ operation: "unknown", message: "Test" }).success,
    ).toBe(false);
  });
});

describe("deleteCertificateResultSchema", () => {
  it("accepts success result", () => {
    expect(
      deleteCertificateResultSchema.safeParse({ operation: "success", message: "Deleted." }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      deleteCertificateResultSchema.safeParse({ operation: "error", message: "Not found." }).success,
    ).toBe(true);
  });

  it("rejects missing message", () => {
    expect(deleteCertificateResultSchema.safeParse({ operation: "success" }).success).toBe(false);
  });
});
