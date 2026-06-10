import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/aws actions
// ---------------------------------------------------------------------------

export const getAwsConfigSchema = z.object({
  key: z.string().min(1, "Config key is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AwsConfigEntry = {
  /** Config key name (e.g. "region", "bucket") */
  key: string;
  /** Config value */
  value: string;
};

export type AwsConfigResult = {
  region: string;
  bucket: string;
  key: string;
};
