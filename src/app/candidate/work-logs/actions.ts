"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getWorkLogsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
});

export const getWorkLogDetailSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export const submitWorkLogSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "End time must be HH:MM")
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, "Note must be 500 characters or less")
    .optional()
    .or(z.literal("")),
});

export const updateWorkLogStatusSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
  status: z.number().int().min(0).max(10, "Status must be between 0 and 10"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetWorkLogsInput = z.input<typeof getWorkLogsSchema>;
export type GetWorkLogDetailInput = z.input<typeof getWorkLogDetailSchema>;
export type SubmitWorkLogInput = z.input<typeof submitWorkLogSchema>;
export type UpdateWorkLogStatusInput = z.input<typeof updateWorkLogStatusSchema>;

export type WorkLogRow = {
  uuid: string;
  date: string;
  store: string;
  company: string;
  total: string;
  status: string;
  via: string;
  note: string;
};

export type WorkLogDetail = {
  uuid: string;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  totalTime: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  store: {
    name: string | null;
    location: string | null;
    companyName: string | null;
  } | null;
};

export type WorkLogDetailResult = {
  workLog: WorkLogDetail | null;
  metrics: Array<{ label: string; value: string; note: string | null }>;
  appeals: Array<{ id: string; title: string; subtitle: string; meta: string }>;
  feedback: Array<{ id: string; title: string; subtitle: string; meta: string }>;
};

export type WorkLogActionState = {
  success: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// getWorkLogs — list work logs for the current candidate
// ---------------------------------------------------------------------------

export async function getWorkLogs(
  params: GetWorkLogsInput = {},
): Promise<{ workLogs: WorkLogRow[]; total: number; error?: string }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = getWorkLogsSchema.safeParse(params);
  if (!parsed.success) {
    return { workLogs: [], total: 0, error: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  }

  const where: Record<string, unknown> = { candidate_id: candidateId };

  if (parsed.data.date) {
    where.date = new Date(parsed.data.date);
  } else {
    if (parsed.data.startDate) {
      where.date = { gte: new Date(parsed.data.startDate) };
    }
    if (parsed.data.endDate) {
      where.date = { ...(where.date as object || {}), lte: new Date(parsed.data.endDate) };
    }
  }

  const [rows, total] = await Promise.all([
    prisma.candidate_working_hour.findMany({
      where: where as any,
      orderBy: { date: "desc" },
      take: 80,
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
        store: {
          select: { store_name: true, company: { select: { company_name: true } } },
        },
      },
    }),
    prisma.candidate_working_hour.count({ where: where as any }),
  ]);

  return {
    workLogs: rows.map((row) => ({
      uuid: row.candidate_working_hour_uuid,
      date: formatDate(row.date),
      store: row.store?.store_name ?? "No store",
      company: row.store?.company?.company_name ?? "No company",
      total: `${row.total_time ?? 0} minutes`,
      status: `Status ${row.status ?? 0}`,
      via: row.via ?? "Not set",
      note: row.note?.slice(0, 120) ?? "",
    })),
    total,
  };
}

// ---------------------------------------------------------------------------
// getWorkLogDetail — full work log detail with appeals and feedback
// ---------------------------------------------------------------------------

export async function getWorkLogDetail(
  params: GetWorkLogDetailInput,
): Promise<WorkLogDetailResult> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = getWorkLogDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid work log UUID");
  }

  const [workLog, appeals, feedback] = await prisma.$transaction([
    prisma.candidate_working_hour.findFirst({
      where: {
        candidate_working_hour_uuid: parsed.data.workLogUuid,
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
    }),
    prisma.candidate_working_hour_appeal.findMany({
      where: {
        candidate_working_hour_uuid: parsed.data.workLogUuid,
        candidate_id: candidateId,
      },
      orderBy: { created_at: "desc" },
      take: 8,
      select: {
        appeal_uuid: true,
        reason: true,
        status: true,
        created_at: true,
      },
    }),
    prisma.candidate_work_log_feedback.findMany({
      where: {
        candidate_working_hour_uuid: parsed.data.workLogUuid,
        candidate_id: candidateId,
      },
      orderBy: { created_at: "desc" },
      take: 8,
      select: {
        cwlf_uuid: true,
        note: true,
        reason: true,
        status: true,
        rating: true,
        created_at: true,
      },
    }),
  ]);

  if (!workLog) {
    return {
      workLog: null,
      metrics: [],
      appeals: [],
      feedback: [],
    };
  }

  const detail: WorkLogDetail = {
    uuid: workLog.candidate_working_hour_uuid,
    date: workLog.date,
    startTime: workLog.start_time,
    endTime: workLog.end_time,
    totalTime: workLog.total_time,
    status: workLog.status,
    via: workLog.via,
    note: workLog.note,
    startLat: workLog.start_location_lat ? Number(workLog.start_location_lat) : null,
    startLng: workLog.start_location_long ? Number(workLog.start_location_long) : null,
    endLat: workLog.end_location_lat ? Number(workLog.end_location_lat) : null,
    endLng: workLog.end_location_long ? Number(workLog.end_location_long) : null,
    createdAt: workLog.created_at,
    updatedAt: workLog.updated_at,
    store: workLog.store
      ? {
          name: workLog.store.store_name,
          location: workLog.store.store_location,
          companyName: workLog.store.company?.company_name ?? null,
        }
      : null,
  };

  return {
    workLog: detail,
    metrics: [
      { label: "Total", value: `${detail.totalTime ?? 0} minutes`, note: "Imported total time" },
      { label: "Status", value: `Status ${detail.status ?? 0}`, note: detail.via ?? "No source" },
      { label: "Appeals", value: String(appeals.length), note: "Appeal records linked to this log" },
      { label: "Feedback", value: String(feedback.length), note: "Feedback records linked to this log" },
    ],
    appeals: appeals.map((appeal) => ({
      id: appeal.appeal_uuid,
      title: `Status ${appeal.status}`,
      subtitle: appeal.reason?.slice(0, 180) ?? "No reason",
      meta: formatDate(appeal.created_at),
    })),
    feedback: feedback.map((item) => ({
      id: item.cwlf_uuid,
      title: item.reason ?? `Status ${item.status ?? 0}`,
      subtitle: item.note?.slice(0, 180) ?? "No note",
      meta: `${item.rating === true ? "Positive" : item.rating === false ? "Negative" : "No rating"} · ${formatDate(item.created_at)}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// submitWorkLog — create a new manual work log entry
// ---------------------------------------------------------------------------

export async function submitWorkLog(
  data: SubmitWorkLogInput,
): Promise<WorkLogActionState> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = submitWorkLogSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;
  const dateObj = new Date(d.date);
  const [startH, startM] = d.startTime.split(":").map(Number);
  const startDateTime = new Date(dateObj);
  startDateTime.setHours(startH, startM, 0, 0);

  let endDateTime: Date | null = null;
  let totalTime: number | null = null;

  if (d.endTime) {
    const [endH, endM] = d.endTime.split(":").map(Number);
    endDateTime = new Date(dateObj);
    endDateTime.setHours(endH, endM, 0, 0);
    totalTime = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000);
  }

  const now = new Date();
  const worklogUuid = `wl_${crypto.randomUUID()}`;

  await prisma.candidate_working_hour.create({
    data: {
      candidate_working_hour_uuid: worklogUuid,
      candidate_id: candidateId,
      date: dateObj,
      start_time: startDateTime,
      end_time: endDateTime,
      total_time: totalTime,
      note: d.note || null,
      status: 0, // pending
      via: "Manual Log",
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate/work-logs");
  return { success: true };
}

// ---------------------------------------------------------------------------
// updateWorkLogStatus — update a work log's status
// ---------------------------------------------------------------------------

export async function updateWorkLogStatus(
  data: UpdateWorkLogStatusInput,
): Promise<WorkLogActionState> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = updateWorkLogStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: parsed.data.workLogUuid,
      candidate_id: candidateId,
    },
    select: { candidate_working_hour_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Work log not found" };
  }

  await prisma.candidate_working_hour.update({
    where: { candidate_working_hour_uuid: parsed.data.workLogUuid },
    data: {
      status: parsed.data.status,
      updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/work-logs");
  revalidatePath(`/candidate/work-logs/${parsed.data.workLogUuid}`);
  return { success: true };
}
