"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  createDiscountSchema,
  listDiscountsSchema,
  listDiscountsByApplicantSchema,
  createDiscountResultSchema,
  listDiscountsResultSchema,
  type CreateDiscountInput,
  type ListDiscountsInput,
  type ListDiscountsByApplicantInput,
  type DiscountListItem,
  type ListDiscountsResult,
  type CreateDiscountResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List discounts with optional company_id / category_id filters and pagination.
 * Filters out expired discounts (valid_until < now or NULL = never expires).
 */
export async function listDiscounts(
  params: ListDiscountsInput = {},
): Promise<ListDiscountsResult> {
  await requireCapability("discount.read");

  const parsed = listDiscountsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, category_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {
    OR: [{ valid_until: { gte: new Date() } }, { valid_until: null }],
  };

  if (company_id !== undefined) {
    where.company_id = company_id;
  }
  if (category_id !== undefined) {
    where.category_id = category_id;
  }

  const [discounts, total] = await Promise.all([
    prisma.discount.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.discount.count({ where: where as any }),
  ]);

  const result = {
    discounts: discounts as DiscountListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const validated = listDiscountsResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[modules/discounts] listDiscounts output validation failed:",
      validated.error,
    );
  }

  return result;
}

/**
 * Create a new discount record.
 */
export async function createDiscount(
  data: CreateDiscountInput,
): Promise<CreateDiscountResult> {
  await requireCapability("discount.write");

  const parsed = createDiscountSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid discount data");
  }

  const discountUuid = `discount_${crypto.randomUUID()}`;

  await prisma.discount.create({
    data: {
      discount_uuid: discountUuid,
      category_id: parsed.data.category_id,
      company_id: parsed.data.company_id,
      store_id: parsed.data.store_id ?? null,
      description_en: parsed.data.description_en,
      description_ar: parsed.data.description_ar,
      how_to_apply_en: parsed.data.how_to_apply_en ?? null,
      how_to_apply_ar: parsed.data.how_to_apply_ar ?? null,
      valid_until: parsed.data.valid_until ? new Date(parsed.data.valid_until) : null,
    },
  });

  revalidatePath("/discounts");

  const result: CreateDiscountResult = { discount_uuid: discountUuid };

  const validated = createDiscountResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[modules/discounts] createDiscount output validation failed:",
      validated.error,
    );
  }

  return result;
}

/**
 * List discounts available to a specific applicant (candidate).
 * Resolves the candidate's store -> company chain to find relevant discounts.
 * Returns empty result if the candidate or their store/company cannot be found.
 */
export async function listDiscountsByApplicant(
  params: ListDiscountsByApplicantInput,
): Promise<ListDiscountsResult> {
  await requireCapability("discount.read");

  const parsed = listDiscountsByApplicantSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { applicant_id, page = 1, limit = 20 } = parsed.data;

  // Resolve candidate -> store -> company to find applicable discounts
  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: applicant_id },
    select: { store_id: true },
  });

  if (!candidate || !candidate.store_id) {
    const result: ListDiscountsResult = { discounts: [], total: 0, page, limit, totalPages: 0 };

    const validated = listDiscountsResultSchema.safeParse(result);
    if (!validated.success) {
      console.error(
        "[modules/discounts] listDiscountsByApplicant output validation failed:",
        validated.error,
      );
    }

    return result;
  }

  const store = await prisma.store.findUnique({
    where: { store_id: candidate.store_id },
    select: { company_id: true },
  });

  if (!store || !store.company_id) {
    const result: ListDiscountsResult = { discounts: [], total: 0, page, limit, totalPages: 0 };

    const validated = listDiscountsResultSchema.safeParse(result);
    if (!validated.success) {
      console.error(
        "[modules/discounts] listDiscountsByApplicant output validation failed:",
        validated.error,
      );
    }

    return result;
  }

  const where: Record<string, unknown> = {
    company_id: store.company_id,
    OR: [{ valid_until: { gte: new Date() } }, { valid_until: null }],
  };

  const [discounts, total] = await Promise.all([
    prisma.discount.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.discount.count({ where: where as any }),
  ]);

  const result: ListDiscountsResult = {
    discounts: discounts as DiscountListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const validated = listDiscountsResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[modules/discounts] listDiscountsByApplicant output validation failed:",
      validated.error,
    );
  }

  return result;
}
