"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listFulltimersSchema,
  getFulltimerSchema,
  createFulltimerSchema,
  updateFulltimerSchema,
  deleteFulltimerSchema,
  listFulltimersResultSchema,
  fulltimerDetailOrNullSchema,
  type FulltimerListItem,
  type FulltimerDetail,
  type ListFulltimersResult,
  type ListFulltimersInput,
  type CreateFulltimerInput,
  type UpdateFulltimerInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapListItem(raw: any): FulltimerListItem {
  return {
    fulltimer_uuid: raw.fulltimer_uuid,
    fulltimer_name: raw.fulltimer_name,
    fulltimer_email: raw.fulltimer_email,
    fulltimer_phone: raw.fulltimer_phone ?? null,
    fulltimer_employed: raw.fulltimer_employed ?? null,
    nationality_id: raw.nationality_id ?? null,
    country_id: raw.country_id ?? null,
    university_id: raw.university_id ?? null,
    fulltimer_created_datetime: raw.fulltimer_created_datetime?.toISOString() ?? null,
  };
}

function mapDetail(raw: any): FulltimerDetail {
  return {
    fulltimer_uuid: raw.fulltimer_uuid,
    fulltimer_name: raw.fulltimer_name,
    fulltimer_email: raw.fulltimer_email,
    fulltimer_phone: raw.fulltimer_phone ?? null,
    fulltimer_employed: raw.fulltimer_employed ?? null,
    fulltimer_gender: raw.fulltimer_gender ?? null,
    fulltimer_birth_date: raw.fulltimer_birth_date?.toISOString() ?? null,
    fulltimer_driving_license: raw.fulltimer_driving_license ?? null,
    nationality_id: raw.nationality_id ?? null,
    country_id: raw.country_id ?? null,
    university_id: raw.university_id ?? null,
    fulltimer_area_uuid: raw.fulltimer_area_uuid ?? null,
    fulltimer_current_salary: raw.fulltimer_current_salary ?? null,
    fulltimer_expected_salary: raw.fulltimer_expected_salary ?? null,
    fulltimer_pdf_cv: raw.fulltimer_pdf_cv ?? null,
    currency_code: raw.currency_code ?? null,
    fulltimer_created_datetime: raw.fulltimer_created_datetime?.toISOString() ?? null,
    fulltimer_updated_datetime: raw.fulltimer_updated_datetime?.toISOString() ?? null,
  };
}

function buildWhereFilters(params: {
  search?: string;
  nationalityId?: number;
  employed?: "true" | "false";
}) {
  const where: Record<string, any> = {};

  if (params.search) {
    where.OR = [
      { fulltimer_name: { contains: params.search } },
      { fulltimer_email: { contains: params.search } },
      { fulltimer_phone: { contains: params.search } },
    ];
  }
  if (params.nationalityId !== undefined) {
    where.nationality_id = params.nationalityId;
  }
  if (params.employed !== undefined) {
    where.fulltimer_employed = params.employed === "true";
  }

  return where;
}

// ---------------------------------------------------------------------------
// listFulltimers
// ---------------------------------------------------------------------------

/**
 * List fulltimers with pagination and optional filters.
 * Mirrors legacy Yii2 FulltimerController::actionIndex().
 */
export async function listFulltimers(
  params: FormData | ListFulltimersInput = {},
): Promise<ListFulltimersResult> {
  await requireCapability("fulltimer.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
          nationalityId: params.get("nationalityId"),
          employed: params.get("employed"),
        }
      : params;

  const parsed = listFulltimersSchema.safeParse(raw);
  if (!parsed.success) {
    return { fulltimers: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search, nationalityId, employed } = parsed.data;
  const skip = (page - 1) * limit;
  const where = buildWhereFilters({ search, nationalityId, employed });

  const [fulltimers, total] = await Promise.all([
    prisma.fulltimer.findMany({
      where,
      orderBy: { fulltimer_created_datetime: "desc" },
      skip,
      take: limit,
    }),
    prisma.fulltimer.count({ where }),
  ]);

  const result = {
    fulltimers: fulltimers.map(mapListItem),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
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
 * Get a single fulltimer by UUID with full detail.
 * Returns null if not found.
 */
export async function getFulltimer(
  fulltimerUuid: string,
): Promise<FulltimerDetail | null> {
  await requireCapability("fulltimer.read");

  const parsed = getFulltimerSchema.safeParse({ fulltimerUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid fulltimer UUID");
  }

  const fulltimer = await prisma.fulltimer.findFirst({
    where: { fulltimer_uuid: parsed.data.fulltimerUuid },
  });

  if (!fulltimer) return null;

  const result = mapDetail(fulltimer);

  // Validate output shape
  const outputParsed = fulltimerDetailOrNullSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/fulltimers] getFulltimer output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createFulltimer
// ---------------------------------------------------------------------------

/**
 * Create a new fulltimer record.
 * Generates a UUID prefixed with "ft_".
 * Mirrors legacy Yii2 FulltimerController::actionCreate().
 */
export async function createFulltimer(
  data: CreateFulltimerInput,
): Promise<{ fulltimer_uuid: string }> {
  await requireCapability("fulltimer.write");

  const parsed = createFulltimerSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid fulltimer data");
  }

  const {
    name, email, phone, nationalityId, countryId, universityId,
    employed, gender, birthDate, drivingLicense,
    currentSalary, expectedSalary, currencyCode,
  } = parsed.data;

  const now = new Date();

  const fulltimer = await prisma.fulltimer.create({
    data: {
      fulltimer_uuid: `ft_${crypto.randomUUID()}`,
      fulltimer_name: name,
      fulltimer_email: email,
      fulltimer_phone: phone ?? null,
      nationality_id: nationalityId ?? null,
      country_id: countryId ?? null,
      university_id: universityId ?? null,
      fulltimer_employed: employed ?? null,
      fulltimer_gender: gender ?? null,
      fulltimer_birth_date: birthDate ? new Date(birthDate) : null,
      fulltimer_driving_license: drivingLicense ?? null,
      fulltimer_current_salary: currentSalary ?? null,
      fulltimer_expected_salary: expectedSalary ?? null,
      currency_code: currencyCode ?? "KWD",
      fulltimer_created_datetime: now,
      fulltimer_updated_datetime: now,
    } as any,
  });

  return { fulltimer_uuid: fulltimer.fulltimer_uuid };
}

// ---------------------------------------------------------------------------
// updateFulltimer
// ---------------------------------------------------------------------------

/**
 * Update an existing fulltimer record.
 * Only provided fields are updated.
 */
export async function updateFulltimer(
  data: UpdateFulltimerInput,
): Promise<{ fulltimer_uuid: string }> {
  await requireCapability("fulltimer.write");

  const parsed = updateFulltimerSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid update data");
  }

  const {
    fulltimerUuid, name, phone, nationalityId, countryId, universityId,
    employed, gender, birthDate, drivingLicense,
    currentSalary, expectedSalary, currencyCode,
  } = parsed.data;

  const updateData: Record<string, any> = { fulltimer_updated_datetime: new Date() };

  if (name !== undefined) updateData.fulltimer_name = name;
  if (phone !== undefined) updateData.fulltimer_phone = phone;
  if (nationalityId !== undefined) updateData.nationality_id = nationalityId;
  if (countryId !== undefined) updateData.country_id = countryId;
  if (universityId !== undefined) updateData.university_id = universityId;
  if (employed !== undefined) updateData.fulltimer_employed = employed;
  if (gender !== undefined) updateData.fulltimer_gender = gender;
  if (birthDate !== undefined) updateData.fulltimer_birth_date = new Date(birthDate);
  if (drivingLicense !== undefined) updateData.fulltimer_driving_license = drivingLicense;
  if (currentSalary !== undefined) updateData.fulltimer_current_salary = currentSalary;
  if (expectedSalary !== undefined) updateData.fulltimer_expected_salary = expectedSalary;
  if (currencyCode !== undefined) updateData.currency_code = currencyCode;

  const fulltimer = await prisma.fulltimer.update({
    where: { fulltimer_uuid: fulltimerUuid },
    data: updateData as any,
  });

  return { fulltimer_uuid: fulltimer.fulltimer_uuid };
}

// ---------------------------------------------------------------------------
// deleteFulltimer
// ---------------------------------------------------------------------------

/**
 * Delete a fulltimer record by UUID.
 * Performs hard delete (no soft delete column on fulltimer).
 */
export async function deleteFulltimer(
  data: z.input<typeof deleteFulltimerSchema>,
): Promise<{ deleted: boolean }> {
  await requireCapability("fulltimer.write");

  const parsed = deleteFulltimerSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid fulltimer UUID");
  }

  await prisma.fulltimer.delete({
    where: { fulltimer_uuid: parsed.data.fulltimerUuid },
  });

  return { deleted: true };
}
