import { describe, it, expect } from "vitest";
import {
  presignedUploadResultSchema,
  presignedDownloadResultSchema,
  putS3ObjectParamsSchema,
  deleteS3ObjectParamsSchema,
  s3OperationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// presignedUploadResultSchema
// ---------------------------------------------------------------------------
describe("presignedUploadResultSchema", () => {
  const valid = {
    uploadUrl: "https://s3.amazonaws.com/bucket/key?signature=abc",
    key: "uploads/photo.jpg",
    bucket: "studenthub-uploads",
    region: "us-east-1",
  };

  it("accepts a valid upload result", () => {
    expect(presignedUploadResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty strings", () => {
    expect(
      presignedUploadResultSchema.safeParse({
        uploadUrl: "",
        key: "",
        bucket: "",
        region: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing uploadUrl", () => {
    const { uploadUrl: _, ...rest } = valid;
    expect(presignedUploadResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = valid;
    expect(presignedUploadResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing bucket", () => {
    const { bucket: _, ...rest } = valid;
    expect(presignedUploadResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing region", () => {
    const { region: _, ...rest } = valid;
    expect(presignedUploadResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for uploadUrl", () => {
    expect(
      presignedUploadResultSchema.safeParse({ ...valid, uploadUrl: 123 })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// presignedDownloadResultSchema
// ---------------------------------------------------------------------------
describe("presignedDownloadResultSchema", () => {
  const valid = {
    downloadUrl: "https://s3.amazonaws.com/bucket/key?signature=def",
    key: "downloads/report.pdf",
  };

  it("accepts a valid download result", () => {
    expect(presignedDownloadResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty strings", () => {
    expect(
      presignedDownloadResultSchema.safeParse({
        downloadUrl: "",
        key: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing downloadUrl", () => {
    const { downloadUrl: _, ...rest } = valid;
    expect(presignedDownloadResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = valid;
    expect(presignedDownloadResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for downloadUrl", () => {
    expect(
      presignedDownloadResultSchema.safeParse({ ...valid, downloadUrl: false })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// putS3ObjectParamsSchema
// ---------------------------------------------------------------------------
describe("putS3ObjectParamsSchema", () => {
  const valid = {
    key: "uploads/candidates/123/photo.jpg",
    contentType: "image/jpeg",
  };

  it("accepts valid params", () => {
    expect(putS3ObjectParamsSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts no contentType", () => {
    expect(
      putS3ObjectParamsSchema.safeParse({ key: "uploads/test.pdf" }).success,
    ).toBe(true);
  });

  it("rejects missing key", () => {
    expect(putS3ObjectParamsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty key", () => {
    expect(putS3ObjectParamsSchema.safeParse({ key: "" }).success).toBe(false);
  });

  it("rejects path traversal in key", () => {
    expect(
      putS3ObjectParamsSchema.safeParse({ key: "../etc/passwd" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteS3ObjectParamsSchema
// ---------------------------------------------------------------------------
describe("deleteS3ObjectParamsSchema", () => {
  it("accepts valid key", () => {
    expect(
      deleteS3ObjectParamsSchema.safeParse({
        key: "uploads/candidates/123/photo.jpg",
      }).success,
    ).toBe(true);
  });

  it("rejects missing key", () => {
    expect(deleteS3ObjectParamsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects path traversal", () => {
    expect(
      deleteS3ObjectParamsSchema.safeParse({ key: "../etc/passwd" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// s3OperationResultSchema
// ---------------------------------------------------------------------------
describe("s3OperationResultSchema", () => {
  const valid = { success: true, key: "uploads/test.pdf" };

  it("accepts success result", () => {
    expect(s3OperationResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      s3OperationResultSchema.safeParse({
        success: false,
        key: "uploads/test.pdf",
        error: "S3 not configured",
      }).success,
    ).toBe(true);
  });

  it("accepts optional error", () => {
    expect(
      s3OperationResultSchema.safeParse({
        success: true,
        key: "uploads/test.pdf",
      }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(
      s3OperationResultSchema.safeParse({ key: "uploads/test.pdf" }).success,
    ).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(
      s3OperationResultSchema.safeParse({
        success: "true",
        key: "uploads/test.pdf",
      }).success,
    ).toBe(false);
  });
});
