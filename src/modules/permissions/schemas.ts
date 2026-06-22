import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listPermissionSectionsSchema = z.object({});

export const getUserPermissionsSchema = z.object({
  type: z.enum(["staff", "admin"]),
  id: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single permission sub-section item in the section tree.
 */
export const permissionSubSectionItemSchema = z.object({
  permission_sub_section_uuid: z.string(),
  sub_section_name: z.string().nullable(),
  sub_section_slug: z.string().nullable(),
});

/**
 * Schema for a single permission section item with its sub-sections.
 */
export const permissionSectionItemSchema = z.object({
  permission_uuid: z.string(),
  section_name: z.string().nullable(),
  subSections: z.array(permissionSubSectionItemSchema),
});

/**
 * Schema for the full listPermissionSections response.
 */
export const permissionSectionListResponseSchema = z.array(
  permissionSectionItemSchema,
);

/**
 * Schema for a single permission user item.
 */
export const permissionUserItemSchema = z.object({
  permission_user_uuid: z.string(),
  admin_id: z.number().int().nullable(),
  staff_id: z.number().int().nullable(),
  permission_sub_section_uuid: z.string().nullable(),
  sub_section_name: z.string().nullable(),
  sub_section_slug: z.string().nullable(),
  section_name: z.string().nullable(),
  companies: z.array(z.string()),
});

/**
 * Schema for the full getUserPermissions response.
 */
export const permissionUserListResponseSchema = z.array(
  permissionUserItemSchema,
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PermissionSubSectionItem = z.output<
  typeof permissionSubSectionItemSchema
>;
export type PermissionSectionItem = z.output<
  typeof permissionSectionItemSchema
>;
export type PermissionUserItem = z.output<typeof permissionUserItemSchema>;
