import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAwsConfigSchema, awsConfigEntrySchema, awsConfigEntryListSchema, awsConfigResultSchema } from "./schemas";
import type { AwsConfigEntry, AwsConfigResult } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability } = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

import { listAwsConfigs, getAwsConfig } from "./actions";

// ---------------------------------------------------------------------------
// Unit test coverage for admin/aws actions
// (STU-3275)
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
});

describe("AwsConfigEntry type", () => {
  it("holds a key-value pair", () => {
    const entry: AwsConfigEntry = { key: "aws_region", value: "us-east-1" };
    expect(entry.key).toBe("aws_region");
    expect(entry.value).toBe("us-east-1");
  });

  it("supports empty value for missing config", () => {
    const entry: AwsConfigEntry = { key: "aws_nonexistent", value: "" };
    expect(entry.value).toBe("");
  });

  it("supports masked secret value", () => {
    const entry: AwsConfigEntry = { key: "aws_secret_access_key", value: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022xyza" };
    expect(entry.value).toContain("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
  });
});

describe("AwsConfigResult type", () => {
  it("holds region, bucket, and key", () => {
    const result: AwsConfigResult = {
      region: "us-east-1",
      bucket: "my-bucket",
      key: "AKIAIO...MPLE",
    };
    expect(result.region).toBe("us-east-1");
  });

  it("supports empty strings for unset config", () => {
    const result: AwsConfigResult = { region: "", bucket: "", key: "" };
    expect(result.region).toBe("");
  });
});

describe("listAwsConfigs \u2014 runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("calls requireCapability with admin.system", async () => {
    await listAwsConfigs();
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
  });

  it("returns config entries for all 4 known keys", async () => {
    vi.stubEnv("AWS_REGION", "us-east-1");
    const result = await listAwsConfigs();
    expect(result).toHaveLength(4);
    const keys = result.map((e) => e.key);
    expect(keys).toContain("aws_region");
    expect(keys).toContain("aws_bucket");
    expect(keys).toContain("aws_temp_access_key_id");
    expect(keys).toContain("aws_temp_secret_access_key");
    vi.unstubAllEnvs();
  });

  it("masks secret keys showing only last 4 chars", async () => {
    vi.stubEnv("AWS_TEMP_SECRET_ACCESS_KEY", "supersecret1234");
    const result = await listAwsConfigs();
    const secretKey = result.find((e) => e.key === "aws_temp_secret_access_key");
    expect(secretKey?.value).toBe("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u20221234");
    expect(secretKey?.value).not.toContain("supersecret");
    vi.unstubAllEnvs();
  });

  it("returns empty string for unset env vars", async () => {
    const result = await listAwsConfigs();
    const region = result.find((e) => e.key === "aws_region");
    expect(region?.value).toBe("");
  });

  it("propagates auth errors", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Redirect"));
    await expect(listAwsConfigs()).rejects.toThrow("Redirect");
  });
});

describe("getAwsConfig \u2014 runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("calls requireCapability with admin.system", async () => {
    await getAwsConfig();
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
  });

  it("returns AWS config from env vars", async () => {
    vi.stubEnv("AWS_REGION", "eu-west-1");
    vi.stubEnv("AWS_S3_BUCKET", "my-bucket");
    vi.stubEnv("AWS_ACCESS_KEY_ID", "AKIA123456");
    const result = await getAwsConfig();
    expect(result).toEqual({ region: "eu-west-1", bucket: "my-bucket", key: "AKIA123456" });
    vi.unstubAllEnvs();
  });

  it("falls back to AWS_DEFAULT_REGION when AWS_REGION is unset", async () => {
    vi.stubEnv("AWS_DEFAULT_REGION", "ap-southeast-1");
    const result = await getAwsConfig();
    expect(result.region).toBe("ap-southeast-1");
    vi.unstubAllEnvs();
  });

  it("falls back to AWS_BUCKET when AWS_S3_BUCKET is unset", async () => {
    vi.stubEnv("AWS_BUCKET", "fallback-bucket");
    const result = await getAwsConfig();
    expect(result.bucket).toBe("fallback-bucket");
    vi.unstubAllEnvs();
  });

  it("returns empty strings when no env vars set", async () => {
    const result = await getAwsConfig();
    expect(result).toEqual({ region: "", bucket: "", key: "" });
  });

  it("propagates auth errors", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Redirect"));
    await expect(getAwsConfig()).rejects.toThrow("Redirect");
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests (Zod safeParse)
// ---------------------------------------------------------------------------

describe("awsConfigEntrySchema (output validation)", () => {
  it("accepts valid config entry", () => {
    const r = awsConfigEntrySchema.safeParse({ key: "aws_region", value: "us-east-1" });
    expect(r.success).toBe(true);
  });

  it("accepts empty value for unset config", () => {
    const r = awsConfigEntrySchema.safeParse({ key: "aws_region", value: "" });
    expect(r.success).toBe(true);
  });

  it("rejects missing key", () => {
    const r = awsConfigEntrySchema.safeParse({ value: "us-east-1" });
    expect(r.success).toBe(false);
  });
});

describe("awsConfigEntryListSchema (output validation)", () => {
  it("accepts array of config entries", () => {
    const r = awsConfigEntryListSchema.safeParse([
      { key: "aws_region", value: "us-east-1" },
      { key: "aws_bucket", value: "my-bucket" },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts empty array", () => {
    const r = awsConfigEntryListSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects array with invalid entry", () => {
    const r = awsConfigEntryListSchema.safeParse([
      { key: "", value: "us-east-1" },
    ]);
    expect(r.success).toBe(false);
  });
});

describe("awsConfigResultSchema (output validation)", () => {
  it("accepts valid config result", () => {
    const r = awsConfigResultSchema.safeParse({
      region: "us-east-1",
      bucket: "my-bucket",
      key: "AKIA123456",
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty strings for unset config", () => {
    const r = awsConfigResultSchema.safeParse({ region: "", bucket: "", key: "" });
    expect(r.success).toBe(true);
  });

  it("rejects non-string values", () => {
    const r = awsConfigResultSchema.safeParse({ region: 123, bucket: "", key: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing region field", () => {
    const r = awsConfigResultSchema.safeParse({ bucket: "", key: "" });
    expect(r.success).toBe(false);
  });
});
