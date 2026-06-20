import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  presignedUploadResultSchema,
  presignedDownloadResultSchema,
  s3KeySchema,
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
// s3KeySchema
// ---------------------------------------------------------------------------
describe("s3KeySchema", () => {
  it("accepts a valid S3 key", () => {
    expect(z.string().min(1).parse("candidates/123/photo_uuid.jpg")).toBe("candidates/123/photo_uuid.jpg");
  });

  it("rejects empty key", () => {
    expect(s3KeySchema.safeParse("").success).toBe(false);
  });

  it("rejects key with path traversal", () => {
    expect(s3KeySchema.safeParse("../../etc/passwd").success).toBe(false);
  });

  it("rejects key starting with slash", () => {
    expect(s3KeySchema.safeParse("/candidates/123/photo.jpg").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// putS3ObjectParamsSchema
// ---------------------------------------------------------------------------
describe("putS3ObjectParamsSchema", () => {
  const valid = {
    key: "candidates/123/photo.jpg",
    contentType: "image/jpeg",
  };

  it("accepts valid params", () => {
    expect(putS3ObjectParamsSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = valid;
    expect(putS3ObjectParamsSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing contentType", () => {
    const { contentType: _, ...rest } = valid;
    expect(putS3ObjectParamsSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteS3ObjectParamsSchema
// ---------------------------------------------------------------------------
describe("deleteS3ObjectParamsSchema", () => {
  it("accepts valid params", () => {
    expect(deleteS3ObjectParamsSchema.safeParse({ key: "candidates/123/photo.jpg" }).success).toBe(true);
  });

  it("rejects missing key", () => {
    expect(deleteS3ObjectParamsSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// s3OperationResultSchema
// ---------------------------------------------------------------------------
describe("s3OperationResultSchema", () => {
  const valid = { success: true, key: "candidates/123/photo.jpg" };

  it("accepts a success result", () => {
    expect(s3OperationResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a result with url", () => {
    expect(
      s3OperationResultSchema.safeParse({ ...valid, url: "https://s3.amazonaws.com/bucket/key" }).success,
    ).toBe(true);
  });

  it("accepts a result with error", () => {
    expect(
      s3OperationResultSchema.safeParse({ success: false, key: "candidates/123/photo.jpg", error: "S3 error" }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    const { success: _, ...rest } = valid;
    expect(s3OperationResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = valid;
    expect(s3OperationResultSchema.safeParse(rest).success).toBe(false);
  });
});
