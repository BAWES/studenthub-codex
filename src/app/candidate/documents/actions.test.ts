import { describe, it, expect } from "vitest";
import { listDocumentsSchema, getDocumentSchema } from "./schemas";

const DOCUMENT_TYPES = ["photo", "cv", "video", "civilFront", "civilBack"] as const;

// ---------------------------------------------------------------------------
// Schema tests for candidate/documents actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listDocumentsSchema", () => {
  it("accepts valid pagination params", () => {
    const r = listDocumentsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts empty params (default pagination)", () => {
    const r = listDocumentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    expect(listDocumentsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listDocumentsSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getDocumentSchema", () => {
  it("accepts a valid document type", () => {
    const r = getDocumentSchema.safeParse({ documentType: "photo" });
    expect(r.success).toBe(true);
  });

  it("accepts all document types", () => {
    for (const dt of DOCUMENT_TYPES) {
      expect(getDocumentSchema.safeParse({ documentType: dt }).success).toBe(true);
    }
  });

  it("rejects invalid document type", () => {
    expect(getDocumentSchema.safeParse({ documentType: "resume" }).success).toBe(false);
  });

  it("rejects missing document type", () => {
    expect(getDocumentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty document type", () => {
    expect(getDocumentSchema.safeParse({ documentType: "" }).success).toBe(false);
  });
});
