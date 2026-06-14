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

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listCandidateCertificationsSchema", () => {
  it("accepts candidateId only", () => {
    const r = listCandidateCertificationsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts all fields", () => {
    const r = listCandidateCertificationsSchema.safeParse({
      candidateId: 5,
      page: 2,
      limit: 50,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(50);
  });

  it("rejects negative candidateId", () => {
    expect(listCandidateCertificationsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listCandidateCertificationsSchema.safeParse({ candidateId: 1, limit: 999 }).success).toBe(false);
  });

  it("coerces string candidateId", () => {
    const r = listCandidateCertificationsSchema.safeParse({ candidateId: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(3);
  });
});

describe("getCandidateCertificationSchema", () => {
  it("accepts valid certificationId", () => {
    expect(getCandidateCertificationSchema.safeParse({ certificationId: 5 }).success).toBe(true);
  });

  it("rejects missing certificationId", () => {
    expect(getCandidateCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative certificationId", () => {
    expect(getCandidateCertificationSchema.safeParse({ certificationId: -1 }).success).toBe(false);
  });
});

describe("createCandidateCertificationSchema", () => {
  const valid = {
    candidateId: 1,
    certificationName: "AWS Solutions Architect",
    issuingOrganization: "Amazon Web Services",
  };

  it("accepts valid input with required fields", () => {
    const r = createCandidateCertificationSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("AWS Solutions Architect");
      expect(r.data.issuingOrganization).toBe("Amazon Web Services");
    }
  });

  it("trims whitespace from string fields", () => {
    const r = createCandidateCertificationSchema.safeParse({
      ...valid,
      certificationName: "  AWS   ",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.certificationName).toBe("AWS");
  });

  it("accepts optional fields", () => {
    const r = createCandidateCertificationSchema.safeParse({
      ...valid,
      issueDate: "2024-01-01",
      expiryDate: "2027-01-01",
      credentialId: "CRED-123",
      credentialUrl: "https://verify.aws.com/cred",
      description: "Cloud architecture certification",
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty credentialUrl", () => {
    const r = createCandidateCertificationSchema.safeParse({
      ...valid,
      credentialUrl: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing certificationName", () => {
    const { certificationName: _, ...rest } = valid;
    expect(createCandidateCertificationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing issuingOrganization", () => {
    const { issuingOrganization: _, ...rest } = valid;
    expect(createCandidateCertificationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty certificationName", () => {
    expect(
      createCandidateCertificationSchema.safeParse({
        ...valid,
        certificationName: "",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid credentialUrl", () => {
    expect(
      createCandidateCertificationSchema.safeParse({
        ...valid,
        credentialUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects certificationName over 255 chars", () => {
    expect(
      createCandidateCertificationSchema.safeParse({
        ...valid,
        certificationName: "A".repeat(256),
      }).success,
    ).toBe(false);
  });
});

describe("updateCandidateCertificationSchema", () => {
  const valid = {
    certificationId: 5,
    certificationName: "Updated Certification",
    issuingOrganization: "Updated Org",
  };

  it("accepts valid update", () => {
    expect(updateCandidateCertificationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing certificationId", () => {
    const { certificationId: _, ...rest } = valid;
    expect(updateCandidateCertificationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty certificationName", () => {
    expect(
      updateCandidateCertificationSchema.safeParse({ ...valid, certificationName: "" }).success,
    ).toBe(false);
  });
});

describe("deleteCandidateCertificationSchema", () => {
  it("accepts valid certificationId", () => {
    expect(deleteCandidateCertificationSchema.safeParse({ certificationId: 5 }).success).toBe(true);
  });

  it("rejects missing certificationId", () => {
    expect(deleteCandidateCertificationSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("candidateCertificationItemSchema", () => {
  const valid = {
    certification_id: 1,
    candidate_id: 5,
    certification_name: "AWS Solutions Architect",
    issuing_organization: "Amazon Web Services",
    issue_date: new Date("2024-01-15"),
    expiry_date: new Date("2027-01-15"),
    credential_id: "CRED-123",
    credential_url: "https://verify.aws.com",
    description: "Cloud architecture certification",
    deleted: 0,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-06-20"),
  };

  it("accepts a valid certification item", () => {
    expect(candidateCertificationItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable dates and strings", () => {
    expect(
      candidateCertificationItemSchema.safeParse({
        ...valid,
        issue_date: null,
        expiry_date: null,
        credential_id: null,
        credential_url: null,
        description: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing certification_id", () => {
    const { certification_id: _, ...rest } = valid;
    expect(candidateCertificationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = valid;
    expect(candidateCertificationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for deleted", () => {
    expect(
      candidateCertificationItemSchema.safeParse({ ...valid, deleted: "yes" }).success,
    ).toBe(false);
  });
});

describe("listCandidateCertificationsResultSchema", () => {
  it("accepts valid result with empty list", () => {
    expect(
      listCandidateCertificationsResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listCandidateCertificationsResultSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        pageSize: 20,
      }).success,
    ).toBe(false);
  });

  it("rejects missing items", () => {
    expect(
      listCandidateCertificationsResultSchema.safeParse({ total: 0, page: 1, pageSize: 20 }).success,
    ).toBe(false);
  });
});

describe("candidateCertificationActionResultSchema", () => {
  it("accepts success with certificationId", () => {
    expect(
      candidateCertificationActionResultSchema.safeParse({
        success: true,
        certificationId: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      candidateCertificationActionResultSchema.safeParse({
        success: false,
        error: "Certification not found.",
      }).success,
    ).toBe(true);
  });

  it("rejects success without certificationId", () => {
    expect(
      candidateCertificationActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(
      candidateCertificationActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      candidateCertificationActionResultSchema.safeParse({ success: "maybe" }).success,
    ).toBe(false);
  });
});
