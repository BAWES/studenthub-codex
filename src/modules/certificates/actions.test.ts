import { describe, it, expect } from "vitest";
import {
  listCertificatesSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  getCertificateSchema,
  certificateListItemSchema,
  listCertificatesResultSchema,
  deleteCertificateResultSchema,
  type CertificateListItem,
  type ListCertificatesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema-only tests (no DB, no "use server" mocking)
// ---------------------------------------------------------------------------

describe("listCertificatesSchema", () => {
  it("accepts empty params and uses defaults", () => {
    const result = listCertificatesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listCertificatesSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts pagination params", () => {
    const result = listCertificatesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts optional filters", () => {
    const result = listCertificatesSchema.safeParse({
      examUuid: "exam_123",
      type: "true",
      storeId: 5,
      companyId: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.examUuid).toBe("exam_123");
      expect(result.data.type).toBe(true);
      expect(result.data.storeId).toBe(5);
      expect(result.data.companyId).toBe(3);
    }
  });

  it("rejects negative page", () => {
    const result = listCertificatesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCertificatesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });
});

describe("createCertificateSchema", () => {
  it("requires candidateId", () => {
    const result = createCertificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid input with only candidateId", () => {
    const result = createCertificateSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
  });

  it("accepts full certificate data", () => {
    const result = createCertificateSchema.safeParse({
      certificateTitle: "AWS Certified",
      certificateIssuer: "Amazon",
      certificateUrl: "https://example.com/cert",
      candidateId: 42,
      candidateWorkHistoryId: 7,
      storeId: 1,
      companyId: 5,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificateTitle).toBe("AWS Certified");
      expect(result.data.candidateId).toBe(42);
    }
  });
});

describe("updateCertificateSchema", () => {
  it("requires certificateUuid", () => {
    const result = updateCertificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts partial update with only uuid", () => {
    const result = updateCertificateSchema.safeParse({ certificateUuid: "cert_abc123" });
    expect(result.success).toBe(true);
  });

  it("accepts full update data", () => {
    const result = updateCertificateSchema.safeParse({
      certificateUuid: "cert_abc123",
      certificateTitle: "Updated Title",
      candidateId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificateTitle).toBe("Updated Title");
    }
  });
});

describe("deleteCertificateSchema", () => {
  it("requires certificateUuid", () => {
    const result = deleteCertificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid uuid", () => {
    const result = deleteCertificateSchema.safeParse({
      certificateUuid: "cert_to_delete",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("certificateListItemSchema", () => {
  it("accepts a valid certificate item", () => {
    const result = certificateListItemSchema.safeParse({
      certificate_uuid: "cert_abc123",
      certificate_type: true,
      certificate_title: "AWS Certified Developer",
      certificate_issuer: "Amazon Web Services",
      certificate_url: "https://aws.amazon.com/certification/",
      candidate_id: 42,
      candidate_work_history_id: null,
      exam_uuid: null,
      store_id: 1,
      company_id: 5,
      parent_company_id: null,
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-12-31T00:00:00.000Z",
      staff_id: 3,
      created_at: new Date("2025-01-01T00:00:00.000Z"),
      updated_at: new Date("2025-01-01T00:00:00.000Z"),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = certificateListItemSchema.safeParse({
      certificate_uuid: "cert_abc123",
    });
    expect(result.success).toBe(false);
  });
});

describe("listCertificatesResultSchema", () => {
  it("accepts empty result", () => {
    const result = listCertificatesResultSchema.safeParse({
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing totalPages", () => {
    const result = listCertificatesResultSchema.safeParse({
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteCertificateResultSchema", () => {
  it("accepts success: true", () => {
    const result = deleteCertificateResultSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const result = deleteCertificateResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
