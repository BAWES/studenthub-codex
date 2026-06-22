import { describe, it, expect } from "vitest";
import {
  certificateListItemSchema,
  listCertificatesResultSchema,
  deleteCertificateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// certificateListItemSchema
// ---------------------------------------------------------------------------

describe("certificateListItemSchema", () => {
  it("accepts a valid certificate list item", () => {
    const input = {
      certificate_uuid: "abc-123-def",
      certificate_type: true,
      certificate_title: "AWS Solutions Architect",
      certificate_issuer: "Amazon Web Services",
      certificate_url: "https://aws.amazon.com/certification/",
      candidate_id: 42,
      candidate_work_history_id: 7,
      exam_uuid: "exam-111-222",
      store_id: 3,
      company_id: 1,
      parent_company_id: null,
      start_date: "2024-01-01",
      end_date: "2027-01-01",
      staff_id: null,
      created_at: new Date("2026-01-15"),
      updated_at: new Date("2026-01-15"),
    };
    const result = certificateListItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts all-nullable fields as null", () => {
    const input = {
      certificate_uuid: "abc-456-def",
      certificate_type: null,
      certificate_title: null,
      certificate_issuer: null,
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
    };
    const result = certificateListItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects missing certificate_uuid", () => {
    const input = {
      candidate_id: 42,
      created_at: null,
      updated_at: null,
    };
    const result = certificateListItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-string certificate_uuid", () => {
    const input = {
      certificate_uuid: 12345,
      certificate_type: null,
      certificate_title: null,
      certificate_issuer: null,
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
    };
    const result = certificateListItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const input = {
      certificate_uuid: "abc-789-def",
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
    };
    const result = certificateListItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean certificate_type", () => {
    const input = {
      certificate_uuid: "abc-789-def",
      certificate_type: "not-a-boolean",
      certificate_title: null,
      certificate_issuer: null,
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
    };
    const result = certificateListItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCertificatesResultSchema
// ---------------------------------------------------------------------------

describe("listCertificatesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const input = {
      certificates: [
        {
          certificate_uuid: "aaa-111",
          certificate_type: true,
          certificate_title: "Cert A",
          certificate_issuer: "Org A",
          certificate_url: "https://example.com/a",
          candidate_id: 1,
          candidate_work_history_id: null,
          exam_uuid: null,
          store_id: null,
          company_id: null,
          parent_company_id: null,
          start_date: null,
          end_date: null,
          staff_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          certificate_uuid: "aaa-222",
          certificate_type: null,
          certificate_title: null,
          certificate_issuer: null,
          certificate_url: null,
          candidate_id: 2,
          candidate_work_history_id: null,
          exam_uuid: null,
          store_id: null,
          company_id: null,
          parent_company_id: null,
          start_date: null,
          end_date: null,
          staff_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listCertificatesResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificates).toHaveLength(2);
    }
  });

  it("accepts an empty certificates array", () => {
    const input = {
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listCertificatesResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificates).toHaveLength(0);
    }
  });

  it("rejects non-number totalPages", () => {
    const input = {
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: "not-a-number",
    };
    const result = listCertificatesResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-array certificates", () => {
    const input = {
      certificates: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listCertificatesResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCertificateResultSchema
// ---------------------------------------------------------------------------

describe("deleteCertificateResultSchema", () => {
  it("accepts a successful delete result", () => {
    const result = deleteCertificateResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a failed delete result", () => {
    const result = deleteCertificateResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const result = deleteCertificateResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const result = deleteCertificateResultSchema.safeParse({
      success: "maybe",
    });
    expect(result.success).toBe(false);
  });

  it("strips unknown extra fields", () => {
    const result = deleteCertificateResultSchema.safeParse({
      success: true,
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).extraField).toBeUndefined();
    }
  });
});
