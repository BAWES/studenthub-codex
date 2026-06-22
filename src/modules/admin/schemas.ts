import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const adminListItemSchema = z.object({
  admin_id: z.number().int(),
  admin_name: z.string(),
  admin_email: z.string(),
  admin_status: z.number().int(),
  admin_created_at: z.date(),
});

export const adminDetailSchema = adminListItemSchema.extend({
  admin_updated_at: z.date(),
  admin_limited_access: z.number().int().nullable(),
});

export const listAdminsResultSchema = z.object({
  admins: z.array(adminListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const createAdminResultSchema = z.object({
  admin_id: z.number().int(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type AdminListItem = z.output<typeof adminListItemSchema>;
export type AdminDetail = z.output<typeof adminDetailSchema>;
export type ListAdminsResult = z.output<typeof listAdminsResultSchema>;
export type CreateAdminResult = z.output<typeof createAdminResultSchema>;
