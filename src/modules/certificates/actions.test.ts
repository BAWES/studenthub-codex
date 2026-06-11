import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Import shared schemas
// ---------------------------------------------------------------------------

import {
  listCertificatesSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  getCertificateSchema,
  certificateListItemSchema,
  listCertificatesResultSchema,
  certificateActionSuccessSchema,
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

describe("getCertificateSchema", () => {
  it("rejects empty UUID", () => {
    const r = getCertificateSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBe("Certificate UUID is required");
    }
  });

  it("accepts valid UUID", () => {
    const r = getCertificateSchema.safeParse({ uuid: "cert_abc123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("cert_abc123");
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema: certificateListItemSchema
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
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      staff_id: 3,
      created_at: new Date("2025-01-15"),
      updated_at: new Date("2025-06-01"),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_uuid).toBe("cert_abc123");
      expect(result.data.certificate_title).toBe("AWS Certified Developer");
      expect(result.data.candidate_id).toBe(42);
    }
  });

  it("accepts certificate with all null optionals", () => {
    const result = certificateListItemSchema.safeParse({
      certificate_uuid: "cert_null_test",
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
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required field (certificate_uuid)", () => {
    const result = certificateListItemSchema.safeParse({
      candidate_id: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    const result = certificateListItemSchema.safeParse({
      certificate_uuid: "test",
      certificate_type: null,
      certificate_title: null,
      certificate_issuer: null,
      certificate_url: null,
      candidate_id: "not-a-number",
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
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for start_date (Date instead of string)", () => {
    const result = certificateListItemSchema.safeParse({
      certificate_uuid: "test",
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
      start_date: new Date(),
      end_date: null,
      staff_id: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listCertificatesResultSchema
// ---------------------------------------------------------------------------

describe("listCertificatesResultSchema", () => {
  it("accepts empty results", () => {
    const result = listCertificatesResultSchema.safeParse({
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts paginated results with items", () => {
    const result = listCertificatesResultSchema.safeParse({
      certificates: [
        {
          certificate_uuid: "cert_1",
          certificate_type: true,
          certificate_title: "Title",
          certificate_issuer: "Issuer",
          certificate_url: null,
          candidate_id: 42,
          candidate_work_history_id: null,
          exam_uuid: null,
          store_id: null,
          company_id: null,
          parent_company_id: null,
          start_date: "2025-01-01",
          end_date: null,
          staff_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total field", () => {
    const result = listCertificatesResultSchema.safeParse({
      certificates: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: certificateActionSuccessSchema
// ---------------------------------------------------------------------------

describe("certificateActionSuccessSchema", () => {
  it("accepts success result", () => {
    const result = certificateActionSuccessSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
  });

  it("accepts failure result", () => {
    const result = certificateActionSuccessSchema.safeParse({ success: false });
    expect(result.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const result = certificateActionSuccessSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const result = certificateActionSuccessSchema.safeParse({
      success: "yes",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape (via Zod output schema)
// ---------------------------------------------------------------------------

describe("ListCertificatesResult shape (via Zod)", () => {
  it("accepts empty result via schema", () => {
    const r: ListCertificatesResult = {
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listCertificatesResultSchema.safeParse(r).success).toBe(true);
  });
});
