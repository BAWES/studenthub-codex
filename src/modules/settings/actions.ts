"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SettingItem = {
  setting_uuid: string;
  code: string;
  key: string;
  value: string | null;
  serialized: boolean;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListSettingsResult = {
  settings: SettingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const listSettingsSchema = z.object({
  code: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getSettingSchema = z.object({
  settingUuid: z.string().min(1, "Setting UUID is required"),
});

export type GetSettingInput = z.input<typeof getSettingSchema>;

const updateSettingSchema = z.object({
  settingUuid: z.string().min(1, "Setting UUID is required"),
  value: z.string().nullable(),
});

export type UpdateSettingInput = z.input<typeof updateSettingSchema>;

export type ListSettingsInput = z.input<typeof listSettingsSchema>;

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation in tests)
// ---------------------------------------------------------------------------

export { listSettingsSchema, getSettingSchema, updateSettingSchema };

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List settings with optional code filter and pagination.
 * Mirrors the legacy Yii2 SettingController::actionList().
 */
export async function listSettings(
  params: ListSettingsInput = {},
): Promise<ListSettingsResult> {
  await requireCapability("admin.read");

  const parsed = listSettingsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { code, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (code && code.trim()) {
    where.code = code;
  }

  const [settings, total] = await Promise.all([
    prisma.setting.findMany({
      where: where as any,
      orderBy: [{ code: "asc" }, { key: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.setting.count({ where: where as any }),
  ]);

  return {
    settings: settings.map((s) => ({
      ...s,
      serialized: s.serialized ?? false,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getSetting
// ---------------------------------------------------------------------------

/**
 * Get a single setting by UUID.
 * Returns null if not found.
 * Mirrors the legacy SettingController::actionView().
 */
export async function getSetting(
  params: GetSettingInput,
): Promise<SettingItem | null> {
  await requireCapability("admin.read");

  const parsed = getSettingSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid setting UUID",
    );
  }

  const { settingUuid } = parsed.data;

  const setting = await prisma.setting.findUnique({
    where: { setting_uuid: settingUuid },
  });

  if (!setting) return null;

  return {
    ...setting,
    serialized: setting.serialized ?? false,
  };
}

// ---------------------------------------------------------------------------
// updateSetting
// ---------------------------------------------------------------------------

export type UpdateSettingResult = {
  operation: string;
  message: string;
};

/**
 * Update a setting's value.
 * Admin only — requires "setting.write" capability.
 * Mirrors the legacy SettingController::actionUpdate().
 */
export async function updateSetting(
  params: UpdateSettingInput,
): Promise<UpdateSettingResult> {
  await requireCapability("setting.write");

  const parsed = updateSettingSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid setting data",
    };
  }

  const { settingUuid, value } = parsed.data;

  // Verify the setting exists
  const existing = await prisma.setting.findUnique({
    where: { setting_uuid: settingUuid },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Setting not found",
    };
  }

  try {
    await prisma.setting.update({
      where: { setting_uuid: settingUuid },
      data: {
        value,
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Setting updated successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update setting",
    };
  }
}
