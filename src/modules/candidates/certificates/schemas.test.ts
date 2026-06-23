import { describe, it, expect } from "vitest";
import {
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// certificateItemSchema
// ---------------------------------------------------------------------------

describe("certificateItemSchema", () => {
  const validItem = () => ({
    certificate_uuid: "cert-001",
    certificate_type: true,
    certificate_title: "AWS Certified",
    certificate_issuer: "Amazon",
    certificate_url: "https://example.com/cert",
    candidate_id: 123,
    candidate_work_history_id: 456,
    exam_uuid: "exam-001",
    store_id: 789,
    company_id: 10,
    parent_company_id: 11,
    start_date: "2026-01-01",
    end_date: "2026-06-01",
    staff_id: 999,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  });

  it("accepts a valid certificate item", () => {
    const r = certificateItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = certificateItemSchema.safeParse({
      ...validItem(),
      certificate_type: null,
      certificate_title: null,
      certificate_issuer: null,
      certificate_url: null,
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
    expect(r.success).toBe(true);
  });

  it("rejects missing certificate_uuid", () => {
    const { certificate_uuid: _, ...rest } = validItem();
    expect(certificateItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    expect(
      certificateItemSchema.safeParse({ ...validItem(), candidate_id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCertificatesResultSchema
// ---------------------------------------------------------------------------

describe("listCertificatesResultSchema", () => {
  const validItem = () => ({
    certificate_uuid: "c-1",
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

  it("accepts a valid paginated result", () => {
    const r = listCertificatesResultSchema.safeParse({
      certificates: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty certificates array", () => {
    const r = listCertificatesResultSchema.safeParse({
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative totalPages", () => {
    const r = listCertificatesResultSchema.safeParse({
      certificates: [], total: 0, page: 1, limit: 20, totalPages: -1,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// certificateActionResultSchema  (discriminatedUnion)
// ---------------------------------------------------------------------------

describe("certificateActionResultSchema", () => {
  it("accepts success operation", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "success", message: "Created" });
    expect(r.success).toBe(true);
  });

  it("accepts success with optional data", () => {
    const item = {
      certificate_uuid: "c-1",
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
    };
    const r = certificateActionResultSchema.safeParse({ operation: "success", message: "Created", data: item });
    expect(r.success).toBe(true);
  });

  it("accepts error operation", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "unknown", message: "Bad" });
    expect(r.success).toBe(false);
  });

  it("rejects missing message", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "success" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCertificateResultSchema
// ---------------------------------------------------------------------------

describe("deleteCertificateResultSchema", () => {
  it("accepts success operation", () => {
    const r = deleteCertificateResultSchema.safeParse({ operation: "success", message: "Deleted" });
    expect(r.success).toBe(true);
  });

  it("accepts error operation", () => {
    const r = deleteCertificateResultSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects missing message", () => {
    const r = deleteCertificateResultSchema.safeParse({ operation: "success" });
    expect(r.success).toBe(false);
  });
});
