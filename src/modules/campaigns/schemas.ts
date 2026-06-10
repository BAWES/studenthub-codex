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
export type CampaignListItem = {
  utm_uuid: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  no_of_signups: number | null;
  no_of_clicks: number | null;
  created_at: Date | null;
};
export type ListCampaignsResult = {
  campaigns: CampaignListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
