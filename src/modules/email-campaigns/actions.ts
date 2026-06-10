"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listEmailCampaignsSchema,
  getEmailCampaignSchema,
  createEmailCampaignSchema,
  updateEmailCampaignSchema,
  type ListEmailCampaignsParams,
  type GetEmailCampaignParams,
  type CreateEmailCampaignParams,
  type UpdateEmailCampaignParams,
  type EmailCampaignListItem,
  type ListEmailCampaignsResult,
  type CreateUpdateResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List email campaigns with pagination and optional filters.
 * Mirrors the legacy EmailCampaignController::actionList().
 */
export async function listEmailCampaigns(
  params: ListEmailCampaignsParams = {},
): Promise<ListEmailCampaignsResult> {
  await requireCapability("admin.read");

  const parsed = listEmailCampaignsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, subject, target, status } = parsed.data;

  const where: Record<string, unknown> = {};
  if (subject) where.subject = { contains: subject };
  if (target) where.target = target;
  if (status !== undefined) where.status = status;

  const [campaigns, total] = await Promise.all([
    prisma.email_campaign.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        campaign_uuid: true,
        subject: true,
        message: true,
        progress: true,
        target: true,
        status: true,
        created_at: true,
      },
    }),
    prisma.email_campaign.count({ where }),
  ]);

  return {
    campaigns: campaigns as EmailCampaignListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single email campaign by UUID.
 * Mirrors the legacy EmailCampaignController::actionView().
 */
export async function getEmailCampaign(
  params: GetEmailCampaignParams,
): Promise<EmailCampaignListItem | null> {
  await requireCapability("admin.read");

  const parsed = getEmailCampaignSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign UUID");
  }

  const { campaignUuid } = parsed.data;

  const campaign = await prisma.email_campaign.findUnique({
    where: { campaign_uuid: campaignUuid },
    select: {
      campaign_uuid: true,
      subject: true,
      message: true,
      progress: true,
      target: true,
      status: true,
      created_at: true,
    },
  });

  return campaign as EmailCampaignListItem | null;
}

/**
 * Create a new email campaign.
 *
 * Mirrors the legacy EmailCampaignController::actionCreate().
 * Also creates child email_campaign_filter records if provided (not
 * implemented here — simplest create first).
 */
export async function createEmailCampaign(
  params: CreateEmailCampaignParams,
): Promise<CreateUpdateResult> {
  await requireCapability("admin.write");

  const parsed = createEmailCampaignSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid campaign data",
    };
  }

  const { subject, message, target, isRecurring, triggerPeriod, triggerDateTime } =
    parsed.data;

  try {
    await prisma.email_campaign.create({
      data: {
        campaign_uuid: crypto.randomUUID(),
        subject: subject ?? null,
        message: message ?? null,
        target: target ?? "both",
        is_recurring: isRecurring ?? false,
        trigger_period: triggerPeriod ?? null,
        trigger_date_time: triggerDateTime ? new Date(triggerDateTime) : null,
      },
    });

    return {
      operation: "success",
      message: "Email campaign created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create email campaign",
    };
  }
}

/**
 * Update an existing email campaign.
 *
 * Mirrors the legacy EmailCampaignController::actionUpdate().
 * Only updates fields that are provided (partial update).
 */
export async function updateEmailCampaign(
  params: UpdateEmailCampaignParams,
): Promise<CreateUpdateResult> {
  await requireCapability("admin.write");

  const parsed = updateEmailCampaignSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid campaign data",
    };
  }

  const {
    campaignUuid,
    subject,
    message,
    target,
    isRecurring,
    triggerPeriod,
    triggerDateTime,
    status,
  } = parsed.data;

  // Build the update payload — only set fields that were provided
  const data: Record<string, unknown> = {};
  if (subject !== undefined) data.subject = subject;
  if (message !== undefined) data.message = message;
  if (target !== undefined) data.target = target;
  if (isRecurring !== undefined) data.is_recurring = isRecurring;
  if (triggerPeriod !== undefined) data.trigger_period = triggerPeriod;
  if (triggerDateTime !== undefined) data.trigger_date_time = new Date(triggerDateTime);
  if (status !== undefined) data.status = status;

  try {
    await prisma.email_campaign.update({
      where: { campaign_uuid: campaignUuid },
      data,
    });

    return {
      operation: "success",
      message: "Email campaign updated successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to update email campaign",
    };
  }
}
