import { z } from "zod";

// ---------------------------------------------------------------------------
// Search & Palette — output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a candidate palette search result (searchPalette.ts).
 */
export const candidatePaletteResultSchema = z.object({
  id: z.number().int(),
  uid: z.string(),
  name: z.string(),
  email: z.string(),
});

export type CandidatePaletteResult = z.output<typeof candidatePaletteResultSchema>;

// ---------------------------------------------------------------------------
// Navigation — output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single navigation item (navigation.ts).
 */
export const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  badge: z.union([z.string(), z.number()]).optional(),
  active: z.boolean().optional(),
  children: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
        badge: z.union([z.string(), z.number()]).optional(),
      }),
    )
    .optional(),
});

export type NavItem = z.output<typeof navItemSchema>;

// ---------------------------------------------------------------------------
// Status mapping — output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for transfer status mapping (status-mapping.ts).
 */
export const transferStatusMappingSchema = z.object({
  label: z.string(),
  variant: z.enum(["success", "warning", "error", "info", "neutral"]),
  code: z.number().int(),
});

export type TransferStatusMapping = z.output<typeof transferStatusMappingSchema>;

// ---------------------------------------------------------------------------
// Workspace UI — reusable component prop / data schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a breadcrumb item (Breadcrumbs.tsx).
 */
export const breadcrumbItemSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
});

export type BreadcrumbItem = z.output<typeof breadcrumbItemSchema>;

/**
 * Schema for the RoleBranding type (RoleLayoutShell.tsx).
 */
export const roleBrandingSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  logo: z.string().optional(),
  accentColor: z.string().optional(),
});

export type RoleBranding = z.output<typeof roleBrandingSchema>;

/**
 * Reusable status badge variant type.
 */
export const statusBadgeVariantSchema = z.enum([
  "success",
  "warning",
  "error",
  "info",
  "neutral",
]);

export type StatusBadgeVariant = z.output<typeof statusBadgeVariantSchema>;

export const statusBadgeSizeSchema = z.enum(["sm", "md", "lg"]);

export type StatusBadgeSize = z.output<typeof statusBadgeSizeSchema>;

/**
 * Schema for the action button variant.
 */
export const actionButtonVariantSchema = z.enum([
  "primary",
  "secondary",
  "outline",
  "ghost",
  "danger",
]);

export type ActionButtonVariant = z.output<typeof actionButtonVariantSchema>;

export const actionButtonSizeSchema = z.enum(["sm", "md", "lg"]);

export type ActionButtonSize = z.output<typeof actionButtonSizeSchema>;

/**
 * Schema for a TabEntry (TabContext.tsx).
 */
export const tabEntrySchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
  count: z.number().int().nonnegative().optional(),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
});

export type TabEntry = z.output<typeof tabEntrySchema>;

/**
 * Schema for TabContextValue (TabContext.tsx).
 */
export const tabContextValueSchema = z.object({
  tabs: z.array(tabEntrySchema),
  activeTab: z.string(),
  setActiveTab: z.custom<() => void>().optional(),
});

export type TabContextValue = z.output<typeof tabContextValueSchema>;
