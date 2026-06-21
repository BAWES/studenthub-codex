import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single blocked IP list item.
 */
export const blockedIpListItemSchema = z.object({
  ip_uuid: z.string(),
  ip_address: z.string().nullable(),
  note: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for the listBlockedIps response.
 */
export const listBlockedIpsResultSchema = z.object({
  records: z.array(blockedIpListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for mutation responses returning { ip_uuid }.
 */
export const blockedIpUuidResultSchema = z.object({
  ip_uuid: z.string(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type BlockedIpListItem = z.output<typeof blockedIpListItemSchema>;
export type ListBlockedIpsResult = z.output<typeof listBlockedIpsResultSchema>;
export type BlockedIpUuidResult = z.output<typeof blockedIpUuidResultSchema>;
