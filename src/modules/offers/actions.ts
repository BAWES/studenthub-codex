"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/**
 * Coerce a boolean-like string/enum value to a real boolean.
 * Handles "true"/"false"/"1"/"0" — mirrors the job/contract action pattern.
 */
const coerceBool = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

export const listOffersSchema = z.object({
  status: coerceBool.optional(),
  companyId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getOfferSchema = z.object({
  offerUuid: z.string().min(1, "Offer UUID is required"),
});

export const createOfferSchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  requestUuid: z.string().min(1, "Request UUID is required"),
  areaUuid: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  positionAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  hoursPerDay: z.number().int().positive().optional(),
  daysPerWeek: z.boolean().optional(),
  compensationType: z.enum(["FIXED_PRICE", "HOURLY", "MONTHLY_SALARY"]).optional(),
  compensationAmount: z.string().optional(),
  compensationDescription: z.string().optional(),
  compensationDescriptionAr: z.string().optional(),
  minAge: z.number().int().positive().optional(),
  maxAge: z.number().int().positive().optional(),
  gender: z.boolean().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListOffersParams = z.input<typeof listOffersSchema>;
export type GetOfferParams = z.input<typeof getOfferSchema>;
export type CreateOfferParams = z.input<typeof createOfferSchema>;

export type OfferListItem = {
  job_uuid: string;
  position: string;
  position_ar: string | null;
  description: string | null;
  hours_per_day: number | null;
  days_per_week: boolean | null;
  status: boolean | null;
  area_uuid: string | null;
  request_uuid: string;
  created_at: Date | null;
  updated_at: Date | null;
};

export type OfferDetail = OfferListItem & {
  description_ar: string | null;
  compensation_type: string | null;
  compensation_amount: string | null;
  compensation_description: string | null;
  compensation_description_ar: string | null;
  min_age: number | null;
  max_age: number | null;
  gender: boolean | null;
  available_from: Date | null;
  available_to: Date | null;
};

export type ListOffersResult = {
  offers: OfferListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listOffers
// ---------------------------------------------------------------------------

/**
 * List job offers with optional filters and pagination.
 *
 * Maps to the `job` table — each job is an offer published by a company.
 * - Filters by status (active/inactive), company (via request relation),
 *   and keyword search on position / description
 * - Excludes soft-deleted offers (deleted_at IS NULL)
 * - Paginated with configurable page/limit
 */
export async function listOffers(
  params: FormData | z.input<typeof listOffersSchema> = {},
): Promise<ListOffersResult> {
  await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          status: params.get("status"),
          companyId: params.get("companyId"),
          search: params.get("search"),
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listOffersSchema.safeParse(raw);
  if (!parsed.success) {
    return { offers: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { status, companyId, search, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: Record<string, unknown> = { deleted_at: null };

  if (status !== undefined) {
    where.status = status;
  }

  if (companyId !== undefined) {
    where.request = { company_id: companyId };
  }

  if (search !== undefined && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { position: { contains: term } },
      { position_ar: { contains: term } },
      { description: { contains: term } },
      { description_ar: { contains: term } },
    ];
  }

  const [offers, total] = await Promise.all([
    prisma.job.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        job_uuid: true,
        position: true,
        position_ar: true,
        description: true,
        hours_per_day: true,
        days_per_week: true,
        status: true,
        area_uuid: true,
        request_uuid: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.job.count({ where: where as any }),
  ]);

  return {
    offers: offers as unknown as OfferListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getOffer
// ---------------------------------------------------------------------------

/**
 * Get a single job offer by UUID.
 *
 * Returns full detail including compensation fields and availability dates.
 * Throws if the offer is not found or has been soft-deleted.
 */
export async function getOffer(
  params: GetOfferParams,
): Promise<OfferDetail> {
  await requireCapability("candidate.read.own");

  const parsed = getOfferSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { offerUuid } = parsed.data;

  const offer = await prisma.job.findUnique({
    where: { job_uuid: offerUuid },
    include: {
      request: {
        select: {
          company_id: true,
          request_position_title: true,
        },
      },
    },
  });

  if (!offer || offer.deleted_at) {
    throw new Error("Offer not found");
  }

  return {
    job_uuid: offer.job_uuid,
    position: offer.position,
    position_ar: offer.position_ar ?? null,
    description: offer.description ?? null,
    description_ar: offer.description_ar ?? null,
    hours_per_day: offer.hours_per_day ?? null,
    days_per_week: offer.days_per_week ?? null,
    compensation_type: offer.compensation_type ?? null,
    compensation_amount: offer.compensation_amount ?? null,
    compensation_description: offer.compensation_description ?? null,
    compensation_description_ar: offer.compensation_description_ar ?? null,
    min_age: offer.min_age ?? null,
    max_age: offer.max_age ?? null,
    gender: offer.gender ?? null,
    status: offer.status,
    area_uuid: offer.area_uuid ?? null,
    request_uuid: offer.request_uuid,
    available_from: offer.available_from ?? null,
    available_to: offer.available_to ?? null,
    created_at: offer.created_at ?? null,
    updated_at: offer.updated_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// createOffer
// ---------------------------------------------------------------------------

/**
 * Create a new job offer.
 *
 * Maps to inserting into the `job` table. Requires a valid request_uuid
 * and story_uuid (both must reference existing records).
 * Returns the created offer detail.
 */
export async function createOffer(
  params: CreateOfferParams,
): Promise<OfferDetail> {
  await requireCapability("request.write");

  const parsed = createOfferSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = parsed.data;

  const offer = await prisma.job.create({
    data: {
      job_uuid: crypto.randomUUID(),
      story_uuid: data.storyUuid,
      request_uuid: data.requestUuid,
      area_uuid: data.areaUuid ?? null,
      position: data.position,
      position_ar: data.positionAr ?? null,
      description: data.description ?? null,
      description_ar: data.descriptionAr ?? null,
      hours_per_day: data.hoursPerDay ?? null,
      days_per_week: data.daysPerWeek ?? null,
      compensation_type: (data.compensationType as any) ?? null,
      compensation_amount: data.compensationAmount ?? null,
      compensation_description: data.compensationDescription ?? null,
      compensation_description_ar: data.compensationDescriptionAr ?? null,
      min_age: data.minAge ?? null,
      max_age: data.maxAge ?? null,
      gender: data.gender ?? null,
      available_from: data.availableFrom ? new Date(data.availableFrom) : null,
      available_to: data.availableTo ? new Date(data.availableTo) : null,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      updated_by: null,
    },
    include: {
      request: {
        select: {
          company_id: true,
          request_position_title: true,
        },
      },
    },
  });

  return {
    job_uuid: offer.job_uuid,
    position: offer.position,
    position_ar: offer.position_ar ?? null,
    description: offer.description ?? null,
    description_ar: offer.description_ar ?? null,
    hours_per_day: offer.hours_per_day ?? null,
    days_per_week: offer.days_per_week ?? null,
    compensation_type: offer.compensation_type ?? null,
    compensation_amount: offer.compensation_amount ?? null,
    compensation_description: offer.compensation_description ?? null,
    compensation_description_ar: offer.compensation_description_ar ?? null,
    min_age: offer.min_age ?? null,
    max_age: offer.max_age ?? null,
    gender: offer.gender ?? null,
    status: offer.status,
    area_uuid: offer.area_uuid ?? null,
    request_uuid: offer.request_uuid,
    available_from: offer.available_from ?? null,
    available_to: offer.available_to ?? null,
    created_at: offer.created_at ?? null,
    updated_at: offer.updated_at ?? null,
  };
}
