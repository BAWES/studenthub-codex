import { describe, it, expect } from "vitest";
import { createCertificationSchema } from "./schemas";
import type { CertificationActionResult } from "./schemas";

// ---------------------------------------------------------------------------
// createCertificationSchema — unit tests for the colocated route-level schema
// ---------------------------------------------------------------------------

describe("createCertificationSchema", () => {
  it("accepts valid minimal data", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("AWS Certified");
      expect(result.data.issuingOrganization).toBe("Amazon");
    }
  });

  it("accepts full data with all optional fields", () => {
    const result = createCertificationSchema.safeParse({
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
      expect(result.data.certificationName).toBe(
        "AWS Certified Solutions Architect",
      );
      expect(result.data.credentialUrl).toBe(
        "https://aws.amazon.com/verify/12345",
      );
    }
  });

  it("rejects missing certification name", () => {
    const result = createCertificationSchema.safeParse({
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty certification name", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "",
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing issuing organization", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 255 characters", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "x".repeat(256),
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name and organization", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "  AWS Certified  ",
      issuingOrganization: "  Amazon  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("AWS Certified");
      expect(result.data.issuingOrganization).toBe("Amazon");
    }
  });

  it("rejects invalid credential URL", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
      credentialUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string credential URL", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
      credentialUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects description over 1000 characters", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
      description: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects credentialId over 128 characters", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
      credentialId: "x".repeat(129),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CertificationActionResult type shape tests
// ---------------------------------------------------------------------------

describe("CertificationActionResult shape", () => {
  it("accepts success result", () => {
    const result: CertificationActionResult = {
      success: true,
      certificationId: 42,
    };
    expect(result.success).toBe(true);
    expect(result.certificationId).toBe(42);
  });

  it("accepts failure result", () => {
    const result: CertificationActionResult = {
      success: false,
      error: "Validation failed",
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
  });
});
