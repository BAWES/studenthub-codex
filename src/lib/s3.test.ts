import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  uploadFile,
  checkS3Health,
  ensureBucket,
  deleteFile,
} from "./s3";

// ---------------------------------------------------------------------------
// S3 upload service — unit tests
//
// Tests cover:
// 1. uploadFile returns correct result shape (local/dev mode)
// 2. S3 health check returns configured:false when no env vars
// 3. ensureBucket is a no-op when S3 is not configured
// 4. deleteFile handles missing files gracefully
// ---------------------------------------------------------------------------

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  delete process.env.S3_ENDPOINT;
  delete process.env.S3_ACCESS_KEY;
  delete process.env.S3_SECRET_KEY;
  delete process.env.S3_BUCKET;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

// ---------------------------------------------------------------------------
// uploadFile — local/dev mode (no S3 configured)
// ---------------------------------------------------------------------------

describe("uploadFile (local/dev mode — no S3 env vars)", () => {
  it("returns a result with url, key, and bucket", async () => {
    const buffer = Buffer.from("test file content");
    const result = await uploadFile("test-folder/test.pdf", buffer, "application/pdf");

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("key");
    expect(result).toHaveProperty("bucket");
    expect(result.key).toBe("test-folder/test.pdf");
    expect(result.url).toContain("test-folder/test.pdf");
  });

  it("returns correct result shape", async () => {
    const buffer = Buffer.from("hello");
    const result = await uploadFile("folder/doc.pdf", buffer, "application/pdf");

    expect(result.url).toBeTruthy();
    expect(result.key).toBe("folder/doc.pdf");
    expect(result.bucket).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// checkS3Health — not configured
// ---------------------------------------------------------------------------

describe("checkS3Health", () => {
  it("returns configured:false when no env vars are set", async () => {
    const health = await checkS3Health();
    expect(health.configured).toBe(false);
    expect(health.reachable).toBe(false);
    expect(health.buckets).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ensureBucket — no-op when not configured
// ---------------------------------------------------------------------------

describe("ensureBucket", () => {
  it("does not throw when S3 is not configured", async () => {
    await expect(ensureBucket()).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// deleteFile — local fallback (no error for missing files)
// ---------------------------------------------------------------------------

describe("deleteFile (local)", () => {
  it("does not throw when file does not exist", async () => {
    await expect(
      deleteFile("nonexistent/file.pdf"),
    ).resolves.toBeUndefined();
  });
});
