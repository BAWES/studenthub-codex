import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/email-campaigns actions
// ---------------------------------------------------------------------------

export const listEmailCampaignsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  subject: z.string().optional(),
  target: z.string().optional(),
  status: z.boolean().optional(),
});
export const getEmailCampaignSchema = z.object({
  campaignUuid: z.string().min(1, "Campaign UUID is required"),
});
export const createEmailCampaignSchema = z.object({
  subject: z.string().optional(),
  message: z.string().optional(),
  target: z.string().optional(),
  isRecurring: z.boolean().optional(),
  triggerPeriod: z.number().int().positive().optional(),
  triggerDateTime: z.string().datetime().optional(),
});
export const updateEmailCampaignSchema = z.object({
  campaignUuid: z.string().min(1, "Campaign UUID is required"),
  subject: z.string().optional(),
  message: z.string().optional(),
  target: z.string().optional(),
  isRecurring: z.boolean().optional(),
  triggerPeriod: z.number().int().positive().optional(),
  triggerDateTime: z.string().datetime().optional(),
  status: z.boolean().optional(),
});
export type ListEmailCampaignsParams = z.input<typeof listEmailCampaignsSchema>;
export type GetEmailCampaignParams = z.input<typeof getEmailCampaignSchema>;
export type CreateEmailCampaignParams = z.input<typeof createEmailCampaignSchema>;
export type UpdateEmailCampaignParams = z.input<typeof updateEmailCampaignSchema>;
export type EmailCampaignListItem = {
  campaign_uuid: string;
  subject: string | null;
  message: string | null;
  progress: number | null;
  target: string | null;
  status: boolean | null;
  created_at: Date | null;
};
export type ListEmailCampaignsResult = {
  campaigns: EmailCampaignListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type CreateUpdateResult = {
  operation: string;
  message: string;
};
