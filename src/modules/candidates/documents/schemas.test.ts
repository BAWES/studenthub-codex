import { describe, it, expect } from "vitest";
import {
  candidateDocumentItemResultSchema,
  listCandidateDocumentsResultSchema,
  getCandidateDocumentResultSchema,
  uploadDocumentStateResultSchema,
  deleteDocumentStateResultSchema,
} from "./schemas";

const DOCUMENT_TYPES = ["photo", "cv", "video", "civilFront", "civilBack"] as const;

// ---------------------------------------------------------------------------
// candidateDocumentItemResultSchema
// ---------------------------------------------------------------------------

describe("candidateDocumentItemResultSchema", () => {
  const validItem = () => ({
    type: "cv" as const,
    label: "Curriculum Vitae",
    filePath: "/uploads/cv.pdf",
    fileUrl: "https://example.com/cv.pdf",
  });

  it("accepts a valid document item", () => {
    const r = candidateDocumentItemResultSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable filePath and fileUrl", () => {
    const r = candidateDocumentItemResultSchema.safeParse({
      ...validItem(),
      filePath: null,
      fileUrl: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts all valid document types", () => {
    for (const docType of DOCUMENT_TYPES) {
      const r = candidateDocumentItemResultSchema.safeParse({ ...validItem(), type: docType });
      expect(r.success).toBe(true);
    }
  });

  it("rejects invalid document type", () => {
    const r = candidateDocumentItemResultSchema.safeParse({ ...validItem(), type: "invalid" });
    expect(r.success).toBe(false);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validItem();
    expect(candidateDocumentItemResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateDocumentsResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateDocumentsResultSchema", () => {
  it("accepts a valid list result", () => {
    const r = listCandidateDocumentsResultSchema.safeParse({
      items: [{ type: "photo", label: "Photo", filePath: null, fileUrl: null }],
      candidateId: 123,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = listCandidateDocumentsResultSchema.safeParse({
      items: [], candidateId: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-integer candidateId", () => {
    const r = listCandidateDocumentsResultSchema.safeParse({
      items: [], candidateId: "abc",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCandidateDocumentResultSchema  (.nullable())
// ---------------------------------------------------------------------------

describe("getCandidateDocumentResultSchema", () => {
  it("accepts a found document", () => {
    const r = getCandidateDocumentResultSchema.safeParse({
      type: "cv", label: "CV", filePath: "/cv.pdf", fileUrl: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts null (not found)", () => {
    const r = getCandidateDocumentResultSchema.safeParse(null);
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// uploadDocumentStateResultSchema
// ---------------------------------------------------------------------------

describe("uploadDocumentStateResultSchema", () => {
  it("accepts success with filePath", () => {
    const r = uploadDocumentStateResultSchema.safeParse({ success: true, filePath: "/path.pdf" });
    expect(r.success).toBe(true);
  });

  it("accepts error with error message", () => {
    const r = uploadDocumentStateResultSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("accepts minimal success state", () => {
    const r = uploadDocumentStateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    const r = uploadDocumentStateResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteDocumentStateResultSchema
// ---------------------------------------------------------------------------

describe("deleteDocumentStateResultSchema", () => {
  it("accepts success state", () => {
    const r = deleteDocumentStateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts error with message", () => {
    const r = deleteDocumentStateResultSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    const r = deleteDocumentStateResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});
