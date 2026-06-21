import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SettingRow = {
  id: string;
  code: string;
  key: string;
  valuePreview: string;
  serialized: boolean;
  updated: string;
};

export type SettingDetail = {
  setting_uuid: string;
  code: string;
  key: string;
  value: string | null;
  serialized: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export async function getAdminSettingsRows(): Promise<SettingRow[]> {
  const rows = await prisma.setting.findMany({
    orderBy: [{ code: "asc" }, { key: "asc" }],
    take: 200,
  });

  return rows.map((row) => ({
    id: row.setting_uuid,
    code: row.code,
    key: row.key,
    valuePreview: row.value
      ? row.value.length > 80
        ? row.value.substring(0, 80) + "..."
        : row.value
      : "(empty)",
    serialized: row.serialized ?? false,
    updated: row.updated_at
      ? new Date(row.updated_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Never",
  }));
}

export async function getSettingDetail(uuid: string): Promise<SettingDetail | null> {
  const setting = await prisma.setting.findUnique({
    where: { setting_uuid: uuid },
  });

  if (!setting) return null;

  return {
    setting_uuid: setting.setting_uuid,
    code: setting.code,
    key: setting.key,
    value: setting.value,
    serialized: setting.serialized ?? false,
    created_at: setting.created_at?.toISOString() ?? null,
    updated_at: setting.updated_at?.toISOString() ?? null,
  };
}

export async function updateSettingValue(
  uuid: string,
  value: string,
  serialized?: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.setting.update({
      where: { setting_uuid: uuid },
      data: {
        value,
        serialized: serialized ?? false,
        updated_at: new Date(),
      },
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update setting",
    };
  }
}
