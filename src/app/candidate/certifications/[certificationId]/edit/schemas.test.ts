import { describe, it, expect } from "vitest";
import {
  updateCertificationSchema,
  certificationActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/certifications/[certificationId]/edit
// ---------------------------------------------------------------------------

describe("updateCertificationSchema", () => {
  const validInput = {
    certificationName: "Updated Certification",
    issuingOrganization: "Updated Organization",
  };

  it("accepts valid input", () => {
    const r = updateCertificationSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("Updated Certification");
      expect(r.data.issuingOrganization).toBe("Updated Organization");
    }
  });

  it("trims whitespace", () => {
    const r = updateCertificationSchema.safeParse({
      certificationName: "  Name  ",
      issuingOrganization: "  Org  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificationName).toBe("Name");
      expect(r.data.issuingOrganization).toBe("Org");
    }
  });

  it("rejects missing certificationName", () => {
    expect(
      updateCertificationSchema.safeParse({ issuingOrganization: "Org" })
        .success,
    ).toBe(false);
  });

  it("rejects missing issuingOrganization", () => {
    expect(
      updateCertificationSchema.safeParse({ certificationName: "Name" })
        .success,
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

  it("rejects certificationName exceeding 255 chars", () => {
    expect(
      updateCertificationSchema.safeParse({
        ...validInput,
        certificationName: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("accepts optional credential URL", () => {
    const r = updateCertificationSchema.safeParse({
      ...validInput,
      credentialUrl: "https://example.com/cert",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid credential URL", () => {
    expect(
      updateCertificationSchema.safeParse({
        ...validInput,
        credentialUrl: "not-a-url",
      }).success,
    ).toBe(false);
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
