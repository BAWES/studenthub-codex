"use server";

// ---------------------------------------------------------------------------
// Admin — AWS Config Server Actions
// ---------------------------------------------------------------------------
// Mirrors the legacy AwsController::actionIndex() and actionConfig().
// Each action validates its output through a Zod schema for type safety.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import { getAwsConfigSchema, awsConfigEntryListSchema, awsConfigResultSchema } from "./schemas";
import type { AwsConfigEntry, AwsConfigResult } from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/aws] ${source} output failed:`, error);
}

/**
 * Known AWS config keys used by the app.
 * Mirrors what the legacy AwsController::actionConfig() returns.
 */
const AWS_CONFIG_KEYS = [
  "aws_temp_access_key_id",
  "aws_temp_secret_access_key",
  "aws_region",
  "aws_bucket",
] as const;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List all available AWS configuration keys and their values.
 * Mirrors the legacy AwsController index endpoint.
 */
export async function listAwsConfigs(): Promise<AwsConfigEntry[]> {
  await requireCapability("admin.system");

  const now = new Date().toISOString();

  const result = AWS_CONFIG_KEYS.map((key) => {
    const envName = key
      .toUpperCase()
      .replace(/^AWS_/, "AWS_")
      .replace(/^aws_/, "AWS_");
    const value = process.env[envName] ?? null;

    if (!value) {
      return {
        key,
        value: "",
      };
    }

    // Mask secrets — only show last 4 chars for sensitive keys
    const isSecret = key.includes("secret") || key.includes("secret_access");
    return {
      key,
      value: isSecret
        ? `••••••••${value.slice(-4)}`
        : value,
    };
  });

  // Validate output shape — log mismatches without throwing
  const listParsed = awsConfigEntryListSchema.safeParse(result);
  if (!listParsed.success) {
    logOutputError("listAwsConfigs", listParsed.error.issues);
  }

  return result;
}

/**
 * Get a single AWS configuration value by key.
 * Mirrors the legacy AwsController::actionConfig().
 */
export async function getAwsConfig(): Promise<AwsConfigResult> {
  await requireCapability("admin.system");

  const result: AwsConfigResult = {
    region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "",
    bucket: process.env.AWS_S3_BUCKET ?? process.env.AWS_BUCKET ?? "",
    key: process.env.AWS_ACCESS_KEY_ID ?? "",
  };

  // Validate output shape — log mismatches without throwing
  const parsed = awsConfigResultSchema.safeParse(result);
  if (!parsed.success) {
    logOutputError("getAwsConfig", parsed.error.issues);
  }

  return result;
}
