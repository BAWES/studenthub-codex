import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: document schema validation
//
// listDocuments, getDocument, and uploadDocument in actions.ts use these zod
// schemas internally. Testing them separately avoids mocking prisma, session,
// and Next.js server-action infrastructure.
// ---------------------------------------------------------------------------

const listDocumentsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getDocumentSchema = z.object({
  file_uuid: z
    .string({ required_error: "File UUID is required" })
    .min(1, "File UUID is required"),
});

const uploadDocumentSchema = z.object({
  company_id: z.number().int().positive(),
  file_title: z
    .string({ required_error: "File title is required" })
    .min(1, "File title is required")
    .max(255),
  file_name: z
    .string({ required_error: "File name is required" })
    .min(1, "File name is required")
    .max(255),
  file_type: z.string().max(100).optional(),
  file_size: z.number().int().nonnegative().optional(),
  file_description: z.string().max(65535).optional(),
});

type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

describe("listDocumentsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listDocumentsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts company_id filter", () => {
    const result = listDocumentsSchema.safeParse({ company_id: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_id).toBe(5);
    }
  });

  it("accepts pagination params", () => {
    const result = listDocumentsSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects negative company_id", () => {
    const result = listDocumentsSchema.safeParse({ company_id: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = listDocumentsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listDocumentsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = listDocumentsSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getDocumentSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getDocumentSchema.safeParse({
      file_uuid: "file_abc123def456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getDocumentSchema.safeParse({ file_uuid: "" });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("File UUID is required");
  });

  it("rejects missing file_uuid", () => {
    const result = getDocumentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("uploadDocumentSchema", () => {
  it("accepts valid upload data", () => {
    const result = uploadDocumentSchema.safeParse({
      company_id: 1,
      file_title: "Resume",
      file_name: "resume.pdf",
      file_type: "application/pdf",
      file_size: 10240,
    });
    expect(result.success).toBe(true);
  });

  it("accepts upload with optional fields", () => {
    const result = uploadDocumentSchema.safeParse({
      company_id: 1,
      file_title: "Cover Letter",
      file_name: "cover-letter.docx",
      file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      file_size: 20480,
      file_description: "Candidate cover letter for senior position",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.file_description).toBe(
        "Candidate cover letter for senior position",
      );
    }
  });

  it("rejects missing company_id", () => {
    const result = uploadDocumentSchema.safeParse({
      file_title: "Resume",
      file_name: "resume.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty file_title", () => {
    const result = uploadDocumentSchema.safeParse({
      company_id: 1,
      file_title: "",
      file_name: "resume.pdf",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("File title is required");
  });

  it("rejects file_title over 255 chars", () => {
    const result = uploadDocumentSchema.safeParse({
      company_id: 1,
      file_title: "x".repeat(256),
      file_name: "resume.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty file_name", () => {
    const result = uploadDocumentSchema.safeParse({
      company_id: 1,
      file_title: "Resume",
      file_name: "",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("File name is required");
  });

  it("rejects negative file_size", () => {
    const result = uploadDocumentSchema.safeParse({
      company_id: 1,
      file_title: "Resume",
      file_name: "resume.pdf",
      file_size: -100,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S3 document upload integration tests
//
// Tests uploadDocument() behavior with S3 configured and fallback to disk.
// ---------------------------------------------------------------------------

const { mockRequireCapability, mockGetSignedUrl, mockS3Send } = vi.hoisted(
  () => ({
    mockRequireCapability: vi.fn(),
    mockGetSignedUrl: vi.fn(),
    mockS3Send: vi.fn(),
  }),
);

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockS3Send;
  },
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    file: {
      findUnique: vi.fn(),
      create: vi.fn(),
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
  },
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");

function setValidS3Env() {
  process.env.AWS_TEMP_BUCKET_REGION = "us-east-1";
  process.env.AWS_TEMP_ACCESS_KEY_ID = "AKIAIO...MPLE";
  process.env.AWS_TEMP_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
  process.env.AWS_TEMP_BUCKET_NAME = "studenthub-temp-uploads";
}

function clearS3Env() {
  delete process.env.AWS_TEMP_BUCKET_REGION;
  delete process.env.AWS_TEMP_ACCESS_KEY_ID;
  delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
  delete process.env.AWS_TEMP_BUCKET_NAME;
  delete process.env.AWS_ENDPOINT_URL;
  delete process.env.AWS_S3_FORCE_PATH_STYLE;
}

describe("uploadDocument with S3", () => {
  let uploadDocument: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    setValidS3Env();
    mockRequireCapability.mockResolvedValue(undefined);
    mockS3Send.mockResolvedValue({ ETag: '"abc123"', Location: "https://s3.amazonaws.com/b/key" });
    (prisma.file.create as any).mockResolvedValue({
      file_uuid: "file_test-uuid-123",
      company_id: 1,
      file_title: "Test Doc",
    });
    const mod = await import("./actions");
    uploadDocument = mod.uploadDocument;
  });

  afterEach(() => {
    clearS3Env();
  });

  it("uploads file to S3 when S3 is configured", async () => {
    const result = await uploadDocument({
      company_id: 1,
      file_title: "Test Document",
      file_name: "report.pdf",
      file_type: "application/pdf",
      file_size: 1024,
      file_buffer: Buffer.from("fake pdf content"),
    });

    expect(result).toHaveProperty("file_uuid");
    expect(result).toHaveProperty("file_s3_path");
    // Should NOT have a leading slash (S3 key, not local path)
    expect(result.file_s3_path).toMatch(/^uploads\/documents\/file_.+\.pdf$/);
    // Should NOT be a local filesystem path
    expect(result.file_s3_path).not.toMatch(/^\//);
    // S3 send should have been called (PutObjectCommand)
    expect(mockS3Send).toHaveBeenCalledTimes(1);
  });

  it("stores S3 key in DB record as file_s3_path", async () => {
    await uploadDocument({
      company_id: 1,
      file_title: "Test Doc",
      file_name: "document.pdf",
      file_type: "application/pdf",
      file_size: 2048,
      file_buffer: Buffer.from("content"),
    });

    const createCall = (prisma.file.create as any).mock.calls[0][0];
    const fileS3Path = createCall.data.file_s3_path;
    expect(fileS3Path).toMatch(/^uploads\/documents\/file_.+\.pdf$/);
    expect(fileS3Path).not.toContain("public");
    expect(fileS3Path).not.toMatch(/^\//);
  });
});

describe("uploadDocument with S3 fallback to local disk", () => {
  let uploadDocument: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    clearS3Env();
    mockRequireCapability.mockResolvedValue(undefined);
    (prisma.file.create as any).mockResolvedValue({
      file_uuid: "file_test-uuid-456",
      company_id: 1,
      file_title: "Local Doc",
    });
    const mod = await import("./actions");
    uploadDocument = mod.uploadDocument;
  });

  it("falls back to local disk when S3 env vars are not set", async () => {
    const result = await uploadDocument({
      company_id: 1,
      file_title: "Local Document",
      file_name: "local.pdf",
      file_type: "application/pdf",
      file_size: 512,
      file_buffer: Buffer.from("local content"),
    });

    expect(result).toHaveProperty("file_uuid");
    expect(result).toHaveProperty("file_s3_path");
    // Local path starts with /
    expect(result.file_s3_path).toMatch(/^\/uploads\/documents\/file_.+\.pdf$/);
  });
});

describe("getDocumentDownloadUrl", () => {
  let getDocumentDownloadUrl: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    setValidS3Env();
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetSignedUrl.mockResolvedValue(
      "https://s3.amazonaws.com/studenthub-temp-uploads/uploads/documents/file_abc.pdf?X-Amz-Signature=xyz",
    );
    (prisma.file.findUnique as any).mockResolvedValue({
      file_uuid: "file_abc-123",
      file_s3_path: "uploads/documents/file_abc.pdf",
      file_name: "report.pdf",
    });
    const mod = await import("./actions");
    getDocumentDownloadUrl = mod.getDocumentDownloadUrl;
  });

  afterEach(() => {
    clearS3Env();
  });

  it("returns a presigned download URL for a document with an S3 key", async () => {
    const result = await getDocumentDownloadUrl("file_abc-123");

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("downloadUrl");
    expect(result).toHaveProperty("key");
    expect(result.downloadUrl).toContain("s3.amazonaws.com");
    expect(result.key).toBe("uploads/documents/file_abc.pdf");
  });

  it("returns null when document has no S3 key (local file)", async () => {
    (prisma.file.findUnique as any).mockResolvedValue({
      file_uuid: "file_local-456",
      file_s3_path: null,
      file_name: "local.pdf",
    });

    const result = await getDocumentDownloadUrl("file_local-456");
    expect(result).toBeNull();
  });

  it("returns null when document is not found", async () => {
    (prisma.file.findUnique as any).mockResolvedValue(null);

    const result = await getDocumentDownloadUrl("file_missing-999");
    expect(result).toBeNull();
  });

  it("requires document.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      getDocumentDownloadUrl("file_abc-123"),
    ).rejects.toThrow("Unauthorized");
  });
});
