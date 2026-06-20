import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock functions
// ---------------------------------------------------------------------------
const { mockRequireCapability, mockGetSignedUrl } = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockGetSignedUrl: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("@aws-sdk/client-s3", () => {
  // Class-based mock so `new S3Client(...)` works in the action
  return {
    S3Client: class {
      send = vi.fn();
    } as unknown as typeof import("@aws-sdk/client-s3")["S3Client"],
    PutObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

// ---------------------------------------------------------------------------
// Module under test
// ---------------------------------------------------------------------------

const { getPresignedUploadUrl, getPresignedDownloadUrl } = await import(
  "./actions"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setValidEnv() {
  process.env.AWS_TEMP_BUCKET_REGION = "us-east-1";
  process.env.AWS_TEMP_ACCESS_KEY_ID = "AKIAIO...MPLE";
  process.env.AWS_TEMP_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
  process.env.AWS_TEMP_BUCKET_NAME = "studenthub-temp-uploads";
}

function clearEnv() {
  delete process.env.AWS_TEMP_BUCKET_REGION;
  delete process.env.AWS_TEMP_ACCESS_KEY_ID;
  delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
  delete process.env.AWS_TEMP_BUCKET_NAME;
  delete process.env.AWS_ENDPOINT_URL;
  delete process.env.AWS_S3_FORCE_PATH_STYLE;
}

// ---------------------------------------------------------------------------
// getPresignedUploadUrl
// ---------------------------------------------------------------------------

describe("getPresignedUploadUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setValidEnv();
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetSignedUrl.mockResolvedValue(
      "https://s3.amazonaws.com/studenthub-temp-uploads/uploads/temp/uuid.pdf?X-Amz-Signature=abc",
    );
  });

  afterEach(() => {
    clearEnv();
  });

  // ── Success ───────────────────────────────────────────────────

  it("returns a presigned upload URL with key, bucket, and region", async () => {
    const result = await getPresignedUploadUrl({
      fileName: "document.pdf",
      contentType: "application/pdf",
    });

    expect(result).not.toHaveProperty("error");
    if ("error" in result) return;

    expect(result.uploadUrl).toContain("s3.amazonaws.com");
    expect(result.key).toMatch(/^uploads\/temp\/.+\.pdf$/);
    expect(result.bucket).toBe("studenthub-temp-uploads");
    expect(result.region).toBe("us-east-1");
  });

  it("calls requireCapability with document.write", async () => {
    await getPresignedUploadUrl({
      fileName: "photo.jpg",
      contentType: "image/jpeg",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("document.write");
  });

  it("generates a unique key per call (different UUIDs)", async () => {
    mockGetSignedUrl.mockResolvedValue("https://s3.amazonaws.com/b/key1");
    const r1 = await getPresignedUploadUrl({
      fileName: "a.pdf",
      contentType: "application/pdf",
    });
    mockGetSignedUrl.mockResolvedValue("https://s3.amazonaws.com/b/key2");
    const r2 = await getPresignedUploadUrl({
      fileName: "b.pdf",
      contentType: "application/pdf",
    });

    if ("error" in r1 || "error" in r2) return;
    expect(r1.key).not.toBe(r2.key);
  });

  it("calls getSignedUrl with PutObjectCommand and 300s expiry", async () => {
    await getPresignedUploadUrl({
      fileName: "report.pdf",
      contentType: "application/pdf",
    });

    expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    const args = mockGetSignedUrl.mock.calls[0];
    expect(args[2]).toHaveProperty("expiresIn", 300);
  });

  // ── Auth failure ──────────────────────────────────────────────

  it("throws when requireCapability rejects", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      getPresignedUploadUrl({
        fileName: "doc.pdf",
        contentType: "application/pdf",
      }),
    ).rejects.toThrow("Unauthorized");
  });

  // ── Config validation ─────────────────────────────────────────

  it("returns error when AWS_TEMP_BUCKET_REGION is missing", async () => {
    delete process.env.AWS_TEMP_BUCKET_REGION;

    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
      contentType: "application/pdf",
    });

    expect(result).toEqual({
      error: "AWS_TEMP_BUCKET_REGION is not configured",
    });
  });

  it("returns error when AWS_TEMP_ACCESS_KEY_ID is missing", async () => {
    delete process.env.AWS_TEMP_ACCESS_KEY_ID;

    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
      contentType: "application/pdf",
    });

    expect(result).toEqual({
      error: "AWS_TEMP_ACCESS_KEY_ID is not configured",
    });
  });

  it("returns error when AWS_TEMP_SECRET_ACCESS_KEY is missing", async () => {
    delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;

    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
      contentType: "application/pdf",
    });

    expect(result).toEqual({
      error: "AWS_TEMP_SECRET_ACCESS_KEY is not configured",
    });
  });

  it("returns error when AWS_TEMP_BUCKET_NAME is missing", async () => {
    delete process.env.AWS_TEMP_BUCKET_NAME;

    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
      contentType: "application/pdf",
    });

    expect(result).toEqual({
      error: "AWS_TEMP_BUCKET_NAME is not configured",
    });
  });

  // ── Input validation ──────────────────────────────────────────

  it("returns error for missing fileName", async () => {
    const result = await getPresignedUploadUrl({
      contentType: "application/pdf",
    } as any);

    expect(result).toHaveProperty("error");
  });

  it("returns error for empty fileName", async () => {
    const result = await getPresignedUploadUrl({
      fileName: "",
      contentType: "application/pdf",
    });

    expect(result).toHaveProperty("error");
  });

  it("returns error for missing contentType", async () => {
    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
    } as any);

    expect(result).toHaveProperty("error");
  });

  it("returns error for fileName without extension", async () => {
    const result = await getPresignedUploadUrl({
      fileName: "noext",
      contentType: "application/pdf",
    });

    expect(result).toHaveProperty("error");
  });

  it("returns error for fileName with path traversal", async () => {
    const result = await getPresignedUploadUrl({
      fileName: "../../etc/passwd",
      contentType: "text/plain",
    });

    expect(result).toHaveProperty("error");
  });

  it("returns error for fileName with slashes", async () => {
    const result = await getPresignedUploadUrl({
      fileName: "folder/doc.pdf",
      contentType: "application/pdf",
    });

    expect(result).toHaveProperty("error");
  });

  // ── S3 error handling ─────────────────────────────────────────

  it("returns error when getSignedUrl throws", async () => {
    mockGetSignedUrl.mockRejectedValue(new Error("S3 service unavailable"));

    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
      contentType: "application/pdf",
    });

    expect(result).toEqual({ error: "S3 service unavailable" });
  });

  it("handles non-Error thrown by getSignedUrl gracefully", async () => {
    mockGetSignedUrl.mockRejectedValue("Network timeout");

    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
      contentType: "application/pdf",
    });

    expect(result).toEqual({
      error: "Failed to generate presigned upload URL",
    });
  });

  // ── Custom endpoint (MinIO) ───────────────────────────────────

  it("works when AWS_ENDPOINT_URL is set", async () => {
    process.env.AWS_ENDPOINT_URL = "http://localhost:9000";

    const result = await getPresignedUploadUrl({
      fileName: "doc.pdf",
      contentType: "application/pdf",
    });

    // With endpoint set + valid config, action should still succeed
    expect(result).not.toHaveProperty("error");
  });
});

// ---------------------------------------------------------------------------
// getPresignedDownloadUrl
// ---------------------------------------------------------------------------

describe("getPresignedDownloadUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setValidEnv();
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetSignedUrl.mockResolvedValue(
      "https://s3.amazonaws.com/studenthub-temp-uploads/uploads/doc.pdf?X-Amz-Signature=xyz",
    );
  });

  afterEach(() => {
    clearEnv();
  });

  // ── Success ───────────────────────────────────────────────────

  it("returns a presigned download URL and the original key", async () => {
    const result = await getPresignedDownloadUrl({
      key: "uploads/documents/file_abc123.pdf",
    });

    expect(result).not.toHaveProperty("error");
    if ("error" in result) return;

    expect(result.downloadUrl).toContain("s3.amazonaws.com");
    expect(result.key).toBe("uploads/documents/file_abc123.pdf");
  });

  it("calls requireCapability with document.read", async () => {
    await getPresignedDownloadUrl({
      key: "uploads/photo.jpg",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("document.read");
  });

  it("calls getSignedUrl with GetObjectCommand and 900s expiry", async () => {
    await getPresignedDownloadUrl({
      key: "uploads/doc.pdf",
    });

    expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    const args = mockGetSignedUrl.mock.calls[0];
    expect(args[2]).toHaveProperty("expiresIn", 900);
  });

  // ── Auth failure ──────────────────────────────────────────────

  it("throws when requireCapability rejects", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));

    await expect(
      getPresignedDownloadUrl({
        key: "uploads/doc.pdf",
      }),
    ).rejects.toThrow("Forbidden");
  });

  // ── Config validation ─────────────────────────────────────────

  it("returns error when env config is missing (all vars cleared)", async () => {
    clearEnv();

    const result = await getPresignedDownloadUrl({
      key: "uploads/doc.pdf",
    });

    expect(result).toHaveProperty("error");
  });

  it("returns error when a specific env var is missing", async () => {
    delete process.env.AWS_TEMP_ACCESS_KEY_ID;

    const result = await getPresignedDownloadUrl({
      key: "uploads/doc.pdf",
    });

    expect(result).toHaveProperty("error");
    expect((result as { error: string }).error).toContain(
      "AWS_TEMP_ACCESS_KEY_ID",
    );
  });

  // ── Input validation ──────────────────────────────────────────

  it("returns error for missing key", async () => {
    const result = await getPresignedDownloadUrl({} as any);

    expect(result).toHaveProperty("error");
  });

  it("returns error for empty key", async () => {
    const result = await getPresignedDownloadUrl({ key: "" });

    expect(result).toHaveProperty("error");
  });

  it("returns error for key with path traversal", async () => {
    const result = await getPresignedDownloadUrl({
      key: "../../../etc/passwd",
    });

    expect(result).toHaveProperty("error");
  });

  it("returns error for key with only slashes", async () => {
    const result = await getPresignedDownloadUrl({ key: "///" });

    expect(result).toHaveProperty("error");
  });

  // ── S3 error handling ─────────────────────────────────────────

  it("returns error when getSignedUrl throws", async () => {
    mockGetSignedUrl.mockRejectedValue(new Error("S3 timeout"));

    const result = await getPresignedDownloadUrl({
      key: "uploads/doc.pdf",
    });

    expect(result).toEqual({ error: "S3 timeout" });
  });

  it("handles non-Error thrown by getSignedUrl gracefully", async () => {
    mockGetSignedUrl.mockRejectedValue("Connection lost");

    const result = await getPresignedDownloadUrl({
      key: "uploads/doc.pdf",
    });

    expect(result).toEqual({
      error: "Failed to generate presigned download URL",
    });
  });

  // ── MinIO / custom endpoint ───────────────────────────────────

  it("works when AWS_S3_FORCE_PATH_STYLE is set", async () => {
    process.env.AWS_S3_FORCE_PATH_STYLE = "true";

    const result = await getPresignedDownloadUrl({
      key: "uploads/doc.pdf",
    });

    expect(result).not.toHaveProperty("error");
  });
});
