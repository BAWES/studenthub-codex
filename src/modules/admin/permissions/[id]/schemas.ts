import { z } from "zod";

// ---------------------------------------------------------------------------
// Permission Section Detail schemas — single-section detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getPermissionSection.
 */
export const getPermissionSectionSchema = z.object({
  permissionUuid: z.string().min(1, "Permission section UUID is required"),
});

/**
 * Schema for a permission section detail.
 */
export const permissionSectionSchema = z.object({
  permission_uuid: z.string().min(1),
  section_name: z.string().nullable(),
  created_at: z.date(),
});

/**
 * Output schema for getPermissionSection.
 */
export const getPermissionSectionResultSchema =
  permissionSectionSchema.nullable();

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type PermissionSectionDetail = z.output<typeof permissionSectionSchema>;
export type GetPermissionSectionResult = z.output<
  typeof getPermissionSectionResultSchema
>;
export type GetPermissionSectionInput = z.input<
  typeof getPermissionSectionSchema
>;
