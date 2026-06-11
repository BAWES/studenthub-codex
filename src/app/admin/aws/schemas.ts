import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/aws actions
// ---------------------------------------------------------------------------

export const getAwsConfigSchema = z.object({
  key: z.string().min(1, "Config key is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single AWS config entry.
 */
export const awsConfigEntrySchema = z.object({
  key: z.string().min(1, "Config key is required"),
  value: z.string(),
});

/**
 * Schema for the full list returned by listAwsConfigs.
 */
export const awsConfigEntryListSchema = z.array(awsConfigEntrySchema);

/**
 * Schema for the result returned by getAwsConfig.
 */
export const awsConfigResultSchema = z.object({
  region: z.string(),
  bucket: z.string(),
  key: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AwsConfigEntry = z.input<typeof awsConfigEntrySchema>;
export type AwsConfigResult = z.input<typeof awsConfigResultSchema>;
