import { describe, it, expect } from "vitest";
import { listDocumentsSchema, getDocumentSchema } from "./schemas";

describe("candidate documents page — data contract", () => {
  it("listDocumentsSchema validates valid input", () => {
    const r = listDocumentsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listDocumentsSchema applies defaults", () => {
    const r = listDocumentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listDocumentsSchema rejects negative page", () => {
    const r = listDocumentsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("listDocumentsSchema rejects limit over 100", () => {
    const r = listDocumentsSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("getDocumentSchema validates valid document type", () => {
    const r = getDocumentSchema.safeParse({ documentType: "photo" });
    expect(r.success).toBe(true);
  });

  it("getDocumentSchema validates all document types", () => {
    for (const t of ["photo", "cv", "video", "civilFront", "civilBack"]) {
      const r = getDocumentSchema.safeParse({ documentType: t });
      expect(r.success).toBe(true);
    }
  });

  it("getDocumentSchema rejects invalid document type", () => {
    const r = getDocumentSchema.safeParse({ documentType: "invalid" });
    expect(r.success).toBe(false);
  });

  it("getDocumentSchema rejects missing documentType", () => {
    const r = getDocumentSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
