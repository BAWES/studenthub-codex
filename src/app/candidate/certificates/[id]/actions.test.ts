import { describe, it, expect } from "vitest";
import {
  getCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCertificateSchema
// ---------------------------------------------------------------------------

describe("getCertificateSchema ([id] route)", () => {
  it("accepts a valid UUID", () => {
    const result = getCertificateSchema.safeParse({
      uuid: "cert_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("cert_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getCertificateSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getCertificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCertificateSchema
// ---------------------------------------------------------------------------

describe("updateCertificateSchema ([id] route)", () => {
  it("accepts a valid UUID with optional fields", () => {
    const result = updateCertificateSchema.safeParse({
      certificateUuid: "cert_abc-123",
      certificateTitle: "Updated Title",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificateUuid).toBe("cert_abc-123");
      expect(result.data.certificateTitle).toBe("Updated Title");
    }
  });

  it("accepts UUID only (partial update)", () => {
    const result = updateCertificateSchema.safeParse({
      certificateUuid: "cert_abc-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificateUuid).toBe("cert_abc-123");
    }
  });

  it("accepts all optional fields", () => {
    const result = updateCertificateSchema.safeParse({
      certificateUuid: "cert_abc-123",
      certificateType: false,
      certificateTitle: "New Title",
      certificateIssuer: "New Issuer",
      certificateUrl: "https://example.com/cert",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = updateCertificateSchema.safeParse({
      certificateUuid: "",
      certificateTitle: "Title",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateCertificateSchema.safeParse({
      certificateTitle: "Title",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCertificateSchema
// ---------------------------------------------------------------------------

describe("deleteCertificateSchema ([id] route)", () => {
  it("accepts a valid certificateUuid", () => {
    const result = deleteCertificateSchema.safeParse({
      certificateUuid: "cert_abc-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificateUuid).toBe("cert_abc-123");
    }
  });

  it("rejects empty UUID", () => {
    const result = deleteCertificateSchema.safeParse({ certificateUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteCertificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
