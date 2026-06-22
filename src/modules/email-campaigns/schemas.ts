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

export const deleteEmailCampaignSchema = z.object({
  campaignUuid: z.string().min(1, "Campaign UUID is required"),
});

export type ListEmailCampaignsParams = z.input<typeof listEmailCampaignsSchema>;
export type GetEmailCampaignParams = z.input<typeof getEmailCampaignSchema>;
export type CreateEmailCampaignParams = z.input<typeof createEmailCampaignSchema>;
export type UpdateEmailCampaignParams = z.input<typeof updateEmailCampaignSchema>;
export type DeleteEmailCampaignParams = z.input<typeof deleteEmailCampaignSchema>;
// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const emailCampaignListItemSchema = z.object({
  campaign_uuid: z.string(),
  subject: z.string().nullable(),
  message: z.string().nullable(),
  progress: z.number().nullable(),
  target: z.string().nullable(),
  status: z.boolean().nullable(),
  created_at: z.date().nullable(),
});

export const listEmailCampaignsResultSchema = z.object({
  campaigns: z.array(emailCampaignListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const createUpdateResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export type EmailCampaignListItem = z.output<typeof emailCampaignListItemSchema>;
export type ListEmailCampaignsResult = z.output<typeof listEmailCampaignsResultSchema>;
export type CreateUpdateResult = z.output<typeof createUpdateResultSchema>;
