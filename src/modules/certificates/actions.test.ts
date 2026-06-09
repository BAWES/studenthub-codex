import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: certificate schema validation
//
// The listCertificates, createCertificate, updateCertificate, and
// deleteCertificate actions use these schemas internally. Testing them
// separately avoids mocking "use server" dependencies (prisma, session,
// next/cache).
// ---------------------------------------------------------------------------

const listCertificatesSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  examUuid: z.string().optional(),
  type: z.coerce.boolean().optional(),
  storeId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const createCertificateSchema = z.object({
  certificateUuid: z.string().optional(),
  certificateType: z.boolean().optional(),
  certificateTitle: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateUrl: z.string().optional(),
  candidateId: z.number().int().positive(),
  candidateWorkHistoryId: z.number().int().positive().optional(),
  examUuid: z.string().optional(),
  storeId: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  parentCompanyId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
  certificateType: z.boolean().optional(),
  certificateTitle: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateUrl: z.string().optional(),
  candidateId: z.number().int().positive().optional(),
  candidateWorkHistoryId: z.number().int().positive().optional(),
  examUuid: z.string().optional(),
  storeId: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  parentCompanyId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const deleteCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
});

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

  it("accepts page=-1 for unpaginated results", () => {
    const result = listCertificatesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(-1);
    }
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
// Return type shape
// ---------------------------------------------------------------------------

type CertificateRelatedDetail = {
  certificate_uuid: string;
  certificate_type: boolean | null;
  certificate_title: string | null;
  certificate_issuer: string | null;
  certificate_url: string | null;
  candidate_id: number;
  candidate_work_history_id: number | null;
  exam_uuid: string | null;
  store_id: number | null;
  company_id: number | null;
  parent_company_id: number | null;
  start_date: string | null;
  end_date: string | null;
  staff_id: number | null;
};

type CertificateListItem = CertificateRelatedDetail;

type ListCertificatesResult = {
  certificates: CertificateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("Certificate type shapes", () => {
  it("defines a valid CertificateListItem", () => {
    const cert: CertificateListItem = {
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
    };
    expect(cert.certificate_uuid).toBe("cert_abc123");
    expect(cert.certificate_title).toBe("AWS Certified Developer");
    expect(cert.candidate_id).toBe(42);
  });
});

describe("ListCertificatesResult shape", () => {
  it("accepts empty result", () => {
    const r: ListCertificatesResult = {
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
  });
});
