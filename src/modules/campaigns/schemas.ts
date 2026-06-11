import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/campaigns actions
// ---------------------------------------------------------------------------

export const listCampaignsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});
export type ListCampaignsParams = z.input<typeof listCampaignsSchema>;

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const campaignListItemSchema = z.object({
  utm_uuid: z.string(),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  utm_content: z.string().nullable(),
  utm_term: z.string().nullable(),
  no_of_signups: z.number().nullable(),
  no_of_clicks: z.number().nullable(),
  created_at: z.date().nullable(),
});
export type CampaignListItem = z.output<typeof campaignListItemSchema>;

export const listCampaignsResultSchema = z.object({
  campaigns: z.array(campaignListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});
export type ListCampaignsResult = z.output<typeof listCampaignsResultSchema>;
