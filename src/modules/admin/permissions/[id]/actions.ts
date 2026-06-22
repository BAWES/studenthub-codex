"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getPermissionSectionSchema,
  getPermissionSectionResultSchema,
} from "./schemas";
import type {
  GetPermissionSectionResult,
  GetPermissionSectionInput,
} from "./schemas";

/**
 * Get a single permission section by UUID.
 * Mirrors the legacy Yii2 PermissionSectionController::actionView().
 */
export async function getPermissionSection(
  input: GetPermissionSectionInput,
): Promise<GetPermissionSectionResult> {
  await requireCapability("admin.read");

  const parsed = getPermissionSectionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid permission section UUID",
    );
  }

  const section = await prisma.permission_section.findUnique({
    where: { permission_uuid: parsed.data.permissionUuid },
  });

  if (!section) {
    const result: GetPermissionSectionResult = null;
    const outputParsed =
      getPermissionSectionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/permissions/[id]] getPermissionSection (not found) output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const result: GetPermissionSectionResult = {
    permission_uuid: section.permission_uuid,
    section_name: section.section_name,
    created_at: section.created_at,
  };

  const outputParsed = getPermissionSectionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/permissions/[id]] getPermissionSection output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
