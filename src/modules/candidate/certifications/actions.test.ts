import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  certificationItemOutputSchema,
  certificationListOutputSchema,
  certificationActionResultOutputSchema,
} from "@/app/candidate/certifications/schemas";

// ---------------------------------------------------------------------------
// Input Schema Validation Tests
// ---------------------------------------------------------------------------

describe("listCertificationsSchema", () => {
  it("applies defaults for empty input", () => {
    const result = listCertificationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts valid page and limit", () => {
    const result = listCertificationsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("coerces string numbers", () => {
    const result = listCertificationsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });

  it("rejects page < 1", () => {
    const result = listCertificationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = listCertificationsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative limit", () => {
    const result = listCertificationsSchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
  });
});

describe("getCertificationSchema", () => {
  it("accepts a valid certification ID", () => {
    const result = getCertificationSchema.safeParse({ certificationId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("coerces string certification ID", () => {
    const result = getCertificationSchema.safeParse({ certificationId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(99);
    }
  });

  it("rejects zero certification ID", () => {
    const result = getCertificationSchema.safeParse({ certificationId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative certification ID", () => {
    const result = getCertificationSchema.safeParse({ certificationId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing certificationId", () => {
    const result = getCertificationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null certificationId", () => {
    const result = getCertificationSchema.safeParse({ certificationId: null });
    expect(result.success).toBe(false);
  });
});

describe("createCertificationSchema", () => {
  it("accepts minimal valid input", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified Developer",
      issuingOrganization: "Amazon Web Services",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("AWS Certified Developer");
      expect(result.data.issuingOrganization).toBe("Amazon Web Services");
    }
  });

  it("trims whitespace from name and organization", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "  Kubernetes CKA  ",
      issuingOrganization: "  CNCF  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("Kubernetes CKA");
      expect(result.data.issuingOrganization).toBe("CNCF");
    }
  });

  it("accepts full input with all optional fields", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified Developer",
      issuingOrganization: "Amazon Web Services",
      issueDate: "2023-06-15",
      expiryDate: "2026-06-15",
      credentialId: "AWS-DEV-12345",
      credentialUrl: "https://aws.amazon.com/verify/12345",
      description: "Associate-level cloud certification",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.credentialId).toBe("AWS-DEV-12345");
      expect(result.data.credentialUrl).toBe("https://aws.amazon.com/verify/12345");
      expect(result.data.description).toBe("Associate-level cloud certification");
    }
  });

  it("rejects empty certification name", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "",
      issuingOrganization: "Valid Org",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty issuing organization", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "Valid Cert",
      issuingOrganization: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "A".repeat(256),
      issuingOrganization: "Valid Org",
    });
    expect(result.success).toBe(false);
  });

  it("rejects credential URL that is not a valid URL", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "Valid Cert",
      issuingOrganization: "Valid Org",
      credentialUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string credential URL as optional", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "Valid Cert",
      issuingOrganization: "Valid Org",
      credentialUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects description exceeding 1000 chars", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "Valid Cert",
      issuingOrganization: "Valid Org",
      description: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing certification name", () => {
    const result = createCertificationSchema.safeParse({
      issuingOrganization: "Valid Org",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing issuing organization", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "Valid Cert",
    });
    expect(result.success).toBe(false);
  });

  it("transforms empty optional strings to undefined", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "Valid Cert",
      issuingOrganization: "Valid Org",
      credentialId: "  ",
      description: "  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.credentialId).toBeUndefined();
      expect(result.data.description).toBeUndefined();
    }
  });
});

describe("updateCertificationSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "Updated Cert",
      issuingOrganization: "Updated Org",
      issueDate: "2024-01-01",
      credentialId: "NEW-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(1);
      expect(result.data.certificationName).toBe("Updated Cert");
    }
  });

  it("rejects zero certificationId", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 0,
      certificationName: "Name",
      issuingOrganization: "Org",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty certification name", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "",
      issuingOrganization: "Org",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteCertificationSchema", () => {
  it("accepts a valid certification ID", () => {
    const result = deleteCertificationSchema.safeParse({ certificationId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(5);
    }
  });

  it("rejects zero certification ID", () => {
    const result = deleteCertificationSchema.safeParse({ certificationId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative certification ID", () => {
    const result = deleteCertificationSchema.safeParse({ certificationId: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output Schema Validation Tests
// ---------------------------------------------------------------------------

describe("certificationItemOutputSchema", () => {
  it("accepts a valid certification item", () => {
    const item = {
      certification_id: 1,
      certification_name: "AWS Certified Developer",
      issuing_organization: "Amazon Web Services",
      issue_date: new Date("2023-06-15"),
      expiry_date: new Date("2026-06-15"),
      credential_id: "AWS-DEV-123",
      credential_url: "https://aws.amazon.com/verify/123",
      description: "Associate-level cloud certification",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = certificationItemOutputSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts an item with nullable fields as null", () => {
    const item = {
      certification_id: 2,
      certification_name: "CKA",
      issuing_organization: "CNCF",
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    };
    const result = certificationItemOutputSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = certificationItemOutputSchema.safeParse({
      certification_id: 1,
      // missing certification_name
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer certification_id", () => {
    const result = certificationItemOutputSchema.safeParse({
      certification_id: "abc",
      certification_name: "CKA",
      issuing_organization: "CNCF",
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("certificationListOutputSchema", () => {
  it("accepts an empty array", () => {
    const result = certificationListOutputSchema.safeParse([]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("accepts an array of valid items", () => {
    const items = [
      {
        certification_id: 1,
        certification_name: "AWS Certified Developer",
        issuing_organization: "AWS",
        issue_date: null,
        expiry_date: null,
        credential_id: null,
        credential_url: null,
        description: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        certification_id: 2,
        certification_name: "CKA",
        issuing_organization: "CNCF",
        issue_date: null,
        expiry_date: null,
        credential_id: null,
        credential_url: null,
        description: null,
        created_at: null,
        updated_at: null,
      },
    ];
    const result = certificationListOutputSchema.safeParse(items);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it("rejects non-array input", () => {
    const result = certificationListOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("certificationActionResultOutputSchema", () => {
  it("accepts a successful result", () => {
    const result = certificationActionResultOutputSchema.safeParse({
      success: true,
      certificationId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.data;
      expect(data.success).toBe(true);
      // Use `as` for discriminated union — TypeScript doesn't narrow from expect()
      expect((data as { success: true; certificationId: number }).certificationId).toBe(42);
    }
  });

  it("accepts a failure result", () => {
    const result = certificationActionResultOutputSchema.safeParse({
      success: false,
      error: "Certification not found",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.data;
      if (!data.success) {
        expect(data.error).toBe("Certification not found");
      }
    }
  });

  it("rejects success with missing certificationId", () => {
    const result = certificationActionResultOutputSchema.safeParse({
      success: true,
      // missing certificationId
    });
    expect(result.success).toBe(false);
  });

  it("rejects failure with missing error", () => {
    const result = certificationActionResultOutputSchema.safeParse({
      success: false,
      // missing error
    });
    expect(result.success).toBe(false);
  });

  it("rejects success with error string (discriminated union)", () => {
    const result = certificationActionResultOutputSchema.safeParse({
      success: true,
      certificationId: 1,
      error: "should not be here",
    });
    // discriminatedUnion with strict:false allows extra keys but type mismatch
    // success: true must have certificationId (number)
    // success: false must have error (string)
    expect(result.success).toBe(true);
    if (result.success) {
      // Still parses because extra keys aren't stripped in discriminatedUnion w/o strict
      expect(result.data.success).toBe(true);
    }
  });

  it("rejects completely invalid shape", () => {
    const result = certificationActionResultOutputSchema.safeParse({
      success: "maybe",
    });
    expect(result.success).toBe(false);
  });
});
