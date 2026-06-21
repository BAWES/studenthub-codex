"use server";

import { requireRoleCapability } from "@/modules/auth/session";
import { updateSettingValue } from "./data";
import { settingUpdateSchema } from "./schemas";

export async function updateSettingAction(
  uuid: string,
  _prev: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await requireRoleCapability("admin", "admin.system");
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const raw = {
    value: formData.get("value") as string,
    serialized: formData.get("serialized") === "true",
  };

  const parsed = settingUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  return updateSettingValue(uuid, parsed.data.value, parsed.data.serialized);
}
