"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const createDiscountSchema = z.object({
  category_id: z.number().int("Category ID must be an integer").positive(),
  company_id: z.number().int("Company ID must be an integer").positive(),
  store_id: z.number().int().positive().optional(),
  description_en: z
    .string({ required_error: "English description is required" })
    .min(1, "English description is required")
    .max(65535),
  description_ar: z
    .string({ required_error: "Arabic description is required" })
    .min(1, "Arabic description is required")
    .max(65535),
  how_to_apply_en: z.string().max(255).optional(),
  how_to_apply_ar: z.string().max(255).optional(),
  valid_until: z.string().datetime().optional(),
});

export const listDiscountsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  category_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type ListDiscountsInput = z.infer<typeof listDiscountsSchema>;

export type DiscountListItem = {
  discount_uuid: string;
  category_id: number;
  company_id: number;
  store_id: number | null;
  description_en: string;
  description_ar: string;
  how_to_apply_en: string | null;
  how_to_apply_ar: string | null;
  image: string | null;
  valid_until: Date | null;
  created_at: Date | null;
};

export type ListDiscountsResult = {
  discounts: DiscountListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

  return {
    discounts: discounts as DiscountListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Create a new discount record.
 */
export async function createDiscount(
  data: CreateDiscountInput,
): Promise<{ discount_uuid: string }> {
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
  return { discount_uuid: discountUuid };
}
