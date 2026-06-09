"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listScheduleSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  date: z.string().optional(),
});

export const getScheduleItemSchema = z.object({
  cwdUuid: z.string().min(1, "Schedule item UUID is required"),
});

export const updateScheduleStatusSchema = z.object({
  cwdUuid: z.string().min(1, "Schedule item UUID is required"),
  status: z.coerce.number().int().min(0).max(3, "Status must be 0-3"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListScheduleParams = z.input<typeof listScheduleSchema>;
export type GetScheduleItemParams = z.input<typeof getScheduleItemSchema>;
export type UpdateScheduleStatusParams = z.input<typeof updateScheduleStatusSchema>;

export type ScheduleItem = {
  cwd_uuid: string;
  date: Date;
  start_time: Date;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  store_name: string | null;
  company_name: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListScheduleResult = {
  items: ScheduleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listSchedule
// ---------------------------------------------------------------------------

/**
 * List candidate working dates (schedule) for the current candidate.
 *
 * Maps to the legacy CandidateWorkingDateController view for
 * a candidate's own schedule. Paginated with optional date filter.
 * Ordered by date descending.
 */
export async function listSchedule(
  params: FormData | z.input<typeof listScheduleSchema> = {},
): Promise<ListScheduleResult> {
  const session = await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          date: params.get("date"),
        }
      : params;

  const parsed = listScheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, date } = parsed.data;
  const skip = (page - 1) * limit;
  const candidateId = Number(session.id);

  // Build Prisma where clause
  const where: Record<string, unknown> = {
    candidate_id: candidateId,
  };

  if (date !== undefined && date.trim().length > 0) {
    where.date = new Date(date.trim());
  }

  const [rows, total] = await Promise.all([
    prisma.candidate_working_date.findMany({
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
        created_at: true,
        updated_at: true,
        store: {
          select: {
            store_name: true,
            company: { select: { company_name: true } },
          },
        },
      },
    }),
    prisma.candidate_working_date.count({ where: where as any }),
  ]);

  const items: ScheduleItem[] = rows.map((row) => ({
    cwd_uuid: row.cwd_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    store_name: row.store?.store_name ?? null,
    company_name: row.store?.company?.company_name ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getScheduleItem
// ---------------------------------------------------------------------------

/**
 * Get a single schedule item (working date) by UUID.
 *
 * Maps to the legacy CandidateWorkingDateController view detail method.
 * Verifies the record belongs to the current candidate.
 * Returns null if not found or not owned by the candidate.
 */
export async function getScheduleItem(
  params: GetScheduleItemParams,
): Promise<ScheduleItem | null> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getScheduleItemSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { cwdUuid } = parsed.data;
  const candidateId = Number(session.id);

  const row = await prisma.candidate_working_date.findFirst({
    where: { cwd_uuid: cwdUuid, candidate_id: candidateId },
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
        select: {
          store_name: true,
          company: { select: { company_name: true } },
        },
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
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// updateScheduleStatus
// ---------------------------------------------------------------------------

/**
 * Update the status of a candidate working date (schedule item).
 *
 * Maps to the legacy action for candidates confirming/cancelling
 * their working dates. Only allows updates to own records.
 * Revalidates the schedule page path on success.
 */
export async function updateScheduleStatus(
  params: UpdateScheduleStatusParams,
): Promise<ScheduleItem> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = updateScheduleStatusSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { cwdUuid, status } = parsed.data;
  const candidateId = Number(session.id);

  // Verify the schedule item exists and belongs to the candidate
  const existing = await prisma.candidate_working_date.findFirst({
    where: { cwd_uuid: cwdUuid, candidate_id: candidateId },
    select: { cwd_uuid: true },
  });

  if (!existing) {
    throw new Error("Schedule item not found");
  }

  const now = new Date();

  const updated = await prisma.candidate_working_date.update({
    where: { cwd_uuid: cwdUuid },
    data: {
      status,
      updated_at: now,
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
        select: {
          store_name: true,
          company: { select: { company_name: true } },
        },
      },
    },
  });

  revalidatePath("/candidate/schedule");

  return {
    cwd_uuid: updated.cwd_uuid,
    date: updated.date,
    start_time: updated.start_time,
    end_time: updated.end_time,
    total_time: updated.total_time,
    status: updated.status,
    store_name: updated.store?.store_name ?? null,
    company_name: updated.store?.company?.company_name ?? null,
    created_at: updated.created_at,
    updated_at: updated.updated_at,
  };
}
