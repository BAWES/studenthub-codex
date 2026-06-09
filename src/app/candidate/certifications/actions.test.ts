import { describe, it, expect } from "vitest";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/certifications actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listCertificationsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listCertificationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listCertificationsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCertificationsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCertificationsSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getCertificationSchema", () => {
  it("accepts a valid certification ID string", () => {
    const r = getCertificationSchema.safeParse({ certificationId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationId).toBe(42);
    }
  });

  it("accepts a numeric certification ID", () => {
    const r = getCertificationSchema.safeParse({ certificationId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationId).toBe(42);
    }
  });

  it("rejects missing certificationId", () => {
    expect(getCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero certificationId", () => {
    expect(getCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });

  it("rejects negative certificationId", () => {
    expect(getCertificationSchema.safeParse({ certificationId: -1 }).success).toBe(false);
  });
});

describe("createCertificationSchema", () => {
  it("accepts valid required fields only", () => {
    const r = createCertificationSchema.safeParse({
      certificationName: "PMP",
      issuingOrganization: "PMI",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("PMP");
      expect(r.data.issuingOrganization).toBe("PMI");
    }
  });

  it("accepts all optional fields", () => {
    const r = createCertificationSchema.safeParse({
      certificationName: "AWS Certified Solutions Architect",
      issuingOrganization: "Amazon Web Services",
      issueDate: "2024-01-15",
      expiryDate: "2027-01-15",
      credentialId: "AWS-12345",
      credentialUrl: "https://aws.amazon.com/verify/12345",
      description: "Professional certification for cloud architecture",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty certification name", () => {
    expect(
      createCertificationSchema.safeParse({
        certificationName: "",
        issuingOrganization: "PMI",
      }).success,
    ).toBe(false);
  });

  it("rejects missing certification name", () => {
    expect(
      createCertificationSchema.safeParse({ issuingOrganization: "PMI" }).success,
    ).toBe(false);
  });

  it("rejects empty issuing organization", () => {
    expect(
      createCertificationSchema.safeParse({
        certificationName: "PMP",
        issuingOrganization: "",
      }).success,
    ).toBe(false);
  });

  it("rejects certification name over 255 chars", () => {
    expect(
      createCertificationSchema.safeParse({
        certificationName: "x".repeat(256),
        issuingOrganization: "PMI",
      }).success,
    ).toBe(false);
  });

  it("rejects credential URL that is not a valid URL", () => {
    const r = createCertificationSchema.safeParse({
      certificationName: "PMP",
      issuingOrganization: "PMI",
      credentialUrl: "not-a-url",
    });
    expect(r.success).toBe(false);
  });

  it("accepts empty credential URL", () => {
    const r = createCertificationSchema.safeParse({
      certificationName: "PMP",
      issuingOrganization: "PMI",
      credentialUrl: "",
    });
    expect(r.success).toBe(true);
  });

  it("trims whitespace from name fields", () => {
    const r = createCertificationSchema.safeParse({
      certificationName: "  PMP  ",
      issuingOrganization: "  PMI  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("PMP");
      expect(r.data.issuingOrganization).toBe("PMI");
    }
  });

  it("rejects credential ID over 128 chars", () => {
    expect(
      createCertificationSchema.safeParse({
        certificationName: "PMP",
        issuingOrganization: "PMI",
        credentialId: "x".repeat(129),
      }).success,
    ).toBe(false);
  });
});

describe("updateCertificationSchema", () => {
  it("accepts valid update params", () => {
    const r = updateCertificationSchema.safeParse({
      certificationId: 42,
      certificationName: "CPA",
      issuingOrganization: "AICPA",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationId).toBe(42);
      expect(r.data.certificationName).toBe("CPA");
    }
  });

  it("accepts update with all optional fields", () => {
    const r = updateCertificationSchema.safeParse({
      certificationId: 42,
      certificationName: "CFA",
      issuingOrganization: "CFA Institute",
      issueDate: "2023-06-01",
      expiryDate: "2026-06-01",
      credentialId: "CFA-98765",
      credentialUrl: "https://cfainstitute.org/verify/98765",
      description: "Chartered Financial Analyst",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing certificationId", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationName: "CPA",
        issuingOrganization: "AICPA",
      }).success,
    ).toBe(false);
  });

  it("rejects missing certification name", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationId: 42,
        issuingOrganization: "AICPA",
      }).success,
    ).toBe(false);
  });

  it("rejects empty certification name", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationId: 42,
        certificationName: "",
        issuingOrganization: "AICPA",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCertificationSchema", () => {
  it("accepts valid certification ID", () => {
    const r = deleteCertificationSchema.safeParse({ certificationId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationId).toBe(42);
    }
  });

  it("rejects zero certificationId", () => {
    expect(deleteCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });

  it("rejects missing certificationId", () => {
    expect(deleteCertificationSchema.safeParse({}).success).toBe(false);
  });
});
