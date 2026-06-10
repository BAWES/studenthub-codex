import { describe, it, expect } from "vitest";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  type CertificationItem,
  type CertificationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCertificationsSchema
// ---------------------------------------------------------------------------

describe("listCertificationsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listCertificationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listCertificationsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCertificationsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCertificationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCertificationsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const result = listCertificationsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });
});

// ---------------------------------------------------------------------------
// getCertificationSchema
// ---------------------------------------------------------------------------

describe("getCertificationSchema", () => {
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
// createCertificationSchema
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

  it("accepts full data with optional fields", () => {
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
      expect(result.data.certificationName).toBe("AWS Certified Solutions Architect");
      expect(result.data.credentialUrl).toBe("https://aws.amazon.com/verify/12345");
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
});

// ---------------------------------------------------------------------------
// updateCertificationSchema
// ---------------------------------------------------------------------------

describe("updateCertificationSchema", () => {
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

  it("rejects missing certification ID", () => {
    expect(updateCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty certification ID", () => {
    expect(updateCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCertificationSchema
// ---------------------------------------------------------------------------

describe("deleteCertificationSchema", () => {
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

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("CertificationItem shape", () => {
  it("defines the expected fields", () => {
    const mock: CertificationItem = {
      certification_id: 1,
      certification_name: "AWS Certified",
      issuing_organization: "Amazon",
      issue_date: new Date("2024-01-15"),
      expiry_date: new Date("2027-01-15"),
      credential_id: "AWS-12345",
      credential_url: "https://aws.amazon.com/verify/12345",
      description: "Professional-level certification",
      created_at: new Date("2024-06-01"),
      updated_at: new Date("2024-06-01"),
    };
    expect(mock.certification_id).toBe(1);
    expect(mock.certification_name).toBe("AWS Certified");
    expect(mock.credential_url).toBe("https://aws.amazon.com/verify/12345");
  });

  it("accepts null optional fields", () => {
    const mock: CertificationItem = {
      certification_id: 2,
      certification_name: "Cert",
      issuing_organization: "Org",
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    };
    expect(mock.issue_date).toBeNull();
    expect(mock.credential_url).toBeNull();
  });
});

describe("CertificationActionResult shape", () => {
  it("accepts success result", () => {
    const result: CertificationActionResult = { success: true, certificationId: 42 };
    expect(result.success).toBe(true);
    expect(result.certificationId).toBe(42);
  });

  it("accepts failure result", () => {
    const result: CertificationActionResult = { success: false, error: "Not found" };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not found");
  });
});
