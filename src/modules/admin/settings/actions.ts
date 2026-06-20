"use server";

// ---------------------------------------------------------------------------
// Admin Settings — server actions
// ---------------------------------------------------------------------------
// Manages key-value settings (model: setting) with code namespacing.
// Actions:
//   - listSettings       — list settings with pagination and search
//   - getSetting         — single setting detail
//   - createSetting      — create a new setting
//   - updateSetting      — update an existing setting
//   - deleteSetting      - delete a setting
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSettingsSchema,
  getSettingSchema,
  createSettingSchema,
  updateSettingSchema,
  deleteSettingSchema,
  settingListResponseSchema,
  settingDetailSchema,
  settingActionResponseSchema,
  type ListSettingsInput,
  type GetSettingInput,
  type CreateSettingInput,
  type UpdateSettingInput,
  type DeleteSettingInput,
  type SettingRow,
  type SettingDetail,
  type SettingActionResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// listSettings
// ---------------------------------------------------------------------------

export async function listSettings(
  input: ListSettingsInput = {},
): Promise<{
  items: SettingRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("admin.read");

  const parsed = listSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  const { search, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { code: { contains: search } },
      { key: { contains: search } },
      { value: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.setting.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ code: "asc" }, { key: "asc" }],
    }),
    prisma.setting.count({ where }),
  ]);

  return settingListResponseSchema.parse({
    items: items.map((s) => ({
      ...s,
      created_at: s.created_at?.toISOString() ?? null,
      updated_at: s.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// ---------------------------------------------------------------------------
// getSetting
// ---------------------------------------------------------------------------

export async function getSetting(
  input: GetSettingInput,
): Promise<SettingDetail | null> {
  await requireCapability("admin.read");

  const parsed = getSettingSchema.safeParse(input);
  if (!parsed.success) return null;

  const s = await prisma.setting.findUnique({
    where: { setting_uuid: parsed.data.setting_uuid },
  });

  if (!s) return null;

  return settingDetailSchema.parse({
    ...s,
    created_at: s.created_at?.toISOString() ?? null,
    updated_at: s.updated_at?.toISOString() ?? null,
  });
}

// ---------------------------------------------------------------------------
// createSetting
// ---------------------------------------------------------------------------

export async function createSetting(
  input: CreateSettingInput,
): Promise<SettingActionResponse> {
  await requireCapability("setting.write");

  const parsed = createSettingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const s = await prisma.setting.create({
    data: {
      setting_uuid: crypto.randomUUID(),
      code: parsed.data.code,
      key: parsed.data.key,
      value: parsed.data.value,
      serialized: parsed.data.serialized,
    },
  });

  revalidatePath("/admin/setting");
  revalidatePath("/admin/setting/[settingId]");

  return settingActionResponseSchema.parse({
    success: true,
    message: "Setting created",
    setting: {
      ...s,
      created_at: s.created_at?.toISOString() ?? null,
      updated_at: s.updated_at?.toISOString() ?? null,
    },
  });
}

// ---------------------------------------------------------------------------
// updateSetting
// ---------------------------------------------------------------------------

export async function updateSetting(
  input: UpdateSettingInput,
): Promise<SettingActionResponse> {
  await requireCapability("setting.write");

  const parsed = updateSettingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { setting_uuid, ...data } = parsed.data;

  const s = await prisma.setting.update({
    where: { setting_uuid },
    data: { ...data, updated_at: new Date() },
  });

  revalidatePath("/admin/setting");
  revalidatePath("/admin/setting/[settingId]");

  return settingActionResponseSchema.parse({
    success: true,
    message: "Setting updated",
    setting: {
      ...s,
      created_at: s.created_at?.toISOString() ?? null,
      updated_at: s.updated_at?.toISOString() ?? null,
    },
  });
}

// ---------------------------------------------------------------------------
// deleteSetting
// ---------------------------------------------------------------------------

export async function deleteSetting(
  input: DeleteSettingInput,
): Promise<SettingActionResponse> {
  await requireCapability("setting.write");

  const parsed = deleteSettingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  await prisma.setting.delete({
    where: { setting_uuid: parsed.data.setting_uuid },
  });

  revalidatePath("/admin/setting");

  return { success: true, message: "Setting deleted" };
}
