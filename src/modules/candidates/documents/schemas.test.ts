import { describe, it, expect } from "vitest";
import {
  DOCUMENT_TYPES,
  listDocumentsSchema,
  getDocumentSchema,
  uploadDocumentParamsSchema,
  deleteDocumentSchema,
  candidateDocumentItemResultSchema,
  listCandidateDocumentsResultSchema,
  getCandidateDocumentResultSchema,
  uploadDocumentStateResultSchema,
  deleteDocumentStateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listDocumentsSchema", () => {
  it("accepts valid candidateId", () => {
    const r = listDocumentsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(1);
  });

  it("rejects negative candidateId", () => {
    expect(listDocumentsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("coerces string candidateId", () => {
    const r = listDocumentsSchema.safeParse({ candidateId: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(3);
  });
});

describe("getDocumentSchema", () => {
  it("accepts valid document type", () => {
    const r = getDocumentSchema.safeParse({ candidateId: 1, documentType: "cv" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.documentType).toBe("cv");
  });

  it("accepts all document types", () => {
    for (const dt of DOCUMENT_TYPES) {
      expect(getDocumentSchema.safeParse({ candidateId: 1, documentType: dt }).success).toBe(true);
    }
  });

  it("rejects invalid document type", () => {
    const r = getDocumentSchema.safeParse({ candidateId: 1, documentType: "invalidType" });
    expect(r.success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(getDocumentSchema.safeParse({ documentType: "photo" }).success).toBe(false);
  });

  it("rejects missing documentType", () => {
    expect(getDocumentSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });
});

describe("uploadDocumentParamsSchema", () => {
  it("accepts valid params", () => {
    const r = uploadDocumentParamsSchema.safeParse({ candidateId: 1, documentType: "civilFront" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid document type", () => {
    expect(
      uploadDocumentParamsSchema.safeParse({ candidateId: 1, documentType: "pdf" }).success,
    ).toBe(false);
  });
});

describe("deleteDocumentSchema", () => {
  it("accepts valid document type", () => {
    expect(deleteDocumentSchema.safeParse({ documentType: "video" }).success).toBe(true);
  });

  it("rejects invalid document type", () => {
    expect(deleteDocumentSchema.safeParse({ documentType: "exe" }).success).toBe(false);
  });

  it("rejects missing documentType", () => {
    expect(deleteDocumentSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("candidateDocumentItemResultSchema", () => {
  it("accepts a valid document item", () => {
    const r = candidateDocumentItemResultSchema.safeParse({
      type: "photo",
      label: "Profile Photo",
      filePath: "/uploads/photos/1.jpg",
      fileUrl: "https://example.com/photos/1.jpg",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable filePath and fileUrl", () => {
    expect(
      candidateDocumentItemResultSchema.safeParse({
        type: "cv",
        label: "CV",
        filePath: null,
        fileUrl: null,
      }).success,
    ).toBe(true);
  });

  it("rejects invalid document type", () => {
    expect(
      candidateDocumentItemResultSchema.safeParse({
        type: "exe",
        label: "Bad",
        filePath: null,
        fileUrl: null,
      }).success,
    ).toBe(false);
  });

  it("rejects missing label", () => {
    expect(
      candidateDocumentItemResultSchema.safeParse({
        type: "photo",
        filePath: null,
        fileUrl: null,
      }).success,
    ).toBe(false);
  });
});

describe("listCandidateDocumentsResultSchema", () => {
  it("accepts empty items list", () => {
    expect(
      listCandidateDocumentsResultSchema.safeParse({ items: [], candidateId: 1 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    expect(listCandidateDocumentsResultSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(listCandidateDocumentsResultSchema.safeParse({ items: [] }).success).toBe(false);
  });
});

describe("getCandidateDocumentResultSchema", () => {
  it("accepts a valid document item", () => {
    expect(
      getCandidateDocumentResultSchema.safeParse({
        type: "cv",
        label: "CV",
        filePath: null,
        fileUrl: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null (not found)", () => {
    expect(getCandidateDocumentResultSchema.safeParse(null).success).toBe(true);
  });
});

describe("uploadDocumentStateResultSchema", () => {
  it("accepts success state", () => {
    expect(
      uploadDocumentStateResultSchema.safeParse({
        success: true,
        filePath: "/uploads/doc.pdf",
      }).success,
    ).toBe(true);
  });

  it("accepts error state", () => {
    expect(
      uploadDocumentStateResultSchema.safeParse({
        success: false,
        error: "Upload failed: file too large.",
      }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(uploadDocumentStateResultSchema.safeParse({ error: "Failed" }).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(uploadDocumentStateResultSchema.safeParse({ success: "yes" }).success).toBe(false);
  });
});

describe("deleteDocumentStateResultSchema", () => {
  it("accepts success state", () => {
    expect(deleteDocumentStateResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error state", () => {
    expect(
      deleteDocumentStateResultSchema.safeParse({ success: false, error: "Document not found." }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(deleteDocumentStateResultSchema.safeParse({}).success).toBe(false);
  });
});
