import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/permissions actions
// ---------------------------------------------------------------------------

export const listPermissionSectionsSchema = z.object({});

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
// Types
// ---------------------------------------------------------------------------

const permissionSectionDetailSchema = z.object({
  permission_uuid: z.string().min(1),
  section_name: z.string().nullable(),
  created_at: z.date(),
});

export const listPermissionSectionsOutputSchema = z.array(permissionSectionDetailSchema);

export type ListPermissionSectionsOutput = z.output<typeof listPermissionSectionsOutputSchema>;

const permissionUuidSchema = z.object({
  permission_uuid: z.string().min(1),
});

export const createPermissionSectionOutputSchema = permissionUuidSchema;

export type CreatePermissionSectionOutput = z.output<typeof createPermissionSectionOutputSchema>;

export const updatePermissionSectionOutputSchema = permissionUuidSchema;

export type UpdatePermissionSectionOutput = z.output<typeof updatePermissionSectionOutputSchema>;

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
