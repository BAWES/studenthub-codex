import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAwsConfigSchema } from "./schemas";
import type { AwsConfigEntry, AwsConfigResult } from "./schemas";

// ---- Hoisted mock functions ----
const { mockRequireCapability } = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
}));

// ---- Mock session module ----
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

import { listAwsConfigs, getAwsConfig } from "./actions";

// ---------------------------------------------------------------------------
// Unit test coverage for admin/aws actions
// (STU-3283 / STU-3289)
//
// Tests schema validation and runtime behavior for AWS config actions,
// including env variable reading and secret masking.
// ---------------------------------------------------------------------------

describe("getAwsConfigSchema", () => {
  it("accepts a valid config key", () => {
    const r = getAwsConfigSchema.safeParse({ key: "aws_region" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.key).toBe("aws_region");
  });

  it("rejects empty key", () => {
    expect(getAwsConfigSchema.safeParse({ key: "" }).success).toBe(false);
  });

  it("rejects missing key", () => {
    expect(getAwsConfigSchema.safeParse({}).success).toBe(false);
  });

  it("rejects null key", () => {
    expect(getAwsConfigSchema.safeParse({ key: null }).success).toBe(false);
  });
});

describe("AwsConfigEntry type shape", () => {
  it("accepts a valid entry with value", () => {
    const entry: AwsConfigEntry = { key: "aws_region", value: "us-east-1" };
    expect(entry.key).toBe("aws_region");
    expect(entry.value).toBe("us-east-1");
  });

  it("accepts an entry with empty value", () => {
    const entry: AwsConfigEntry = { key: "aws_bucket", value: "" };
    expect(entry.value).toBe("");
  });
});

describe("AwsConfigResult type shape", () => {
  it("accepts a valid result object", () => {
    const result: AwsConfigResult = {
      region: "us-east-1",
      bucket: "my-bucket",
      key: "AKIA1234",
    };
    expect(result.region).toBe("us-east-1");
    expect(result.bucket).toBe("my-bucket");
    expect(result.key).toBe("AKIA1234");
  });

  it("accepts empty strings", () => {
    const result: AwsConfigResult = { region: "", bucket: "", key: "" };
    expect(result.region).toBe("");
    expect(result.bucket).toBe("");
    expect(result.key).toBe("");
  });
});

describe("listAwsConfigs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    // Restore env to a known state
    delete process.env.AWS_REGION;
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
  });

  it("returns config entries for all known keys", async () => {
    process.env.AWS_REGION = "eu-west-1";
    process.env.AWS_S3_BUCKET = "studenthub-prod";
    process.env.AWS_ACCESS_KEY_ID = "AKIA1234TEST";

    const result = await listAwsConfigs();

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    // Should have 4 entries for the 4 known keys
    expect(result.length).toBe(4);
    expect(result.some((e) => e.key === "aws_region")).toBe(true);
    expect(result.some((e) => e.key === "aws_bucket")).toBe(true);
    expect(result.some((e) => e.key === "aws_temp_access_key_id")).toBe(true);
    expect(result.some((e) => e.key === "aws_temp_secret_access_key")).toBe(true);
  });

  it("masks secret keys, showing only last 4 chars", async () => {
    process.env.AWS_TEMP_SECRET_ACCESS_KEY = "supersecretvalue1234";

    const result = await listAwsConfigs();
    const secretEntry = result.find(
      (e) => e.key === "aws_temp_secret_access_key",
    );

    expect(secretEntry).toBeDefined();
    expect(secretEntry!.value).toContain("••••••••");
    expect(secretEntry!.value).toContain("1234");
    expect(secretEntry!.value).not.toContain("supersecretvalue");
  });

  it("shows non-secret values in plain text", async () => {
    process.env.AWS_REGION = "ap-southeast-1";

    const result = await listAwsConfigs();
    const regionEntry = result.find((e) => e.key === "aws_region");

    expect(regionEntry).toBeDefined();
    expect(regionEntry!.value).toBe("ap-southeast-1");
  });

  it("returns empty string for missing env vars", async () => {
    const result = await listAwsConfigs();

    const allEmpty = result.every((e) => e.value === "");
    expect(allEmpty).toBe(true);
  });
});

describe("getAwsConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    delete process.env.AWS_REGION;
    delete process.env.AWS_DEFAULT_REGION;
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_BUCKET;
    delete process.env.AWS_ACCESS_KEY_ID;
  });

  it("returns config from env vars", async () => {
    process.env.AWS_REGION = "us-west-2";
    process.env.AWS_S3_BUCKET = "studenthub-dev";
    process.env.AWS_ACCESS_KEY_ID = "AKIA5678TEST";

    const result = await getAwsConfig();

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(result.region).toBe("us-west-2");
    expect(result.bucket).toBe("studenthub-dev");
    expect(result.key).toBe("AKIA5678TEST");
  });

  it("falls back to AWS_DEFAULT_REGION when AWS_REGION is missing", async () => {
    process.env.AWS_DEFAULT_REGION = "eu-central-1";
    process.env.AWS_BUCKET = "fallback-bucket";

    const result = await getAwsConfig();

    expect(result.region).toBe("eu-central-1");
    expect(result.bucket).toBe("fallback-bucket");
  });

  it("returns empty strings when no env vars set", async () => {
    const result = await getAwsConfig();

    expect(result.region).toBe("");
    expect(result.bucket).toBe("");
    expect(result.key).toBe("");
  });
});
