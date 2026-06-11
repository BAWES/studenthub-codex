import { describe, it, expect } from "vitest";
import {
  listCandidateCertificationsSchema,
  getCandidateCertificationSchema,
  createCandidateCertificationSchema,
  updateCandidateCertificationSchema,
  deleteCandidateCertificationSchema,
  candidateCertificationItemSchema,
  listCandidateCertificationsResultSchema,
  candidateCertificationActionResultSchema,
} from "./schemas";
import type {
  CandidateCertificationItem,
  ListCandidateCertificationsResult,
  CandidateCertificationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listCandidateCertificationsSchema", () => {
  it("requires candidateId", () => {
    const result = listCandidateCertificationsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listCandidateCertificationsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCandidateCertificationsSchema.safeParse({
      candidateId: 10,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listCandidateCertificationsSchema.safeParse({
      candidateId: 1,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateCertificationsSchema.safeParse({
      candidateId: 1,
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = listCandidateCertificationsSchema.safeParse({
      candidateId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(15);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listCandidateCertificationsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateCertificationSchema", () => {
  it("accepts valid certification ID", () => {
    const result = getCandidateCertificationSchema.safeParse({
      certificationId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("rejects zero certification ID", () => {
    const result = getCandidateCertificationSchema.safeParse({
      certificationId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing certificationId", () => {
    const result = getCandidateCertificationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createCandidateCertificationSchema", () => {
  it("accepts valid create input", () => {
    const result = createCandidateCertificationSchema.safeParse({
      candidateId: 42,
      certificationName: "AWS Certified Solutions Architect",
      issuingOrganization: "Amazon Web Services",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.certificationName).toBe("AWS Certified Solutions Architect");
      expect(result.data.issuingOrganization).toBe("Amazon Web Services");
    }
  });

  it("accepts create input with all fields", () => {
    const result = createCandidateCertificationSchema.safeParse({
      candidateId: 42,
      certificationName: "PMP",
      issuingOrganization: "PMI",
      issueDate: "2024-01-15",
      expiryDate: "2027-01-15",
      credentialId: "PMP-12345",
      credentialUrl: "https://example.com/verify/12345",
      description: "Project Management Professional certification",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty certification name", () => {
    const result = createCandidateCertificationSchema.safeParse({
      candidateId: 42,
      certificationName: "",
      issuingOrganization: "PMI",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty issuing organization", () => {
    const result = createCandidateCertificationSchema.safeParse({
      candidateId: 42,
      certificationName: "PMP",
      issuingOrganization: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name and organization", () => {
    const result = createCandidateCertificationSchema.safeParse({
      candidateId: 42,
      certificationName: "  PMP  ",
      issuingOrganization: "  PMI  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("PMP");
      expect(result.data.issuingOrganization).toBe("PMI");
    }
  });
});

describe("updateCandidateCertificationSchema", () => {
  it("accepts valid update input", () => {
    const result = updateCandidateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "Updated Cert",
      issuingOrganization: "Updated Org",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(1);
      expect(result.data.certificationName).toBe("Updated Cert");
    }
  });

  it("rejects missing certificationId", () => {
    const result = updateCandidateCertificationSchema.safeParse({
      certificationName: "Test",
      issuingOrganization: "Org",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteCandidateCertificationSchema", () => {
  it("accepts valid delete input", () => {
    const result = deleteCandidateCertificationSchema.safeParse({
      certificationId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing certificationId", () => {
    const result = deleteCandidateCertificationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateCertificationItemSchema", () => {
  const validItem: CandidateCertificationItem = {
    certification_id: 1,
    candidate_id: 42,
    certification_name: "AWS SA",
    issuing_organization: "AWS",
    issue_date: new Date("2024-01-01"),
    expiry_date: new Date("2027-01-01"),
    credential_id: "CRED-001",
    credential_url: "https://example.com/verify",
    description: "An AWS certification",
    deleted: 0,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-06-01"),
  };

  it("accepts valid certification item", () => {
    const result = candidateCertificationItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts item with null optional fields", () => {
    const result = candidateCertificationItemSchema.safeParse({
      ...validItem,
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing certification_id", () => {
    const { certification_id: _, ...rest } = validItem;
    const result = candidateCertificationItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing certification_name", () => {
    const { certification_name: _, ...rest } = validItem;
    const result = candidateCertificationItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("listCandidateCertificationsResultSchema", () => {
  it("accepts empty result", () => {
    const result = listCandidateCertificationsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("accepts populated result", () => {
    const result = listCandidateCertificationsResultSchema.safeParse({
      items: [
        {
          certification_id: 1,
          candidate_id: 42,
          certification_name: "AWS SA",
          issuing_organization: "AWS",
          issue_date: null,
          expiry_date: null,
          credential_id: null,
          credential_url: null,
          description: null,
          deleted: 0,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listCandidateCertificationsResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listCandidateCertificationsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });
});

describe("candidateCertificationActionResultSchema", () => {
  it("accepts success result", () => {
    const result = candidateCertificationActionResultSchema.safeParse({
      success: true,
      certificationId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("accepts error result", () => {
    const result = candidateCertificationActionResultSchema.safeParse({
      success: false,
      error: "Not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects success without certificationId", () => {
    const result = candidateCertificationActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects error without error message", () => {
    const result = candidateCertificationActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });
});
