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
  const validInput = { key: "AWS_ACCESS_KEY" };

  it("accepts a valid input", () => {
    expect(getAwsConfigSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing key", () => {
    expect(getAwsConfigSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty key", () => {
    expect(getAwsConfigSchema.safeParse({ key: "" }).success).toBe(false);
  });

  it("rejects wrong type for key", () => {
    expect(getAwsConfigSchema.safeParse({ key: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// awsConfigEntrySchema
// ---------------------------------------------------------------------------
describe("awsConfigEntrySchema", () => {
  const validEntry = { key: "AWS_REGION", value: "us-east-1" };

  it("accepts a valid config entry", () => {
    expect(awsConfigEntrySchema.safeParse(validEntry).success).toBe(true);
  });

  it("accepts empty value", () => {
    expect(awsConfigEntrySchema.safeParse({ ...validEntry, value: "" }).success).toBe(true);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = validEntry;
    expect(awsConfigEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty key", () => {
    expect(awsConfigEntrySchema.safeParse({ ...validEntry, key: "" }).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validEntry;
    expect(awsConfigEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for key", () => {
    expect(awsConfigEntrySchema.safeParse({ ...validEntry, key: 123 }).success).toBe(false);
  });

  it("rejects wrong type for value", () => {
    expect(awsConfigEntrySchema.safeParse({ ...validEntry, value: 456 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// awsConfigEntryListSchema (array)
// ---------------------------------------------------------------------------
describe("awsConfigEntryListSchema", () => {
  it("accepts a valid array of config entries", () => {
    expect(
      awsConfigEntryListSchema.safeParse([
        { key: "REGION", value: "us-east-1" },
      ]).success,
    ).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(awsConfigEntryListSchema.safeParse([]).success).toBe(true);
  });

  it("rejects invalid items", () => {
    expect(awsConfigEntryListSchema.safeParse([{ key: "" }]).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// awsConfigResultSchema
// ---------------------------------------------------------------------------
describe("awsConfigResultSchema", () => {
  const validResult = { region: "us-east-1", bucket: "my-bucket", key: "config.json" };

  it("accepts a valid config result", () => {
    expect(awsConfigResultSchema.safeParse(validResult).success).toBe(true);
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

  it("rejects wrong type for region", () => {
    expect(awsConfigResultSchema.safeParse({ ...validResult, region: 123 }).success).toBe(false);
  });

  it("rejects wrong type for bucket", () => {
    expect(awsConfigResultSchema.safeParse({ ...validResult, bucket: 456 }).success).toBe(false);
  });

  it("rejects wrong type for key", () => {
    expect(awsConfigResultSchema.safeParse({ ...validResult, key: 789 }).success).toBe(false);
  });
});
