import { describe, it, expect } from "vitest";
import {
  getCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// getCertificationSchema
// ---------------------------------------------------------------------------

describe("getCertificationSchema ([certificationId] route)", () => {
  it("accepts a valid certification ID", () => {
    const result = getCertificationSchema.safeParse({ certificationId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("coerces string certification ID to number", () => {
    const result = getCertificationSchema.safeParse({ certificationId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("rejects missing certification ID", () => {
    expect(getCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero certification ID", () => {
    expect(getCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });

  it("rejects negative certification ID", () => {
    expect(getCertificationSchema.safeParse({ certificationId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCertificationSchema
// ---------------------------------------------------------------------------

describe("updateCertificationSchema ([certificationId] route)", () => {
  it("accepts valid update data", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "Updated Cert",
      issuingOrganization: "Updated Org",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(1);
    }
  });

  it("accepts full update data with optional fields", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "AWS Certified Solutions Architect",
      issuingOrganization: "Amazon Web Services",
      issueDate: "2024-01-15",
      expiryDate: "2027-01-15",
      credentialId: "AWS-12345",
      credentialUrl: "https://aws.amazon.com/verify/12345",
      description: "Professional-level cloud architecture certification",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(1);
      expect(result.data.certificationName).toBe("AWS Certified Solutions Architect");
    }
  });

  it("rejects missing certification ID", () => {
    expect(updateCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero certification ID", () => {
    expect(updateCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });

  it("rejects missing certification name", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationId: 1,
        issuingOrganization: "Org",
      }).success,
    ).toBe(false);
  });

  it("rejects missing issuing organization", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationId: 1,
        certificationName: "Cert",
      }).success,
    ).toBe(false);
  });

  it("trims whitespace from name and organization", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "  My Cert  ",
      issuingOrganization: "  My Org  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("My Cert");
      expect(result.data.issuingOrganization).toBe("My Org");
    }
  });

  it("rejects name over 255 characters", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationId: 1,
        certificationName: "x".repeat(256),
        issuingOrganization: "Org",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid credential URL", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationId: 1,
        certificationName: "Cert",
        issuingOrganization: "Org",
        credentialUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("accepts empty string credential URL", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "Cert",
      issuingOrganization: "Org",
      credentialUrl: "",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteCertificationSchema
// ---------------------------------------------------------------------------

describe("deleteCertificationSchema ([certificationId] route)", () => {
  it("accepts a valid certification ID", () => {
    const result = deleteCertificationSchema.safeParse({ certificationId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("rejects missing certification ID", () => {
    expect(deleteCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero ID", () => {
    expect(deleteCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });
});
