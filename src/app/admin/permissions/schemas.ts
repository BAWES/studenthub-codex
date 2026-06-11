import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/permissions actions
// ---------------------------------------------------------------------------

export const listPermissionSectionsSchema = z.object({});

export const getPermissionSectionSchema = z.object({
  permission_uuid: z.string().min(1, "Permission section UUID is required"),
});

export const createPermissionSectionSchema = z.object({
  section_name: z
    .string({ required_error: "Section name is required" })
    .min(1, "Section name is required")
    .max(255),
});

export const updatePermissionSectionSchema = z.object({
  permission_uuid: z.string().min(1, "Permission section UUID is required"),
  section_name: z
    .string({ required_error: "Section name is required" })
    .min(1, "Section name is required")
    .max(255),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single permission section detail.
 */
export const permissionSectionDetailSchema = z.object({
  permission_uuid: z.string(),
  section_name: z.string().nullable(),
  created_at: z.date(),
});

/**
 * Schema for listPermissionSections response.
 * Returns an array of permission section items.
 */
export const listPermissionSectionsOutputSchema = z.array(
  permissionSectionDetailSchema,
);

/**
 * Schema for getPermissionSection response.
 * Returns a single permission section or null.
 */
export const getPermissionSectionOutputSchema =
  permissionSectionDetailSchema.nullable();

/**
 * Schema for createPermissionSection response.
 */
export const createPermissionSectionOutputSchema = z.object({
  permission_uuid: z.string(),
});

/**
 * Schema for updatePermissionSection response.
 */
export const updatePermissionSectionOutputSchema = z.object({
  permission_uuid: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

const permissionSectionDetailSchema = z.object({
  permission_uuid: z.string().min(1),
  section_name: z.string().nullable(),
  created_at: z.date(),
});

export const listPermissionSectionsOutputSchema = z.array(permissionSectionDetailSchema);

export type ListPermissionSectionsOutput = z.infer<typeof listPermissionSectionsOutputSchema>;

export const getPermissionSectionOutputSchema = permissionSectionDetailSchema.nullable();

export type GetPermissionSectionOutput = z.infer<typeof getPermissionSectionOutputSchema>;

const permissionUuidSchema = z.object({
  permission_uuid: z.string().min(1),
});

export const createPermissionSectionOutputSchema = permissionUuidSchema;

export type CreatePermissionSectionOutput = z.infer<typeof createPermissionSectionOutputSchema>;

export const updatePermissionSectionOutputSchema = permissionUuidSchema;

export type UpdatePermissionSectionOutput = z.infer<typeof updatePermissionSectionOutputSchema>;

export type CreatePermissionSectionInput = z.input<
  typeof createPermissionSectionSchema
>;

export type UpdatePermissionSectionInput = z.input<
  typeof updatePermissionSectionSchema
>;

export type PermissionSectionDetail = {
  permission_uuid: string;
  section_name: string | null;
  created_at: Date;
};
