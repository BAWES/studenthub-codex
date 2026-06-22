import { describe, it, expect } from "vitest";
import {
  createCertificationSchema,
  certificationActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/certifications/new
// ---------------------------------------------------------------------------

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
      certificationName: "  Trimmed  ",
      issuingOrganization: "  Org  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("Trimmed");
      expect(r.data.issuingOrganization).toBe("Org");
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

  it("accepts optional credential URL", () => {
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

  it("accepts empty credential URL", () => {
    const r = createCertificationSchema.safeParse({
      ...validInput,
      credentialUrl: "",
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests (re-export)
// ---------------------------------------------------------------------------

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
        error: "Failed",
      }).success,
    ).toBe(true);
  });
});
