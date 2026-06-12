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
  it("accepts valid certificate ID", () => {
    const r = getCertificateSchema.safeParse({ certificateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificateId).toBe(42);
    }
  });

  it("coerces string ID", () => {
    const r = getCertificateSchema.safeParse({ certificateId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificateId).toBe(42);
    }
  });

  it("rejects missing certificateId", () => {
    expect(getCertificateSchema.safeParse({}).success).toBe(false);
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

  it("rejects missing certificateTitle", () => {
    expect(
      createCertificateSchema.safeParse({
        certificateType: true,
        certificateIssuer: "Amazon",
      }).success,
    ).toBe(false);
  });

  it("rejects empty certificateTitle", () => {
    expect(
      createCertificateSchema.safeParse({
        ...validInput,
        certificateTitle: "",
      }).success,
    ).toBe(false);
  });

  it("rejects non-boolean certificateType", () => {
    expect(
      createCertificateSchema.safeParse({
        ...validInput,
        certificateType: "yes",
      }).success,
    ).toBe(false);
  });
});

describe("updateCertificateSchema", () => {
  const validInput = {
    certificateId: 1,
    certificateType: true,
    certificateTitle: "Updated Cert",
    certificateIssuer: "Updated Issuer",
  };

  it("accepts valid update", () => {
    const r = updateCertificateSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("rejects missing certificateId", () => {
    expect(
      updateCertificateSchema.safeParse({
        certificateTitle: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects empty certificateTitle", () => {
    expect(
      updateCertificateSchema.safeParse({
        ...validInput,
        certificateTitle: "",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCertificateSchema", () => {
  it("accepts valid certificate ID", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateId: 42 }).success,
    ).toBe(true);
  });

  it("coerces string ID", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateId: "42" }).success,
    ).toBe(true);
  });

  it("rejects missing certificateId", () => {
    expect(deleteCertificateSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("certificateItemSchema", () => {
  it("accepts valid item", () => {
    expect(
      certificateItemSchema.safeParse({
        certificateId: 1,
        certificateType: true,
        certificateTitle: "AWS",
        certificateIssuer: "Amazon",
        certificateUrl: null,
        startDate: null,
        endDate: null,
        createdAt: null,
        updatedAt: null,
      }).success,
    ).toBe(true);
  });
});

describe("certificateDetailOutputSchema", () => {
  it("accepts valid certificate item", () => {
    expect(
      certificateDetailOutputSchema.safeParse({
        certificateId: 1,
        certificateType: true,
        certificateTitle: "AWS",
        certificateIssuer: "Amazon",
        certificateUrl: null,
        startDate: null,
        endDate: null,
        createdAt: null,
        updatedAt: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(certificateDetailOutputSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing required field", () => {
    expect(
      certificateDetailOutputSchema.safeParse({
        certificateId: 1,
      }).success,
    ).toBe(false);
  });
});
