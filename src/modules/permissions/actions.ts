"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getUserPermissionsSchema,
  permissionSectionListResponseSchema,
  permissionUserListResponseSchema,
} from "./schemas";
import type { PermissionSectionItem, PermissionUserItem } from "./schemas";

// ---------------------------------------------------------------------------
// Re-export schemas for shared validation (backward compatibility)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// listPermissionSections
// ---------------------------------------------------------------------------

/**
 * List all permission sections with their sub-sections.
 *
 * Mirrors the legacy Yii2 PermissionSectionController::actionList:
 * - Returns all sections with nested sub-sections
 * - No pagination (returns the full tree)
 */
export async function listPermissionSections(): Promise<PermissionSectionItem[]> {
  await requireCapability("admin.read");

  const sections = await prisma.permission_section.findMany({
    include: {
      permission_sub_section: {
        select: {
          permission_sub_section_uuid: true,
          sub_section_name: true,
          sub_section_slug: true,
        },
        orderBy: { sub_section_name: "asc" },
      },
    },
    orderBy: { section_name: "asc" },
  });

  const result: PermissionSectionItem[] = sections.map((s: any) => ({
    permission_uuid: s.permission_uuid,
    section_name: s.section_name,
    subSections: (s.permission_sub_section || []).map(
      (sub: any): PermissionSectionItem["subSections"][number] => ({
        permission_sub_section_uuid: sub.permission_sub_section_uuid,
        sub_section_name: sub.sub_section_name,
        sub_section_slug: sub.sub_section_slug,
      }),
    ),
  }));

  // Validate output shape
  const outputParsed = permissionSectionListResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/permissions] listPermissionSections output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getUserPermissions
// ---------------------------------------------------------------------------

/**
 * Get permissions for a specific user (staff or admin).
 *
 * Mirrors the legacy Yii2 PermissionSectionController::actionUserPermission:
 * - Filters by staff_id or admin_id depending on type
 * - Joins with permission_sub_section and permission_section tables
 * - Parses companies JSON field
 */
export async function getUserPermissions(
  type: "staff" | "admin",
  id: number,
): Promise<PermissionUserItem[]> {
  await requireCapability("admin.read");

  const parsed = getUserPermissionsSchema.safeParse({ type, id });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const where: Record<string, unknown> =
    type === "staff" ? { staff_id: id } : { admin_id: id };

  const permissions = await prisma.permission_user.findMany({
    where: where as any,
    include: {
      permission_sub_section: {
        include: {
          permission_section: {
            select: { section_name: true },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const result: PermissionUserItem[] = permissions.map((p: any) => {
    const subSection = p.permission_sub_section;
    const sectionName = subSection?.permission_section?.section_name ?? null;
    let companies: string[] = [];
    try {
      // The `companies` field is stored in permission_user (added by migration)
      companies = (p as any).companies
        ? JSON.parse(typeof (p as any).companies === "string" ? (p as any).companies : "[]")
        : [];
    } catch {
      companies = [];
    }

    return {
      permission_user_uuid: p.permission_user_uuid,
      admin_id: p.admin_id ?? null,
      staff_id: p.staff_id ?? null,
      permission_sub_section_uuid: subSection?.permission_sub_section_uuid ?? null,
      sub_section_name: subSection?.sub_section_name ?? null,
      sub_section_slug: subSection?.sub_section_slug ?? null,
      section_name: sectionName,
      companies,
    };
  });

  // Validate output shape
  const outputParsed = permissionUserListResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/permissions] getUserPermissions output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
