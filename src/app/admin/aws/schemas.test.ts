import { describe, it, expect } from "vitest";
import {
  getAwsConfigSchema,
  awsConfigEntrySchema,
  awsConfigEntryListSchema,
  awsConfigResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getAwsConfigSchema
// ---------------------------------------------------------------------------
describe("getAwsConfigSchema", () => {
  it("accepts valid input", () => {
    expect(getAwsConfigSchema.safeParse({ key: "AWS_ACCESS_KEY" }).success).toBe(true);
  });

  it("rejects missing key", () => {
    expect(getAwsConfigSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty key", () => {
    expect(getAwsConfigSchema.safeParse({ key: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getAwsConfigSchema.safeParse({ key: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// awsConfigEntrySchema
// ---------------------------------------------------------------------------
describe("awsConfigEntrySchema", () => {
  const validEntry = { key: "AWS_REGION", value: "us-east-1" };

  it("accepts valid input", () => {
    expect(awsConfigEntrySchema.safeParse(validEntry).success).toBe(true);
  });

  it("accepts empty value string", () => {
    expect(
      awsConfigEntrySchema.safeParse({ ...validEntry, value: "" }).success,
    ).toBe(true);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = validEntry;
    expect(awsConfigEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty key", () => {
    expect(
      awsConfigEntrySchema.safeParse({ ...validEntry, key: "" }).success,
    ).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validEntry;
    expect(awsConfigEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(awsConfigEntrySchema.safeParse({ key: 123, value: true }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// awsConfigEntryListSchema
// ---------------------------------------------------------------------------
describe("awsConfigEntryListSchema", () => {
  it("accepts a list of config entries", () => {
    expect(
      awsConfigEntryListSchema.safeParse([
        { key: "AWS_REGION", value: "us-east-1" },
        { key: "AWS_BUCKET", value: "my-bucket" },
      ]).success,
    ).toBe(true);
  });

  it("accepts empty array", () => {
    expect(awsConfigEntryListSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(awsConfigEntryListSchema.safeParse({}).success).toBe(false);
  });

  it("rejects array with invalid items", () => {
    expect(
      awsConfigEntryListSchema.safeParse([{ key: "only-key" }]).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// awsConfigResultSchema
// ---------------------------------------------------------------------------
describe("awsConfigResultSchema", () => {
  const validResult = {
    region: "us-east-1",
    bucket: "my-bucket",
    key: "config/key.json",
  };

  it("accepts valid input", () => {
    expect(awsConfigResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty strings in all fields", () => {
    expect(
      awsConfigResultSchema.safeParse({ region: "", bucket: "", key: "" })
        .success,
    ).toBe(true);
  });

  it("rejects missing region", () => {
    const { region: _, ...rest } = validResult;
    expect(awsConfigResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing bucket", () => {
    const { bucket: _, ...rest } = validResult;
    expect(awsConfigResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = validResult;
    expect(awsConfigResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(
      awsConfigResultSchema.safeParse({ region: 1, bucket: true, key: null })
        .success,
    ).toBe(false);
  });
});
