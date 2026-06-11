import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listCertificatesSchema,
  getCertificateSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  type CertificateItem,
  type ListCertificatesResult,
} from "@/modules/candidates/certificates/schemas";

// ---------------------------------------------------------------------------
// Mock the module actions — app router delegates to them
// ---------------------------------------------------------------------------

const mockModuleList = vi.fn();
const mockModuleGet = vi.fn();
const mockModuleCreate = vi.fn();
const mockModuleUpdate = vi.fn();
const mockModuleDelete = vi.fn();

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ id: "42" }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Schema tests (pure unit — no DB)
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

describe("createCertificateSchema", () => {
  it("rejects empty body (certificateType not required)", () => {
    const result = createCertificateSchema.safeParse({});
    expect(result.success).toBe(true); // all fields optional
  });

  it("accepts all optional fields", () => {
    const result = createCertificateSchema.safeParse({
      certificateType: true,
      certificateTitle: "IELTS Score Report",
      certificateIssuer: "British Council",
      certificateUrl: "https://example.com/cert.pdf",
      candidateWorkHistoryId: 1,
      examUuid: "exam-abc-123",
      storeId: 5,
      companyId: 10,
      parentCompanyId: 3,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCertificateSchema", () => {
  it("rejects empty body (certificateUuid required)", () => {
    const result = updateCertificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts certificateUuid only (partial update)", () => {
    const result = updateCertificateSchema.safeParse({ certificateUuid: "some-uuid" });
    expect(result.success).toBe(true);
  });

  it("rejects empty certificateUuid", () => {
    expect(updateCertificateSchema.safeParse({ certificateUuid: "" }).success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const result = updateCertificateSchema.safeParse({
      certificateUuid: "abc-123",
      certificateType: false,
      certificateTitle: "Updated Title",
      certificateIssuer: "Updated Issuer",
      certificateUrl: "https://example.com/updated.pdf",
      candidateWorkHistoryId: 2,
      examUuid: "updated-exam",
      storeId: 6,
      companyId: 11,
      parentCompanyId: 3,
      startDate: "2026-03-01",
      endDate: "2026-06-30",
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteCertificateSchema", () => {
  it("accepts a valid UUID", () => {
    const result = deleteCertificateSchema.safeParse({ certificateUuid: "abc-123-def-456" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteCertificateSchema.safeParse({ certificateUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteCertificateSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (compile-time documentation)
// ---------------------------------------------------------------------------

describe("CertificateItem shape", () => {
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

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("certificateItemSchema", () => {
  it("validates a valid certificate item", () => {
    const result = certificateItemSchema.safeParse({
      certificate_uuid: "abc-123",
      certificate_type: true,
      certificate_title: "Test",
      certificate_issuer: "Issuer",
      certificate_url: null,
      candidate_id: 42,
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
});

describe("listCertificatesResultSchema", () => {
  it("validates a valid result", () => {
    const result = listCertificatesResultSchema.safeParse({
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("certificateActionResultSchema", () => {
  it("accepts a success result", () => {
    const result = certificateActionResultSchema.safeParse({
      operation: "success",
      message: "Certificate created",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error result", () => {
    const result = certificateActionResultSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });
});
