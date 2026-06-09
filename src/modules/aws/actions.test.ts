import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPresignedUploadUrlSchema,
  getPresignedDownloadUrlSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for AWS server actions
//
// These schemas are tested independently to avoid mocking S3 SDK.
// The actual S3 presigned URL generation is tested via integration tests.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getPresignedUploadUrlSchema tests
// ---------------------------------------------------------------------------

describe("getPresignedUploadUrlSchema", () => {
  it("accepts valid file name and content type", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "document.pdf",
      contentType: "application/pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts file name with special characters", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "my_photo-2026.jpg",
      contentType: "image/jpeg",
    });
    expect(result.success).toBe(true);
  });

  it("accepts image content types", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "profile.png",
      contentType: "image/png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing file name", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      contentType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty file name", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "",
      contentType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects file name without extension", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "myfile",
      contentType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing content type", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "document.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty content type", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "document.pdf",
      contentType: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects file name with path traversal", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "../../etc/passwd",
      contentType: "text/plain",
    });
    expect(result.success).toBe(false);
  });

  it("rejects file name with slashes", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "folder/document.pdf",
      contentType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects very long file name", () => {
    const result = getPresignedUploadUrlSchema.safeParse({
      fileName: "a".repeat(256) + ".pdf",
      contentType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPresignedDownloadUrlSchema tests
// ---------------------------------------------------------------------------

describe("getPresignedDownloadUrlSchema", () => {
  it("accepts a valid S3 key", () => {
    const result = getPresignedDownloadUrlSchema.safeParse({
      key: "uploads/documents/file_abc123.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a key with nested path", () => {
    const result = getPresignedDownloadUrlSchema.safeParse({
      key: "candidates/00123/cv.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing key", () => {
    const result = getPresignedDownloadUrlSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty key", () => {
    const result = getPresignedDownloadUrlSchema.safeParse({ key: "" });
    expect(result.success).toBe(false);
  });

  it("rejects key with path traversal", () => {
    const result = getPresignedDownloadUrlSchema.safeParse({
      key: "../../../etc/passwd",
    });
    expect(result.success).toBe(false);
  });

  it("rejects key with only slashes", () => {
    const result = getPresignedDownloadUrlSchema.safeParse({
      key: "///",
    });
    expect(result.success).toBe(false);
  });
});
