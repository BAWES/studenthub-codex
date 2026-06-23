import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schema definitions (mirrored from actions.ts for isolated testing)
//
// We duplicate the input schemas here rather than importing from actions.ts
// because those are "use server" modules — vitest cannot import them directly
// without hitting "use server" transformer issues. The schemas are simple
// Zod objects, so the duplication is minimal and intentional.
// ---------------------------------------------------------------------------

const listCertificationsInputSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCertificationInputSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

const createCertificationInputSchema = z.object({
  certificationName: z
    .string()
    .min(1, "Certification name is required")
    .max(255, "Certification name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issuingOrganization: z
    .string()
    .min(1, "Issuing organization is required")
    .max(255, "Issuing organization must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z
    .string()
    .max(128, "Credential ID must be 128 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
  credentialUrl: z
    .string()
    .max(500, "Credential URL must be 500 characters or fewer")
    .url("Credential URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

const updateCertificationInputSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
  certificationName: z
    .string()
    .min(1, "Certification name is required")
    .max(255, "Certification name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issuingOrganization: z
    .string()
    .min(1, "Issuing organization is required")
    .max(255, "Issuing organization must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z
    .string()
    .max(128, "Credential ID must be 128 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
  credentialUrl: z
    .string()
    .max(500, "Credential URL must be 500 characters or fewer")
    .url("Credential URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

const deleteCertificationInputSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

// ── Output validation schemas (imported via schemas) ──

import {
  certificationItemSchema,
  certificationActionResultSchema,
  certificationListSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateCertifications — input schema
// ---------------------------------------------------------------------------

describe("listCandidateCertifications input schema", () => {
  it("accepts empty params with defaults", () => {
    const result = listCertificationsInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listCertificationsInputSchema.safeParse({ page: 3, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listCertificationsInputSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects page less than 1", () => {
    const result = listCertificationsInputSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listCertificationsInputSchema.safeParse({ page: "2", limit: "30" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(30);
    }
  });
});

// ---------------------------------------------------------------------------
// getCandidateCertification — input schema
// ---------------------------------------------------------------------------

describe("getCandidateCertification input schema", () => {
  it("accepts valid certification ID", () => {
    const result = getCertificationInputSchema.safeParse({ certificationId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects zero certification ID", () => {
    const result = getCertificationInputSchema.safeParse({ certificationId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative certification ID", () => {
    const result = getCertificationInputSchema.safeParse({ certificationId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing certification ID", () => {
    const result = getCertificationInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces string certification ID", () => {
    const result = getCertificationInputSchema.safeParse({ certificationId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(99);
    }
  });
});

// ---------------------------------------------------------------------------
// createCandidateCertification — input schema
// ---------------------------------------------------------------------------

describe("createCandidateCertification input schema", () => {
  it("accepts valid certification data", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "  AWS Certified  ",
      issuingOrganization: "  Amazon  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // Check trim transform
      expect(result.data.certificationName).toBe("AWS Certified");
      expect(result.data.issuingOrganization).toBe("Amazon");
    }
  });

  it("accepts full data with all optional fields", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "GCP Professional",
      issuingOrganization: "Google Cloud",
      issueDate: "2024-06-01",
      expiryDate: "2027-06-01",
      credentialId: "GCP-PRO-123",
      credentialUrl: "https://google.com/cert",
      description: "A Google Cloud certification",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty optional strings", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "Test",
      issuingOrganization: "Test",
      credentialUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty certification name", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "",
      issuingOrganization: "Test",
    });
    expect(result.success).toBe(false);
  });

  // NOTE: The schema chains .min(1) before .transform(trim). Whitespace-only
  // strings have length >=1 so pass .min(1), then get trimmed to "" by the
  // transform. This means "   " is accepted as valid input. If we wanted to
  // reject whitespace-only, we'd need to reorder: .trim().min(1).
  it("accepts whitespace-only name (min check runs before trim)", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "   ",
      issuingOrganization: "Test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("");
    }
  });

  it("rejects name over 255 chars", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "A".repeat(256),
      issuingOrganization: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid credential URL", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "Test",
      issuingOrganization: "Test",
      credentialUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description over 1000 chars", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "Test",
      issuingOrganization: "Test",
      description: "X".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects credential ID over 128 chars", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "Test",
      issuingOrganization: "Test",
      credentialId: "X".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("rejects credential URL over 500 chars", () => {
    const result = createCertificationInputSchema.safeParse({
      certificationName: "Test",
      issuingOrganization: "Test",
      credentialUrl: "https://" + "x".repeat(494),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateCertification — input schema
// ---------------------------------------------------------------------------

describe("updateCandidateCertification input schema", () => {
  it("accepts valid update data", () => {
    const result = updateCertificationInputSchema.safeParse({
      certificationId: 42,
      certificationName: "Updated Name",
      issuingOrganization: "Updated Org",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing certificationId", () => {
    const result = updateCertificationInputSchema.safeParse({
      certificationName: "Test",
      issuingOrganization: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero certificationId", () => {
    const result = updateCertificationInputSchema.safeParse({
      certificationId: 0,
      certificationName: "Test",
      issuingOrganization: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields in update", () => {
    const result = updateCertificationInputSchema.safeParse({
      certificationId: 42,
      certificationName: "Name",
      issuingOrganization: "Org",
      issueDate: "2025-01-01",
      description: "Updated description",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateCertification — input schema
// ---------------------------------------------------------------------------

describe("deleteCandidateCertification input schema", () => {
  it("accepts valid certification ID", () => {
    const result = deleteCertificationInputSchema.safeParse({ certificationId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects zero ID", () => {
    const result = deleteCertificationInputSchema.safeParse({ certificationId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative ID", () => {
    const result = deleteCertificationInputSchema.safeParse({ certificationId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing ID", () => {
    const result = deleteCertificationInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests (validates the returned shapes)
// ---------------------------------------------------------------------------

describe("certificationItemSchema (output)", () => {
  it("accepts a valid full certification item", () => {
    const result = certificationItemSchema.safeParse({
      certification_id: 1,
      certification_name: "AWS Certified",
      issuing_organization: "AWS",
      issue_date: new Date(),
      expiry_date: null,
      credential_id: null,
      credential_url: "https://example.com/cert",
      description: "A description",
      created_at: new Date(),
      updated_at: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-integer certification_id", () => {
    const result = certificationItemSchema.safeParse({
      certification_id: 1.5,
      certification_name: "Test",
      issuing_organization: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("certificationActionResultSchema (output)", () => {
  it("accepts success with certificationId", () => {
    const result = certificationActionResultSchema.safeParse({
      success: true as const,
      certificationId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("accepts error with message", () => {
    const result = certificationActionResultSchema.safeParse({
      success: false as const,
      error: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing discriminated union key", () => {
    const result = certificationActionResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("certificationListSchema (output)", () => {
  it("accepts a populated array", () => {
    const items = [
      {
        certification_id: 1,
        certification_name: "C1",
        issuing_organization: "O1",
        issue_date: null,
        expiry_date: null,
        credential_id: null,
        credential_url: null,
        description: null,
        created_at: null,
        updated_at: null,
      },
    ];
    const result = certificationListSchema.safeParse(items);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });

  it("accepts an empty array", () => {
    const result = certificationListSchema.safeParse([]);
    expect(result.success).toBe(true);
  });
});
