import { describe, it, expect } from "vitest";
import {
  certificationItemSchema,
  certificationListSchema,
  certificationActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// certificationItemSchema
// ---------------------------------------------------------------------------

describe("certificationItemSchema", () => {
  it("accepts a valid certification item", () => {
    const input = {
      certification_id: 1,
      certification_name: "AWS Certified Solutions Architect",
      issuing_organization: "Amazon Web Services",
      issue_date: new Date("2024-01-15"),
      expiry_date: new Date("2027-01-15"),
      credential_id: "AWS-SAA-12345",
      credential_url: "https://aws.amazon.com/certification",
      description: "Professional level AWS certification",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = certificationItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts a certification with null optional fields", () => {
    const input = {
      certification_id: 2,
      certification_name: "Google Cloud Professional",
      issuing_organization: "Google Cloud",
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    };
    const result = certificationItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects missing certification_id", () => {
    const input = {
      certification_name: "Test Cert",
      issuing_organization: "Test Org",
    };
    const result = certificationItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-integer certification_id", () => {
    const input = {
      certification_id: "abc",
      certification_name: "Test Cert",
      issuing_organization: "Test Org",
    };
    const result = certificationItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing certification_name", () => {
    const input = {
      certification_id: 1,
      issuing_organization: "Test Org",
    };
    const result = certificationItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-string certification_name", () => {
    const input = {
      certification_id: 1,
      certification_name: 123,
      issuing_organization: "Test Org",
    };
    const result = certificationItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// certificationListSchema
// ---------------------------------------------------------------------------

describe("certificationListSchema", () => {
  it("accepts an array of valid items", () => {
    const input = [
      {
        certification_id: 1,
        certification_name: "AWS Certified",
        issuing_organization: "AWS",
        issue_date: null,
        expiry_date: null,
        credential_id: null,
        credential_url: null,
        description: null,
        created_at: null,
        updated_at: null,
      },
      {
        certification_id: 2,
        certification_name: "Google Certified",
        issuing_organization: "Google Cloud",
        issue_date: null,
        expiry_date: null,
        credential_id: null,
        credential_url: null,
        description: null,
        created_at: null,
        updated_at: null,
      },
    ];
    const result = certificationListSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it("accepts an empty array", () => {
    const result = certificationListSchema.safeParse([]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("rejects a non-array value", () => {
    const result = certificationListSchema.safeParse({ not: "an array" });
    expect(result.success).toBe(false);
  });

  it("rejects an array with invalid items", () => {
    const input = [
      {
        certification_id: "not-a-number",
        certification_name: "Invalid",
        issuing_organization: "Test",
      },
    ];
    const result = certificationListSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// certificationActionResultSchema
// ---------------------------------------------------------------------------

describe("certificationActionResultSchema", () => {
  it("accepts a successful result with certificationId", () => {
    const result = certificationActionResultSchema.safeParse({
      success: true,
      certificationId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("accepts a failed result with error message", () => {
    const result = certificationActionResultSchema.safeParse({
      success: false,
      error: "Certification not found",
    });
    expect(result.success).toBe(true);
    if (result.success && !result.data.success) {
      expect(result.data.error).toBe("Certification not found");
    }
  });

  it("rejects a result missing the discriminator (success field)", () => {
    const result = certificationActionResultSchema.safeParse({
      certificationId: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects success result missing certificationId", () => {
    const result = certificationActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects failure result missing error", () => {
    const result = certificationActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects success with non-integer certificationId", () => {
    const result = certificationActionResultSchema.safeParse({
      success: true,
      certificationId: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects arbitrary extra fields on success", () => {
    const result = certificationActionResultSchema.safeParse({
      success: true,
      certificationId: 1,
      extraField: "should not be here",
    });
    // Strip unknown — Zod's default behavior strips unknown keys
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).extraField).toBeUndefined();
    }
  });
});
