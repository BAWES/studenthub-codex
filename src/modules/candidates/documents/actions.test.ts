import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const DOCUMENT_TYPES = [
  "photo",
  "cv",
  "video",
  "civilFront",
  "civilBack",
] as const;

const ALLOWED_TYPES: Record<string, { mime: string[]; ext: string[]; maxSize: number }> = {
  photo: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
  cv: {
    mime: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ext: [".pdf", ".doc", ".docx"],
    maxSize: 10 * 1024 * 1024,
  },
  video: {
    mime: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    ext: [".mp4", ".webm", ".ogv", ".mov"],
    maxSize: 50 * 1024 * 1024,
  },
  civilFront: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
  civilBack: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
} as const;

const listDocumentsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

const getDocumentSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  documentType: z.enum(DOCUMENT_TYPES, {
    errorMap: () => ({ message: "Invalid document type" }),
  }),
});

const uploadDocumentSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  documentType: z.enum(DOCUMENT_TYPES, {
    errorMap: () => ({ message: "Invalid document type" }),
  }),
});

export type ListDocumentsParams = z.input<typeof listDocumentsSchema>;
export type GetDocumentParams = z.input<typeof getDocumentSchema>;
export type UploadDocumentParams = z.input<typeof uploadDocumentSchema>;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("listDocumentsSchema", () => {
  it("accepts a valid candidate ID", () => {
    const result = listDocumentsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
  });

  it("coerces string candidate ID to number", () => {
    const result = listDocumentsSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("rejects zero candidate ID", () => {
    const result = listDocumentsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidate ID", () => {
    const result = listDocumentsSchema.safeParse({ candidateId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing candidate ID", () => {
    const result = listDocumentsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("getDocumentSchema", () => {
  it("accepts valid document type and candidate ID", () => {
    const result = getDocumentSchema.safeParse({
      candidateId: 42,
      documentType: "photo",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all document types", () => {
    for (const dt of DOCUMENT_TYPES) {
      const result = getDocumentSchema.safeParse({
        candidateId: 1,
        documentType: dt,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid document type", () => {
    const result = getDocumentSchema.safeParse({
      candidateId: 42,
      documentType: "resume",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing document type", () => {
    const result = getDocumentSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(false);
  });
});

describe("uploadDocumentSchema", () => {
  it("accepts valid params", () => {
    const result = uploadDocumentSchema.safeParse({
      candidateId: 42,
      documentType: "cv",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid document type for upload", () => {
    const result = uploadDocumentSchema.safeParse({
      candidateId: 42,
      documentType: "pdf",
    });
    expect(result.success).toBe(false);
  });
});

describe("ALLOWED_TYPES config", () => {
  it("photo allows jpg, png, webp, gif", () => {
    const cfg = ALLOWED_TYPES.photo;
    expect(cfg.ext).toContain(".jpg");
    expect(cfg.ext).toContain(".png");
    expect(cfg.ext).toContain(".webp");
    expect(cfg.ext).toContain(".gif");
    expect(cfg.maxSize).toBe(5 * 1024 * 1024);
  });

  it("cv allows pdf, doc, docx up to 10MB", () => {
    const cfg = ALLOWED_TYPES.cv;
    expect(cfg.ext).toContain(".pdf");
    expect(cfg.ext).toContain(".doc");
    expect(cfg.ext).toContain(".docx");
    expect(cfg.maxSize).toBe(10 * 1024 * 1024);
  });

  it("video allows mp4, webm, ogv, mov up to 50MB", () => {
    const cfg = ALLOWED_TYPES.video;
    expect(cfg.ext).toContain(".mp4");
    expect(cfg.ext).toContain(".webm");
    expect(cfg.ext).toContain(".ogv");
    expect(cfg.ext).toContain(".mov");
    expect(cfg.maxSize).toBe(50 * 1024 * 1024);
  });

  it("civilFront and civilBack match photo config", () => {
    expect(ALLOWED_TYPES.civilFront.ext).toEqual(ALLOWED_TYPES.photo.ext);
    expect(ALLOWED_TYPES.civilBack.ext).toEqual(ALLOWED_TYPES.photo.ext);
  });

  it("every document type has a config entry", () => {
    for (const dt of DOCUMENT_TYPES) {
      expect(ALLOWED_TYPES[dt]).toBeDefined();
    }
  });
});
