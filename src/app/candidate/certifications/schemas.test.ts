import { describe, it, expect } from "vitest";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  certificationItemOutputSchema,
  certificationListOutputSchema,
  certificationActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/certifications
// ---------------------------------------------------------------------------

describe("listCertificationsSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listCertificationsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listCertificationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listCertificationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listCertificationsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("coerces string page and limit", () => {
    const r = listCertificationsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getCertificationSchema", () => {
  it("accepts valid certification ID", () => {
    const r = getCertificationSchema.safeParse({ certificationId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationId).toBe(42);
    }
  });

  it("coerces string ID", () => {
    const r = getCertificationSchema.safeParse({ certificationId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationId).toBe(42);
    }
  });

  it("rejects missing certificationId", () => {
    expect(getCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero certificationId", () => {
    expect(
      getCertificationSchema.safeParse({ certificationId: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative certificationId", () => {
    expect(
      getCertificationSchema.safeParse({ certificationId: -5 }).success,
    ).toBe(false);
  });
});

describe("createCertificationSchema", () => {
  const validInput = {
    certificationName: "AWS Solutions Architect",
    issuingOrganization: "Amazon Web Services",
  };

  it("accepts valid input", () => {
    const r = createCertificationSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("AWS Solutions Architect");
      expect(r.data.issuingOrganization).toBe("Amazon Web Services");
    }
  });

  it("trims whitespace", () => {
    const r = createCertificationSchema.safeParse({
      certificationName: "  AWS  ",
      issuingOrganization: "  Amazon  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("AWS");
      expect(r.data.issuingOrganization).toBe("Amazon");
    }
  });

  it("rejects missing certificationName", () => {
    expect(
      createCertificationSchema.safeParse({ issuingOrganization: "AWS" })
        .success,
    ).toBe(false);
  });

  it("rejects missing issuingOrganization", () => {
    expect(
      createCertificationSchema.safeParse({ certificationName: "AWS" }).success,
    ).toBe(false);
  });

  it("rejects empty certificationName", () => {
    expect(
      createCertificationSchema.safeParse({
        ...validInput,
        certificationName: "",
      }).success,
    ).toBe(false);
  });

  it("rejects certificationName exceeding 255 chars", () => {
    expect(
      createCertificationSchema.safeParse({
        ...validInput,
        certificationName: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("accepts valid credential URL", () => {
    const r = createCertificationSchema.safeParse({
      ...validInput,
      credentialUrl: "https://example.com/cert",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid credential URL", () => {
    expect(
      createCertificationSchema.safeParse({
        ...validInput,
        credentialUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });
});

describe("updateCertificationSchema", () => {
  const validInput = {
    certificationId: 1,
    certificationName: "Updated Cert",
    issuingOrganization: "Updated Org",
  };

  it("accepts valid update", () => {
    const r = updateCertificationSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("trims whitespace", () => {
    const r = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "  Name  ",
      issuingOrganization: "  Org  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("Name");
      expect(r.data.issuingOrganization).toBe("Org");
    }
  });

  it("rejects missing certificationId", () => {
    expect(
      updateCertificationSchema.safeParse({
        certificationName: "Test",
        issuingOrganization: "Org",
      }).success,
    ).toBe(false);
  });

  it("rejects empty certificationName", () => {
    expect(
      updateCertificationSchema.safeParse({
        ...validInput,
        certificationName: "",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCertificationSchema", () => {
  it("accepts valid certification ID", () => {
    expect(
      deleteCertificationSchema.safeParse({ certificationId: 42 }).success,
    ).toBe(true);
  });

  it("coerces string ID", () => {
    expect(
      deleteCertificationSchema.safeParse({ certificationId: "42" }).success,
    ).toBe(true);
  });

  it("rejects missing certificationId", () => {
    expect(deleteCertificationSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("certificationItemOutputSchema", () => {
  const validItem = {
    certification_id: 1,
    certification_name: "AWS",
    issuing_organization: "Amazon",
    issue_date: null,
    expiry_date: null,
    credential_id: null,
    credential_url: null,
    description: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts valid item", () => {
    expect(certificationItemOutputSchema.safeParse(validItem).success).toBe(
      true,
    );
  });

  it("rejects missing certification_id", () => {
    const { certification_id: _, ...rest } = validItem;
    expect(certificationItemOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("certificationListOutputSchema", () => {
  it("accepts valid array", () => {
    expect(
      certificationListOutputSchema.safeParse([
        {
          certification_id: 1,
          certification_name: "AWS",
          issuing_organization: "Amazon",
          issue_date: null,
          expiry_date: null,
          credential_id: null,
          credential_url: null,
          description: null,
          created_at: null,
          updated_at: null,
        },
      ]).success,
    ).toBe(true);
  });

  it("accepts empty array", () => {
    expect(certificationListOutputSchema.safeParse([]).success).toBe(true);
  });
});

describe("certificationActionResultOutputSchema", () => {
  it("accepts success result", () => {
    expect(
      certificationActionResultOutputSchema.safeParse({
        success: true,
        certificationId: 42,
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      certificationActionResultOutputSchema.safeParse({
        success: false,
        error: "Not found",
      }).success,
    ).toBe(true);
  });

  it("rejects success without certificationId", () => {
    expect(
      certificationActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error field", () => {
    expect(
      certificationActionResultOutputSchema.safeParse({ success: false })
        .success,
    ).toBe(false);
  });

  it("rejects success: true with error (discriminated union)", () => {
    expect(
      certificationActionResultOutputSchema.safeParse({
        success: true,
        error: "test",
      }).success,
    ).toBe(false);
  });
});
