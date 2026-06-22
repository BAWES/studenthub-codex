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

describe("listCertificatesSchema", () => {
  it("accepts empty params", () => {
    const r = listCertificatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCertificatesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getCertificateSchema", () => {
  it("accepts valid UUID", () => {
    const r = getCertificateSchema.safeParse({ uuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getCertificateSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("createCertificateSchema", () => {
  it("accepts all-optional create", () => {
    expect(createCertificateSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial fields", () => {
    const r = createCertificateSchema.safeParse({ certificateTitle: "AWS Certified" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.certificateTitle).toBe("AWS Certified");
  });
});

describe("updateCertificateSchema", () => {
  it("accepts valid update", () => {
    const r = updateCertificateSchema.safeParse({
      certificateUuid: "550e8400-e29b-41d4-a716-446655440000",
      certificateTitle: "Updated Cert",
    });
    expect(r.success).toBe(true);
  });
});

describe("deleteCertificateSchema", () => {
  it("accepts valid UUID", () => {
    expect(deleteCertificateSchema.safeParse({ certificateUuid: "uuid" }).success).toBe(true);
  });
});

describe("certificateItemSchema", () => {
  it("accepts valid item", () => {
    const r = certificateItemSchema.safeParse({
      certificate_uuid: "550e8400-e29b-41d4-a716-446655440000",
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
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate_id", () => {
    expect(certificateItemSchema.safeParse({ certificate_uuid: "uuid" }).success).toBe(false);
  });
});

describe("listCertificatesResultSchema", () => {
  it("accepts valid result", () => {
    expect(listCertificatesResultSchema.safeParse({ certificates: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success).toBe(true);
  });
});

describe("certificateActionResultSchema", () => {
  it("accepts success", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "success", message: "Done" });
    expect(r.success).toBe(true);
  });

  it("accepts error", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });
});

describe("deleteCertificateResultSchema", () => {
  it("accepts success", () => {
    expect(deleteCertificateResultSchema.safeParse({ operation: "success", message: "Deleted" }).success).toBe(true);
  });

  it("accepts error", () => {
    expect(deleteCertificateResultSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(true);
  });
});
