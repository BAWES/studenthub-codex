"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listWorkLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  date: z.string().optional(),
});

export const getWorkLogDetailSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export const submitWorkLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  totalTime: z.coerce.number().int().optional(),
  note: z.string().optional(),
  storeId: z.coerce.number().int().optional(),
});

export const updateWorkLogStatusSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
  status: z.coerce.number().int().min(0, "Status must be 0 or greater"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WorkLogItem = {
  candidate_working_hour_uuid: string;
  date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  store_name: string | null;
  company_name: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type WorkLogDetail = WorkLogItem & {
  start_location_lat: number | null;
  start_location_long: number | null;
  end_location_lat: number | null;
  end_location_long: number | null;
  store_location: string | null;
};

export type ListWorkLogsResult = {
  items: WorkLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SubmitWorkLogResult = {
  operation: "success" | "error";
  message: string;
  workLog?: WorkLogItem;
};

export type UpdateWorkLogStatusResult = {
  operation: "success" | "error";
  message: string;
  workLog?: WorkLogItem;
};

// ---------------------------------------------------------------------------
// listWorkLogs — paginated list of work logs for the current candidate
// ---------------------------------------------------------------------------

/**
 * List work log entries for the current candidate, paginated.
 * Maps to the legacy CandidateWorkingHourController actionListHour.
 * Ordered by date descending.
 */
export async function listWorkLogs(
  params: z.input<typeof listWorkLogsSchema> = {},
): Promise<ListWorkLogsResult> {
  const session = await requireCapability("candidate.read.own");

  const parsed = listWorkLogsSchema.safeParse(params);
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
    prisma.candidate_working_hour.findMany({
      where: where as any,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
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
    prisma.candidate_working_hour.count({ where: where as any }),
  ]);

  const items: WorkLogItem[] = rows.map((row) => ({
    candidate_working_hour_uuid: row.candidate_working_hour_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    via: row.via,
    note: row.note,
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
// getWorkLogDetail — get a single work log by UUID with full details
// ---------------------------------------------------------------------------

/**
 * Get a single work log entry by UUID.
 * Maps to the legacy CandidateWorkingHourController hoursDetail.
 * Verifies the record belongs to the current candidate.
 * Returns null if not found or not owned.
 */
export async function getWorkLogDetail(
  params: z.input<typeof getWorkLogDetailSchema>,
): Promise<WorkLogDetail | null> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getWorkLogDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { workLogUuid } = parsed.data;
  const candidateId = Number(session.id);

  const row = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: workLogUuid,
      candidate_id: candidateId,
    },
    select: {
      candidate_working_hour_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      via: true,
      note: true,
      start_location_lat: true,
      start_location_long: true,
      end_location_lat: true,
      end_location_long: true,
      created_at: true,
      updated_at: true,
      store: {
        select: {
          store_name: true,
          store_location: true,
          company: { select: { company_name: true } },
        },
      },
    },
  });

  if (!row) return null;

  return {
    candidate_working_hour_uuid: row.candidate_working_hour_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    via: row.via,
    note: row.note,
    start_location_lat: row.start_location_lat
      ? Number(row.start_location_lat)
      : null,
    start_location_long: row.start_location_long
      ? Number(row.start_location_long)
      : null,
    end_location_lat: row.end_location_lat
      ? Number(row.end_location_lat)
      : null,
    end_location_long: row.end_location_long
      ? Number(row.end_location_long)
      : null,
    store_name: row.store?.store_name ?? null,
    store_location: row.store?.store_location ?? null,
    company_name: row.store?.company?.company_name ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// submitWorkLog — create a new work log entry
// ---------------------------------------------------------------------------

/**
 * Submit a new work log entry for the current candidate.
 * Maps to the legacy CandidateWorkingHourController actionAddHour.
 * Creates a manual work log with start/end time, date, and optional note.
 */
export async function submitWorkLog(
  params: z.input<typeof submitWorkLogSchema>,
): Promise<SubmitWorkLogResult> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = submitWorkLogSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid work log data",
    };
  }

  const { date, startTime, endTime, totalTime, note, storeId } = parsed.data;
  const candidateId = Number(session.id);
  const now = new Date();

  // Calculate total_time if endTime provided but totalTime not
  let computedTotalTime = totalTime;
  if (computedTotalTime === undefined && endTime) {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
      computedTotalTime = Math.round((endMs - startMs) / 1000 / 60); // minutes
    }
  }

  try {
    const created = await prisma.candidate_working_hour.create({
      data: {
        candidate_working_hour_uuid: `wh_${crypto.randomUUID()}`,
        candidate_id: candidateId,
        store_id: storeId ?? null,
        date: new Date(date),
        start_time: new Date(startTime),
        end_time: endTime ? new Date(endTime) : null,
        total_time: computedTotalTime ?? null,
        note: note ?? null,
        status: 0,
        via: "Manual Log",
        created_at: now,
        updated_at: now,
      },
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
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

    revalidatePath("/candidate/work-logs");

    return {
      operation: "success",
      message: "Work log submitted successfully",
      workLog: {
        candidate_working_hour_uuid: created.candidate_working_hour_uuid,
        date: created.date,
        start_time: created.start_time,
        end_time: created.end_time,
        total_time: created.total_time,
        status: created.status,
        via: created.via,
        note: created.note,
        store_name: created.store?.store_name ?? null,
        company_name: created.store?.company?.company_name ?? null,
        created_at: created.created_at,
        updated_at: created.updated_at,
      },
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to submit work log",
    };
  }
}

// ---------------------------------------------------------------------------
// updateWorkLogStatus — update the status of a work log entry
// ---------------------------------------------------------------------------

/**
 * Update the status of a work log entry.
 * Verifies the record belongs to the current candidate.
 * Revalidates the work-logs page path on success.
 */
export async function updateWorkLogStatus(
  params: z.input<typeof updateWorkLogStatusSchema>,
): Promise<UpdateWorkLogStatusResult> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = updateWorkLogStatusSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { workLogUuid, status } = parsed.data;
  const candidateId = Number(session.id);

  // Verify the work log exists and belongs to the candidate
  const existing = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: workLogUuid,
      candidate_id: candidateId,
    },
    select: { candidate_working_hour_uuid: true },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Work log not found",
    };
  }

  try {
    const updated = await prisma.candidate_working_hour.update({
      where: { candidate_working_hour_uuid: workLogUuid },
      data: {
        status,
        updated_at: new Date(),
      },
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
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

    revalidatePath("/candidate/work-logs");

    return {
      operation: "success",
      message: "Work log status updated",
      workLog: {
        candidate_working_hour_uuid: updated.candidate_working_hour_uuid,
        date: updated.date,
        start_time: updated.start_time,
        end_time: updated.end_time,
        total_time: updated.total_time,
        status: updated.status,
        via: updated.via,
        note: updated.note,
        store_name: updated.store?.store_name ?? null,
        company_name: updated.store?.company?.company_name ?? null,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to update work log status",
    };
  }
}
