"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSettingsSchema,
  listSettingsResultSchema,
} from "./schemas";
import type {
  ListSettingsInput,
  ListSettingsResult,
  SettingItem,
} from "./schemas";

export async function listSettings(
  input: ListSettingsInput = {},
): Promise<ListSettingsResult> {
  await requireCapability("admin.read");
  const parsed = listSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { settings: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.setting.findMany({
      orderBy: { updated_at: "desc" },
      skip,
      take: limit,
      select: {
        setting_uuid: true,
        code: true,
        key: true,
        value: true,
        serialized: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.setting.count(),
  ]);

  const result = {
    settings: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listSettingsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/setting] listSettings output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function getSetting(
  settingUuid: string,
): Promise<{ setting: SettingItem | null }> {
  await requireCapability("admin.read");

  const row = await prisma.setting.findUnique({
    where: { setting_uuid: settingUuid },
    select: {
      setting_uuid: true,
      code: true,
      key: true,
      value: true,
      serialized: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!row) return { setting: null };
  return { setting: row };
}
