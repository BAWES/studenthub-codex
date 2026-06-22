"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCampaignsSchema,
  campaignListItemSchema,
  listCampaignsResultSchema,
  type ListCampaignsParams,
  type CampaignListItem,
  type ListCampaignsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * List UTM campaigns with pagination and optional filters.
 * Mirrors the legacy CampaignController::actionList().
 */
export async function listCampaigns(
  params: ListCampaignsParams = {},
): Promise<ListCampaignsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listCampaignsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, utmSource, utmMedium, utmCampaign } = parsed.data;

  // Build where clause from optional filters
  const where: Record<string, unknown> = {};
  if (utmSource) where.utm_source = { contains: utmSource };
  if (utmMedium) where.utm_medium = { contains: utmMedium };
  if (utmCampaign) where.utm_campaign = { contains: utmCampaign };

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        utm_uuid: true,
        utm_source: true,
        utm_medium: true,
        utm_campaign: true,
        utm_content: true,
        utm_term: true,
        no_of_signups: true,
        no_of_clicks: true,
        created_at: true,
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  const result: ListCampaignsResult = {
    campaigns: campaigns as CampaignListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listCampaignsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/campaigns] listCampaigns output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
