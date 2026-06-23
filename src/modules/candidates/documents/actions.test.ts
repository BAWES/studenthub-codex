import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

const deleteDocumentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES, {
    errorMap: () => ({ message: "Invalid document type. Must be one of: photo, cv, video, civilFront, civilBack." }),
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

describe("deleteDocumentSchema", () => {
  it("accepts a valid document type", () => {
    const result = deleteDocumentSchema.safeParse({ documentType: "photo" });
    expect(result.success).toBe(true);
  });

  it("accepts all document types", () => {
    for (const dt of DOCUMENT_TYPES) {
      const result = deleteDocumentSchema.safeParse({ documentType: dt });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid document type", () => {
    const result = deleteDocumentSchema.safeParse({ documentType: "resume" });
    expect(result.success).toBe(false);
  });

  it("rejects missing document type", () => {
    const result = deleteDocumentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty document type", () => {
    const result = deleteDocumentSchema.safeParse({ documentType: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S3/MinIO upload integration tests
// ---------------------------------------------------------------------------

const { mockRequireCapability, mockS3Send } = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockS3Send: vi.fn(),
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockS3Send;
  },
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://s3.example.com/presigned-url"),
}));

vi.mock("@aws-sdk/lib-storage", () => ({
  Upload: class {
    done: any;
    constructor(opts: any) {
      if (opts?.client?.send) {
        opts.client.send({});
      }
      this.done = vi.fn().mockResolvedValue({});
    }
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
  },
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");

function setValidS3Env() {
  process.env.AWS_TEMP_BUCKET_REGION = "us-east-1";
  process.env.AWS_TEMP_ACCESS_KEY_ID = "AKIAIO...MPLE";
  process.env.AWS_TEMP_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
  process.env.AWS_TEMP_BUCKET_NAME = "studenthub-temp";
}

function clearS3Env() {
  delete process.env.AWS_TEMP_BUCKET_REGION;
  delete process.env.AWS_TEMP_ACCESS_KEY_ID;
  delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
  delete process.env.AWS_TEMP_BUCKET_NAME;
  delete process.env.AWS_ENDPOINT_URL;
  delete process.env.AWS_S3_FORCE_PATH_STYLE;
}

describe("uploadCandidateDocument with S3/MinIO", () => {
  let uploadCandidateDocument: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    setValidS3Env();
    mockRequireCapability.mockResolvedValue({ id: "42" });
    mockS3Send.mockResolvedValue({ ETag: '"abc123"' });
    (prisma.candidate.update as any).mockResolvedValue({
      candidate_id: 42,
    });
    const mod = await import("./actions");
    uploadCandidateDocument = mod.uploadCandidateDocument;
  });

  afterEach(() => {
    clearS3Env();
  });

  it("uploads file to S3 when S3 is configured", async () => {
    const buffer = Buffer.from("fake photo content");
    const formData = new FormData();
    formData.append("file_photo", new File([buffer], "photo.jpg", { type: "image/jpeg" }));

    const result = await uploadCandidateDocument({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(result.filePath).toBeDefined();
    // S3 key should NOT start with "/" (indicates local path)
    expect(result.filePath).not.toMatch(/^\//);
    expect(mockS3Send).toHaveBeenCalledTimes(1);
  });

  it("stores S3 key in the candidate DB record", async () => {
    const buffer = Buffer.from("fake cv content");
    const formData = new FormData();
    formData.append("file_cv", new File([buffer], "resume.pdf", { type: "application/pdf" }));

    await uploadCandidateDocument({ success: false }, formData);

    const updateCall = (prisma.candidate.update as any).mock.calls[0][0];
    const dbValue = updateCall.data.candidate_resume;
    // S3 key — prefixed with s3://, starts with uploads/
    expect(dbValue).toMatch(/^s3:\/\/uploads\/candidates\/42\/cv_.+\.pdf$/);
  });

  it("falls back to local disk when S3 env vars are not set", async () => {
    clearS3Env();

    const buffer = Buffer.from("local content");
    const formData = new FormData();
    formData.append("file_video", new File([buffer], "intro.mp4", { type: "video/mp4" }));

    const result = await uploadCandidateDocument({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(result.filePath).toBeDefined();
    // Local path starts with /
    expect(result.filePath).toMatch(/^\/uploads\/candidates\/42\/video_.+\.mp4$/);
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

// ---------------------------------------------------------------------------
// S3 path helpers (from @/lib/s3)
// ---------------------------------------------------------------------------

const S3_PREFIX = "s3://";

function isS3Path(path: string): boolean {
  return path.startsWith(S3_PREFIX);
}

function toS3Key(path: string): string {
  return path.startsWith(S3_PREFIX) ? path.slice(S3_PREFIX.length) : path;
}

function toS3StoredPath(key: string): string {
  return `${S3_PREFIX}${key}`;
}

describe("isS3Path", () => {
  it("returns true for s3:// prefixed paths", () => {
    expect(isS3Path("s3://uploads/candidates/42/photo_uuid.jpg")).toBe(true);
  });

  it("returns false for local paths", () => {
    expect(isS3Path("/uploads/candidates/42/photo.jpg")).toBe(false);
  });

  it("returns false for null-like empty string", () => {
    expect(isS3Path("")).toBe(false);
  });
});

describe("toS3Key", () => {
  it("strips s3:// prefix", () => {
    expect(toS3Key("s3://uploads/candidates/42/photo.jpg")).toBe(
      "uploads/candidates/42/photo.jpg",
    );
  });

  it("returns path unchanged if no prefix", () => {
    const p = "/uploads/candidates/42/photo.jpg";
    expect(toS3Key(p)).toBe(p);
  });
});

describe("toS3StoredPath", () => {
  it("prefixes a raw key with s3://", () => {
    expect(toS3StoredPath("uploads/candidates/42/photo.jpg")).toBe(
      "s3://uploads/candidates/42/photo.jpg",
    );
  });
});

// ---------------------------------------------------------------------------
// Presigned URL generation in document listing/getting
// ---------------------------------------------------------------------------

describe("listCandidateDocuments with S3 presigned URLs", () => {
  let listCandidateDocuments: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    setValidS3Env();
    mockRequireCapability.mockResolvedValue({ id: "42" });

    (prisma.candidate.findUnique as any).mockResolvedValue({
      candidate_id: 42,
      candidate_personal_photo: "candidates/42/photo_uuid.jpg",
      candidate_resume: null,
      candidate_video: null,
      candidate_civil_photo_front: null,
      candidate_civil_photo_back: null,
    });

    const mod = await import("./actions");
    listCandidateDocuments = mod.listCandidateDocuments;
  });

  afterEach(() => {
    clearS3Env();
  });

  it("returns presigned URL for S3-stored documents", async () => {
    const result = await listCandidateDocuments({ candidateId: 42 });

    expect(result.items).toHaveLength(5);
    const photoItem = result.items.find((i: any) => i.type === "photo");
    expect(photoItem).toBeDefined();
    // fileUrl should be the presigned URL, not the raw S3 key
    expect(photoItem.fileUrl).toBe("https://s3.example.com/presigned-url");
    // filePath still has the raw S3 key
    expect(photoItem.filePath).toBe("candidates/42/photo_uuid.jpg");
  });

  it("returns null fileUrl for document types with no file", async () => {
    const result = await listCandidateDocuments({ candidateId: 42 });

    const cvItem = result.items.find((i: any) => i.type === "cv");
    expect(cvItem).toBeDefined();
    expect(cvItem.filePath).toBeNull();
    expect(cvItem.fileUrl).toBeNull();
  });
});

describe("getCandidateDocument with S3 presigned URLs", () => {
  let getCandidateDocument: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    setValidS3Env();
    mockRequireCapability.mockResolvedValue({ id: "42" });

    (prisma.candidate.findUnique as any).mockResolvedValue({
      candidate_personal_photo: "candidates/42/photo_uuid.jpg",
    });

    const mod = await import("./actions");
    getCandidateDocument = mod.getCandidateDocument;
  });

  afterEach(() => {
    clearS3Env();
  });

  it("returns presigned URL when S3 key is stored", async () => {
    const result = await getCandidateDocument({
      candidateId: 42,
      documentType: "photo",
    });

    expect(result).not.toBeNull();
    expect(result!.fileUrl).toBe("https://s3.example.com/presigned-url");
    expect(result!.filePath).toBe("candidates/42/photo_uuid.jpg");
  });

  it("returns null when candidate not found", async () => {
    (prisma.candidate.findUnique as any).mockResolvedValue(null);

    const result = await getCandidateDocument({
      candidateId: 999,
      documentType: "photo",
    });

    expect(result).toBeNull();
  });
});
