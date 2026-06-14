import { describe, it, expect } from "vitest";
import {
  presignedUploadResultSchema,
  presignedDownloadResultSchema,
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
