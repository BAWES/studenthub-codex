"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listHolidaysSchema,
  getHolidaySchema,
  createHolidaySchema,
  deleteHolidaySchema,
  holidayItemSchema,
  listHolidaysResultSchema,
  deleteHolidayResultSchema,
  type ListHolidaysParams,
  type GetHolidayParams,
  type CreateHolidayParams,
  type DeleteHolidayParams,
  type HolidayItem,
  type ListHolidaysResult,
  type DeleteHolidayResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listHolidays
// ---------------------------------------------------------------------------

/**
 * List holidays with pagination and optional year filter.
 *
 * Provides a managed list of public/company holidays used across the
 * StudentHub platform for calendar visibility and leave planning.
 * - Filters by year when year parameter is provided
 * - Excludes soft-deleted holidays
 * - Paginated with configurable page/limit
 * - Sorted by date ascending
 */
export async function listHolidays(
  params: ListHolidaysParams = {},
): Promise<ListHolidaysResult> {
  await requireCapability("holiday.read");

  const parsed = listHolidaysSchema.safeParse(params);
  if (!parsed.success) {
    return { holidays: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, year } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { is_deleted: false };

  if (year !== undefined) {
    where.date = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    };
  }

  const [holidays, total] = await Promise.all([
    prisma.holiday.findMany({
      where: where as any,
      orderBy: { date: "asc" },
      skip,
      take: limit,
    }),
    prisma.holiday.count({ where: where as any }),
  ]);

  const result = {
    holidays: holidays.map((h) => ({
      holiday_uuid: h.holiday_uuid,
      name: h.name,
      date: h.date.toISOString(),
      is_recurring: h.is_recurring,
      description: h.description ?? null,
      is_deleted: h.is_deleted,
      created_at: h.created_at?.toISOString() ?? null,
      updated_at: h.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listHolidaysResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/holidays] listHolidays output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getHoliday
// ---------------------------------------------------------------------------

/**
 * Get a single holiday by UUID.
 * Returns null if not found or soft-deleted.
 */
export async function getHoliday(
  params: GetHolidayParams,
): Promise<HolidayItem | null> {
  await requireCapability("holiday.read");

  const parsed = getHolidaySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid holiday UUID");
  }

  const { uuid } = parsed.data;

  const holiday = await prisma.holiday.findFirst({
    where: { holiday_uuid: uuid, is_deleted: false },
  });

  if (!holiday) return null;

  const result = {
    holiday_uuid: holiday.holiday_uuid,
    name: holiday.name,
    date: holiday.date.toISOString(),
    is_recurring: holiday.is_recurring,
    description: holiday.description ?? null,
    is_deleted: holiday.is_deleted,
    created_at: holiday.created_at?.toISOString() ?? null,
    updated_at: holiday.updated_at?.toISOString() ?? null,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = holidayItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/holidays] getHoliday output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createHoliday
// ---------------------------------------------------------------------------

/**
 * Create a new holiday entry (admin only).
 *
 * Generates a UUID for the holiday and sets timestamps.
 * Requires the "holiday.write" capability.
 */
export async function createHoliday(
  params: CreateHolidayParams,
): Promise<HolidayItem> {
  await requireCapability("holiday.write");

  const parsed = createHolidaySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { name, date, isRecurring, description } = parsed.data;
  const now = new Date();

  const holiday = await prisma.holiday.create({
    data: {
      holiday_uuid: crypto.randomUUID(),
      name,
      date: new Date(date),
      is_recurring: isRecurring,
      description: description ?? null,
      is_deleted: false,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/staff/holidays");
  revalidatePath("/admin/holidays");

  const result = {
    holiday_uuid: holiday.holiday_uuid,
    name: holiday.name,
    date: holiday.date.toISOString(),
    is_recurring: holiday.is_recurring,
    description: holiday.description ?? null,
    is_deleted: holiday.is_deleted,
    created_at: holiday.created_at?.toISOString() ?? null,
    updated_at: holiday.updated_at?.toISOString() ?? null,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = holidayItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/holidays] createHoliday output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteHoliday (soft delete)
// ---------------------------------------------------------------------------

/**
 * Soft-delete a holiday entry (admin only).
 *
 * Sets is_deleted = true instead of removing the record.
 * Requires the "holiday.write" capability.
 */
export async function deleteHoliday(
  params: DeleteHolidayParams,
): Promise<DeleteHolidayResult> {
  await requireCapability("holiday.write");

  const parsed = deleteHolidaySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { uuid } = parsed.data;

  const existing = await prisma.holiday.findUnique({
    where: { holiday_uuid: uuid },
  });

  if (!existing || existing.is_deleted) {
    throw new Error("Holiday not found");
  }

  await prisma.holiday.update({
    where: { holiday_uuid: uuid },
    data: { is_deleted: true, updated_at: new Date() },
  });

  revalidatePath("/staff/holidays");
  revalidatePath("/admin/holidays");

  return { success: true };
}
