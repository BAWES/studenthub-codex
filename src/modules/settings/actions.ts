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

export type ListSettingsInput = z.input<typeof listSettingsSchema>;

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
