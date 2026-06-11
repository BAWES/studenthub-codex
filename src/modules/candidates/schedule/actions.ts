"use server";

// ---------------------------------------------------------------------------
// Module-level actions for candidate schedule (working dates)
// ---------------------------------------------------------------------------
// Contains the real Prisma logic for listing, viewing, and updating the
// candidate's working dates. App router actions delegate to this.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  listScheduleSchema,
  getScheduleItemSchema,
  getScheduleDetailSchema,
  updateScheduleStatusSchema,
} from "./schemas";
import type {
  ListScheduleInput,
  ScheduleItem,
  ScheduleDetail,
  ScheduleStatusResult,
  UpdateScheduleStatusInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List working dates for a candidate (paginated, with optional date filter).
 * Mirrors the legacy Yii2 CandidateScheduleController::actionList().
 */
export async function listSchedule(
  candidateId: number,
  input: ListScheduleInput = {},
): Promise<ScheduleItem[]> {
  const parsed = listScheduleSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule list params");
  }

  const { page, limit, dateFrom, dateTo } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    candidate_id: candidateId,
  };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
  }

  const rows = await prisma.candidate_working_date.findMany({
    where: where as any,
    orderBy: { date: "desc" },
    skip,
    take: limit,
    select: {
      cwd_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      store: {
        select: { store_name: true, company: { select: { company_name: true } } },
      },
    },
  });

  return rows.map((row) => ({
    cwd_uuid: row.cwd_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    store_name: row.store?.store_name ?? null,
    company_name: row.store?.company?.company_name ?? null,
  }));
}

/**
 * Get a single working date by UUID for the given candidate.
 * Mirrors the legacy Yii2 CandidateScheduleController::actionView().
 */
export async function getScheduleItem(
  candidateId: number,
  cwd_uuid: string,
): Promise<ScheduleItem | null> {
  const parsed = getScheduleItemSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule item params");
  }

  const row = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: candidateId,
    },
    select: {
      cwd_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      store: {
        select: { store_name: true, company: { select: { company_name: true } } },
      },
    },
  });

  if (!row) return null;

  return {
    cwd_uuid: row.cwd_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    store_name: row.store?.store_name ?? null,
    company_name: row.store?.company?.company_name ?? null,
  };
}

/**
 * Get a single working date detail with full store/company nesting.
 */
export async function getScheduleDetail(
  candidateId: number,
  cwd_uuid: string,
): Promise<ScheduleDetail | null> {
  const parsed = getScheduleDetailSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule detail params");
  }

  const row = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: candidateId,
    },
    select: {
      cwd_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      created_at: true,
      updated_at: true,
      store: {
        select: { store_name: true, company: { select: { company_name: true } } },
      },
    },
  });

  if (!row) return null;

  return {
    cwd_uuid: row.cwd_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    store: row.store
      ? {
          store_name: row.store.store_name,
          company: row.store.company
            ? { company_name: row.store.company.company_name }
            : null,
        }
      : null,
  };
}

/**
 * Update the status of a working date (confirm/cancel).
 * Only the owning candidate can update their own schedule items.
 * Mirrors the legacy Yii2 CandidateScheduleController::actionUpdateStatus().
 */
export async function updateScheduleStatus(
  candidateId: number,
  data: UpdateScheduleStatusInput,
): Promise<ScheduleStatusResult> {
  const parsed = updateScheduleStatusSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule status update");
  }

  const existing = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: candidateId,
    },
    select: { cwd_uuid: true, status: true },
  });

  if (!existing) {
    throw new Error("Working date not found or access denied");
  }

  const updated = await prisma.candidate_working_date.update({
    where: { cwd_uuid: parsed.data.cwd_uuid },
    data: { status: parsed.data.status },
    select: { cwd_uuid: true, status: true },
  });

  revalidatePath("/candidate/schedule");
  return { cwd_uuid: updated.cwd_uuid, status: updated.status ?? 0 };
}
