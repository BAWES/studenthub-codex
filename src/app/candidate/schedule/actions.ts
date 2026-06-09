"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listScheduleSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const getScheduleItemSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

/** Valid working-date statuses for candidate self-service updates. */
const VALID_SCHEDULE_STATUSES = [0, 1, 2, 3] as const;

export const updateScheduleStatusSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
  status: z
    .number({ required_error: "Status is required", invalid_type_error: "Status must be a number" })
    .int("Status must be an integer")
    .refine((s) => (VALID_SCHEDULE_STATUSES as readonly number[]).includes(s), {
      message: "Status must be one of: 0 (Pending), 1 (Confirmed), 2 (Cancelled), 3 (Completed)",
    }),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListScheduleInput = z.input<typeof listScheduleSchema>;
export type GetScheduleItemInput = z.input<typeof getScheduleItemSchema>;
export type UpdateScheduleStatusInput = z.input<typeof updateScheduleStatusSchema>;

export type ScheduleItem = {
  cwd_uuid: string;
  date: Date;
  start_time: Date;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  store_name: string | null;
  company_name: string | null;
};

export type ScheduleStatusResult = {
  cwd_uuid: string;
  status: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List working dates for the current candidate (paginated, with optional date filter).
 * Mirrors the legacy Yii2 CandidateScheduleController::actionList().
 */
export async function listSchedule(
  input: ListScheduleInput = {},
): Promise<ScheduleItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listScheduleSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule list params");
  }

  const { page, limit, dateFrom, dateTo } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    candidate_id: Number(session.id),
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
 * Get a single working date by UUID.
 * Mirrors the legacy Yii2 CandidateScheduleController::actionView().
 */
export async function getScheduleItem(
  cwd_uuid: string,
): Promise<ScheduleItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getScheduleItemSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule item params");
  }

  const row = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: Number(session.id),
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
 * Update the status of a working date (confirm/cancel).
 * Only the owning candidate can update their own schedule items.
 * Mirrors the legacy Yii2 CandidateScheduleController::actionUpdateStatus().
 */
export async function updateScheduleStatus(
  data: UpdateScheduleStatusInput,
): Promise<ScheduleStatusResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateScheduleStatusSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule status update");
  }

  const existing = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: Number(session.id),
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
