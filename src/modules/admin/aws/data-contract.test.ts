import { describe, it, expect } from "vitest";
import { awsConfigEntrySchema, awsConfigEntryListSchema, awsConfigResultSchema, getAwsConfigSchema } from "./schemas";

describe("admin aws — data contracts", () => {
  it("awsConfigEntrySchema validates a config entry", () => {
    const r = awsConfigEntrySchema.safeParse({ key: "AWS_REGION", value: "me-central-1" });
    expect(r.success).toBe(true);
  });

  it("awsConfigEntryListSchema validates an array", () => {
    const r = awsConfigEntryListSchema.safeParse([
      { key: "AWS_REGION", value: "me-central-1" },
      { key: "AWS_BUCKET", value: "studenthub-uploads" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.length).toBe(2);
  });

  it("awsConfigResultSchema validates a config result", () => {
    const r = awsConfigResultSchema.safeParse({
      region: "me-central-1",
      bucket: "studenthub-uploads",
      key: "AWS_REGION/studenthub-uploads",
    });
    expect(r.success).toBe(true);
  });

  it("getAwsConfigSchema requires key field", () => {
    const r = getAwsConfigSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getAwsConfigSchema accepts valid key", () => {
    const r = getAwsConfigSchema.safeParse({ key: "AWS_REGION" });
    expect(r.success).toBe(true);
  });
});
