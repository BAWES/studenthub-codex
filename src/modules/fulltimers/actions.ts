"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listFulltimersSchema,
  getFulltimerSchema,
  listFulltimersResultSchema,
  fulltimerListItemSchema,
  type FulltimerListItem,
  type ListFulltimersResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listFulltimers
// ---------------------------------------------------------------------------

/**
 * List fulltimer candidate records with pagination and optional search.
 */
export async function listFulltimers(
  params: FormData | z.input<typeof listFulltimersSchema> = {},
): Promise<ListFulltimersResult> {
  await requireCapability("admin.system");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
        }
      : params;

  const parsed = listFulltimersSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search && search.trim()) {
    where.OR = [
      { fulltimer_name: { contains: search, mode: "insensitive" } },
      { fulltimer_email: { contains: search, mode: "insensitive" } },
      { fulltimer_phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.fulltimer.findMany({
      where: where as any,
      orderBy: { fulltimer_created_datetime: "desc" },
      skip,
      take: limit,
      include: {
        country_fulltimer_country_idTocountry: {
          select: { country_name_en: true },
        },
        country_fulltimer_nationality_idTocountry: {
          select: { country_name_en: true },
        },
        university: {
          select: { university_name_en: true },
        },
      },
    }),
    prisma.fulltimer.count({ where: where as any }),
  ]);

  const result: ListFulltimersResult = {
    records: records.map((r): FulltimerListItem => ({
      fulltimer_uuid: r.fulltimer_uuid,
      fulltimer_name: r.fulltimer_name,
      fulltimer_email: r.fulltimer_email,
      fulltimer_phone: r.fulltimer_phone ?? null,
      fulltimer_employed: r.fulltimer_employed ?? null,
      fulltimer_current_salary: r.fulltimer_current_salary ?? null,
      fulltimer_expected_salary: r.fulltimer_expected_salary ?? null,
      fulltimer_created_datetime: r.fulltimer_created_datetime.toISOString(),
      country_name: r.country_fulltimer_country_idTocountry?.country_name_en ?? null,
      nationality_name: r.country_fulltimer_nationality_idTocountry?.country_name_en ?? null,
      university_name: r.university?.university_name_en ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listFulltimersResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/fulltimers] listFulltimers output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getFulltimer
// ---------------------------------------------------------------------------

/**
 * Get a single fulltimer record by UUID.
 * Returns null if not found.
 */
export async function getFulltimer(
  fulltimerUuid: string,
): Promise<FulltimerListItem | null> {
  await requireCapability("admin.system");

  const parsed = getFulltimerSchema.safeParse({ fulltimerUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid fulltimer UUID");
  }

  const record = await prisma.fulltimer.findFirst({
    where: { fulltimer_uuid: parsed.data.fulltimerUuid },
    include: {
      country_fulltimer_country_idTocountry: {
        select: { country_name_en: true },
      },
      country_fulltimer_nationality_idTocountry: {
        select: { country_name_en: true },
      },
      university: {
        select: { university_name_en: true },
      },
    },
  });

  if (!record) return null;

  const result: FulltimerListItem = {
    fulltimer_uuid: record.fulltimer_uuid,
    fulltimer_name: record.fulltimer_name,
    fulltimer_email: record.fulltimer_email,
    fulltimer_phone: record.fulltimer_phone ?? null,
    fulltimer_employed: record.fulltimer_employed ?? null,
    fulltimer_current_salary: record.fulltimer_current_salary ?? null,
    fulltimer_expected_salary: record.fulltimer_expected_salary ?? null,
    fulltimer_created_datetime: record.fulltimer_created_datetime.toISOString(),
    country_name: record.country_fulltimer_country_idTocountry?.country_name_en ?? null,
    nationality_name: record.country_fulltimer_nationality_idTocountry?.country_name_en ?? null,
    university_name: record.university?.university_name_en ?? null,
  };

  const outputParsed = fulltimerListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/fulltimers] getFulltimer output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
