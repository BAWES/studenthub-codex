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
  certificateDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/certificates
// ---------------------------------------------------------------------------

describe("listCertificatesSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listCertificatesSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listCertificatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listCertificatesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listCertificatesSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("coerces string page and limit", () => {
    const r = listCertificatesSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getCertificateSchema", () => {
  it("accepts valid certificate UUID", () => {
    const r = getCertificateSchema.safeParse({ uuid: "abc-123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("abc-123");
    }
  });

  it("rejects missing uuid", () => {
    expect(getCertificateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(getCertificateSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("createCertificateSchema", () => {
  const validInput = {
    certificateType: true,
    certificateTitle: "AWS Certified",
    certificateIssuer: "Amazon",
  };

  it("accepts valid input", () => {
    const r = createCertificateSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("accepts empty input (all fields optional)", () => {
    expect(createCertificateSchema.safeParse({}).success).toBe(true);
  });

  it("rejects non-boolean certificateType", () => {
    expect(
      createCertificateSchema.safeParse({
        ...validInput,
        certificateType: "yes",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string certificateTitle", () => {
    expect(
      createCertificateSchema.safeParse({
        ...validInput,
        certificateTitle: 42,
      }).success,
    ).toBe(false);
  });
});

describe("updateCertificateSchema", () => {
  const validInput = {
    certificateUuid: "abc-123",
    certificateType: true,
    certificateTitle: "Updated Cert",
    certificateIssuer: "Updated Issuer",
  };

  it("accepts valid update", () => {
    const r = updateCertificateSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("rejects missing certificateUuid", () => {
    expect(
      updateCertificateSchema.safeParse({
        certificateTitle: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(
      updateCertificateSchema.safeParse({
        ...validInput,
        certificateUuid: "",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCertificateSchema", () => {
  it("accepts valid certificate UUID", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateUuid: "abc-123" }).success,
    ).toBe(true);
  });

  it("rejects missing certificateUuid", () => {
    expect(deleteCertificateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("certificateItemSchema", () => {
  it("accepts valid item", () => {
    expect(
      certificateItemSchema.safeParse({
        certificate_uuid: "uuid-1",
        certificate_type: true,
        certificate_title: "AWS",
        certificate_issuer: "Amazon",
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
      }).success,
    ).toBe(true);
  });
});

describe("certificateDetailOutputSchema", () => {
  it("accepts valid certificate item", () => {
    expect(
      certificateDetailOutputSchema.safeParse({
        certificate_uuid: "uuid-2",
        certificate_type: false,
        certificate_title: "AWS",
        certificate_issuer: null,
        certificate_url: "https://cert.example.com",
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
      }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(certificateDetailOutputSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing required field", () => {
    expect(
      certificateDetailOutputSchema.safeParse({
        certificate_uuid: "uuid-3",
      }).success,
    ).toBe(false);
  });
});
