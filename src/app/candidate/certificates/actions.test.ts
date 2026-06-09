import { describe, it, expect } from "vitest";
import {
  listCertificatesSchema,
  getCertificateSchema,
  type CertificateListItem,
  type ListCertificatesResult,
} from "@/modules/certificates/actions";

// ---------------------------------------------------------------------------
// Schema tests for candidate/certificates actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listCertificatesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listCertificatesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCertificatesSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listCertificatesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCertificatesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page (must be positive)", () => {
    const result = listCertificatesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

describe("getCertificateSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getCertificateSchema.safeParse({ uuid: "abc-123-def-456" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getCertificateSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getCertificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (compile-time documentation)
// ---------------------------------------------------------------------------

type CertificateItem = CertificateListItem;

describe("CertificateListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: CertificateItem = {
      certificate_uuid: "abc-123-def-456",
      certificate_type: true,
      certificate_title: "IELTS Score Report",
      certificate_issuer: "British Council",
      certificate_url: "https://example.com/cert.pdf",
      candidate_id: 1,
      candidate_work_history_id: null,
      exam_uuid: null,
      store_id: null,
      company_id: null,
      parent_company_id: null,
      start_date: "2026-01-01T00:00:00.000Z",
      end_date: "2026-12-31T00:00:00.000Z",
      staff_id: null,
      created_at: null,
      updated_at: null,
    };
    expect(mock.certificate_uuid).toBe("abc-123-def-456");
    expect(mock.certificate_title).toBe("IELTS Score Report");
    expect(mock.certificate_issuer).toBe("British Council");
    expect(mock.candidate_id).toBe(1);
  });
});

describe("ListCertificatesResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListCertificatesResult = {
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.certificates).toHaveLength(0);
  });
});
