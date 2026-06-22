import { describe, it, expect } from "vitest";
import {
  getCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/certificates/[id]
// ---------------------------------------------------------------------------

describe("getCertificateSchema", () => {
  it("accepts valid UUID", () => {
    const r = getCertificateSchema.safeParse({ uuid: "abc-123-def" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("abc-123-def");
    }
  });

  it("rejects missing uuid", () => {
    expect(getCertificateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(getCertificateSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("updateCertificateSchema", () => {
  const validInput = {
    certificateUuid: "abc-123",
    certificateType: true,
    certificateTitle: "AWS Certified",
  };

  it("accepts valid input", () => {
    const r = updateCertificateSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.certificateUuid).toBe("abc-123");
    }
  });

  it("accepts optional fields", () => {
    const r = updateCertificateSchema.safeParse({
      certificateUuid: "abc-123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing certificateUuid", () => {
    expect(
      updateCertificateSchema.safeParse({ certificateTitle: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(
      updateCertificateSchema.safeParse({
        certificateUuid: "",
        certificateTitle: "Test",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCertificateSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateUuid: "abc-123" }).success,
    ).toBe(true);
  });

  it("rejects missing certificateUuid", () => {
    expect(deleteCertificateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateUuid: "" }).success,
    ).toBe(false);
  });
});
