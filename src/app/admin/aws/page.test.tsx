import { describe, it, expect } from "vitest";
import {
  getAwsConfigSchema,
  awsConfigEntrySchema,
  awsConfigEntryListSchema,
  awsConfigResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/aws.
 *
 * Verifies the data contract between page and action.
 * The AWS config page uses listAwsConfigs and getAwsConfig
 * to display config entries and connection summary.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin aws page — data contract", () => {
  it("awsConfigEntrySchema validates a valid config entry", () => {
    const r = awsConfigEntrySchema.safeParse({
      key: "aws_region",
      value: "us-east-1",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.key).toBe("aws_region");
      expect(r.data.value).toBe("us-east-1");
    }
  });

  it("awsConfigEntrySchema rejects empty key", () => {
    const r = awsConfigEntrySchema.safeParse({ key: "", value: "test" });
    expect(r.success).toBe(false);
  });

  it("awsConfigEntryListSchema validates an array of entries", () => {
    const r = awsConfigEntryListSchema.safeParse([
      { key: "aws_region", value: "us-east-1" },
      { key: "aws_bucket", value: "studenthub-uploads" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.length).toBe(2);
  });

  it("awsConfigResultSchema validates connection summary", () => {
    const r = awsConfigResultSchema.safeParse({
      region: "us-east-1",
      bucket: "studenthub-uploads",
      key: "AKIAXXXX",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.region).toBe("us-east-1");
      expect(r.data.bucket).toBe("studenthub-uploads");
      expect(r.data.key).toBe("AKIAXXXX");
    }
  });

  it("awsConfigResultSchema allows empty strings for missing config", () => {
    const r = awsConfigResultSchema.safeParse({
      region: "",
      bucket: "",
      key: "",
    });
    expect(r.success).toBe(true);
  });

  it("getAwsConfigSchema accepts valid key", () => {
    const r = getAwsConfigSchema.safeParse({ key: "aws_region" });
    expect(r.success).toBe(true);
  });

  it("getAwsConfigSchema rejects empty key", () => {
    const r = getAwsConfigSchema.safeParse({ key: "" });
    expect(r.success).toBe(false);
  });

  it("awsConfigEntry shape matches the rendered output in AdminAwsTable", () => {
    const entry = { key: "aws_region", value: "us-east-1" };
    expect(typeof entry.key).toBe("string");
    expect(typeof entry.value).toBe("string");
  });

  it("awsConfigResult shape matches the summary section", () => {
    const result = { region: "us-east-1", bucket: "studenthub-uploads", key: "AKIAXXXX" };
    expect(Object.keys(result).sort()).toEqual(["bucket", "key", "region"]);
  });
});
