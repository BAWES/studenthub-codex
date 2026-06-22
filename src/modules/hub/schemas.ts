import { z } from "zod";

// ---------------------------------------------------------------------------
// Hub — output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a hub navigation item.
 */
export const hubNavigationItemSchema = z.object({
  label: z.string(),
  description: z.string(),
  href: z.string(),
});

export type HubNavigationItem = z.output<typeof hubNavigationItemSchema>;

/**
 * Schema for a hub scope filter item.
 */
export const hubScopeItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export type HubScopeItem = z.output<typeof hubScopeItemSchema>;

/**
 * Schema for a hub queue metric item.
 */
export const hubQueueSchema = z.object({
  label: z.string(),
  value: z.number(),
  note: z.string(),
  href: z.string().optional(),
  tone: z.string(),
});

export type HubQueue = z.output<typeof hubQueueSchema>;

/**
 * Schema for a hub search result item.
 */
export const hubResultSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string(),
  href: z.string().optional(),
});

export type HubResult = z.output<typeof hubResultSchema>;

/**
 * Schema for a hub preview action button.
 */
export const hubPreviewActionSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export type HubPreviewAction = z.output<typeof hubPreviewActionSchema>;

/**
 * Schema for a hub preview fact row.
 */
export const hubPreviewFactSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});

export type HubPreviewFact = z.output<typeof hubPreviewFactSchema>;

/**
 * Schema for a hub preview related row.
 */
export const hubPreviewRelatedRowSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string(),
  href: z.string().optional(),
});

export type HubPreviewRelatedRow = z.output<typeof hubPreviewRelatedRowSchema>;

/**
 * Schema for a hub preview related section.
 */
export const hubPreviewRelatedSchema = z.object({
  title: z.string(),
  rows: z.array(hubPreviewRelatedRowSchema),
});

export type HubPreviewRelated = z.output<typeof hubPreviewRelatedSchema>;

/**
 * Schema for a full hub preview panel.
 */
export const hubPreviewSchema = z.object({
  title: z.string(),
  description: z.string(),
  actions: z.array(hubPreviewActionSchema),
  facts: z.array(hubPreviewFactSchema),
  related: z.array(hubPreviewRelatedSchema),
});

export type HubPreview = z.output<typeof hubPreviewSchema>;

/**
 * Schema for a hub command palette item.
 */
export const hubCommandSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  section: z.string(),
  href: z.string(),
  shortcut: z.string().optional(),
});

export type HubCommand = z.output<typeof hubCommandSchema>;

/**
 * Schema for the full hub workspace data response.
 */
export const hubWorkspaceDataSchema = z.object({
  welcome: z.string(),
  queues: z.array(hubQueueSchema),
  scopes: z.array(hubScopeItemSchema),
  navigation: z.array(hubNavigationItemSchema),
  results: z.array(hubResultSchema).optional(),
  preview: hubPreviewSchema.optional(),
  commands: z.array(hubCommandSchema).optional(),
});

export type HubWorkspaceData = z.output<typeof hubWorkspaceDataSchema>;
