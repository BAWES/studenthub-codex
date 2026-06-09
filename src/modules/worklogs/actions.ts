"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Zod schemas (shared with test file — duplicated for server action use)
// ---------------------------------------------------------------------------

const createWorklogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM").optional().or(z.literal("")),
  note: z.string().max(500, "Note must be 500 characters or less").optional().or(z.literal("")),
});

const listWorklogsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().or(z.literal("")),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional().or(z.literal("")),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional().or(z.literal("")),
});

const updateWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM").optional(),
  note: z.string().max(500, "Note must be 500 characters or less").optional(),
});

const deleteWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
});

const appealWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(1000, "Reason must be 1000 characters or less"),
});

const getWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
});

const getWorklogStatsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

const getWorkingDatesSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional().or(z.literal("")),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional().or(z.literal("")),
});

const getAppealDetailSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
});

const markAppealUpdateReadSchema = z.object({
  appealUpdateUuid: z.string().min(1, "Appeal update UUID is required"),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export type WorklogState = {
  success: boolean;
  error?: string;
};

export type WorklogRow = {
  uuid: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  totalTime: number | null;
  note: string | null;
  status: number;
  via: string | null;
  storeId: number | null;
};

// ---------------------------------------------------------------------------
// listWorklogs
// ---------------------------------------------------------------------------

export async function listWorklogs(
  params: z.infer<typeof listWorklogsSchema>,
): Promise<{ worklogs: WorklogRow[]; error?: string }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = listWorklogsSchema.safeParse(params);
  if (!parsed.success) {
    return { worklogs: [], error: parsed.error.errors[0]?.message ?? "Invalid params." };
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

  const rows = await prisma.candidate_working_hour.findMany({
    where: where as any,
    orderBy: { created_at: "desc" },
    take: 200,
  });

  return {
    worklogs: rows.map((r) => ({
      uuid: r.candidate_working_hour_uuid,
      date: r.date ? r.date.toISOString().split("T")[0] : "",
      startTime: r.start_time ? r.start_time.toISOString() : null,
      endTime: r.end_time ? r.end_time.toISOString() : null,
      totalTime: r.total_time,
      note: r.note,
      status: r.status ?? 0,
      via: r.via,
      storeId: r.store_id,
    })),
  };
}

// ---------------------------------------------------------------------------
// createWorklog
// ---------------------------------------------------------------------------

export async function createWorklog(
  _prevState: WorklogState,
  formData: FormData,
): Promise<WorklogState> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const raw = {
    date: (formData.get("date") ?? "") as string,
    startTime: (formData.get("startTime") ?? "") as string,
    endTime: (formData.get("endTime") ?? "") as string,
    note: (formData.get("note") ?? "") as string,
  };

  const parsed = createWorklogSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const d = parsed.data;
  const dateObj = new Date(d.date);
  const startParts = d.startTime.split(":").map(Number);
  const startDateTime = new Date(dateObj);
  startDateTime.setHours(startParts[0], startParts[1], 0, 0);

  let endDateTime: Date | null = null;
  let totalTime: number | null = null;
  if (d.endTime) {
    const endParts = d.endTime.split(":").map(Number);
    endDateTime = new Date(dateObj);
    endDateTime.setHours(endParts[0], endParts[1], 0, 0);
    totalTime = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000); // minutes
  }

  const now = new Date();
  const worklogUuid = `wl_${crypto.randomUUID()}`;

  await prisma.candidate_working_hour.create({
    data: {
      candidate_working_hour_uuid: worklogUuid,
      candidate_id: candidateId,
      store_id: null,
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
// updateWorklog
// ---------------------------------------------------------------------------

export async function updateWorklog(
  _prevState: WorklogState,
  formData: FormData,
): Promise<WorklogState> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = updateWorklogSchema.safeParse({
    worklogUuid: formData.get("worklogUuid"),
    startTime: formData.get("startTime") || undefined,
    endTime: formData.get("endTime") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: parsed.data.worklogUuid,
      candidate_id: candidateId,
    },
    select: { candidate_working_hour_uuid: true, date: true, start_time: true },
  });

  if (!existing) {
    return { success: false, error: "Work log not found." };
  }

  const data: Record<string, unknown> = { updated_at: new Date() };

  if (parsed.data.startTime) {
    const parts = parsed.data.startTime.split(":").map(Number);
    const dt = new Date(existing.date ?? new Date());
    dt.setHours(parts[0], parts[1], 0, 0);
    data.start_time = dt;
  }

  if (parsed.data.endTime) {
    const parts = parsed.data.endTime.split(":").map(Number);
    const dt = new Date(existing.date ?? new Date());
    dt.setHours(parts[0], parts[1], 0, 0);
    data.end_time = dt;

    // Recalculate total_time if both start and end are present
    const startTime = parsed.data.startTime
      ? (data.start_time as Date)
      : existing.start_time;
    if (startTime) {
      data.total_time = Math.round((dt.getTime() - startTime.getTime()) / 60000);
    }
  }

  if (parsed.data.note !== undefined) {
    data.note = parsed.data.note || null;
  }

  await prisma.candidate_working_hour.update({
    where: { candidate_working_hour_uuid: parsed.data.worklogUuid },
    data: data as any,
  });

  revalidatePath("/candidate/work-logs");
  revalidatePath(`/candidate/work-logs/${parsed.data.worklogUuid}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteWorklog
// ---------------------------------------------------------------------------

export async function deleteWorklog(
  _prevState: WorklogState,
  formData: FormData,
): Promise<WorklogState> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const worklogUuid = String(formData.get("worklogUuid") ?? "");
  const parsed = deleteWorklogSchema.safeParse({ worklogUuid });
  if (!parsed.success) {
    return { success: false, error: "Invalid work log identifier." };
  }

  const existing = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: parsed.data.worklogUuid,
      candidate_id: candidateId,
    },
    select: { candidate_working_hour_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Work log not found." };
  }

  await prisma.candidate_working_hour.delete({
    where: { candidate_working_hour_uuid: parsed.data.worklogUuid },
  });

  revalidatePath("/candidate/work-logs");
  return { success: true };
}

// ---------------------------------------------------------------------------
// appealWorklog
// ---------------------------------------------------------------------------

export async function appealWorklog(
  _prevState: WorklogState,
  formData: FormData,
): Promise<WorklogState> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = appealWorklogSchema.safeParse({
    worklogUuid: formData.get("worklogUuid"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const workLog = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: parsed.data.worklogUuid,
      candidate_id: candidateId,
    },
    select: { candidate_working_hour_uuid: true },
  });

  if (!workLog) {
    return { success: false, error: "Work log not found." };
  }

  const appealUuid = `appeal_${crypto.randomUUID()}`;
  const now = new Date();

  await prisma.$transaction([
    prisma.candidate_working_hour_appeal.create({
      data: {
        appeal_uuid: appealUuid,
        candidate_working_hour_uuid: parsed.data.worklogUuid,
        candidate_id: candidateId,
        reason: parsed.data.reason,
        status: 0,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.candidate_working_hour.update({
      where: { candidate_working_hour_uuid: parsed.data.worklogUuid },
      data: { appeal_uuid: appealUuid, updated_at: now },
    }),
  ]);

  revalidatePath("/candidate/work-logs");
  revalidatePath(`/candidate/work-logs/${parsed.data.worklogUuid}`);
  redirect(`/candidate/work-logs/${parsed.data.worklogUuid}` as Route);
}

// ---------------------------------------------------------------------------
// getWorklog — single worklog by UUID
// ---------------------------------------------------------------------------

export async function getWorklog(
  params: z.infer<typeof getWorklogSchema>,
): Promise<{ worklog: WorklogRow | null; error?: string }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = getWorklogSchema.safeParse(params);
  if (!parsed.success) {
    return { worklog: null, error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const row = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: parsed.data.worklogUuid,
      candidate_id: candidateId,
    },
  });

  if (!row) {
    return { worklog: null, error: "Work log not found." };
  }

  return {
    worklog: {
      uuid: row.candidate_working_hour_uuid,
      date: row.date ? row.date.toISOString().split("T")[0] : "",
      startTime: row.start_time ? row.start_time.toISOString() : null,
      endTime: row.end_time ? row.end_time.toISOString() : null,
      totalTime: row.total_time,
      note: row.note,
      status: row.status ?? 0,
      via: row.via,
      storeId: row.store_id,
    },
  };
}

// ---------------------------------------------------------------------------
// getWorklogStats — aggregated stats per date (checkIn, checkOut, totalTime)
// ---------------------------------------------------------------------------

export type WorklogStats = {
  checkIn: string | null;
  checkOut: string | null;
  totalTime: number | null;
  status: number | null;
};

export async function getWorklogStats(
  params: z.infer<typeof getWorklogStatsSchema>,
): Promise<{ stats: WorklogStats | null; error?: string }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = getWorklogStatsSchema.safeParse(params);
  if (!parsed.success) {
    return { stats: null, error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const dateObj = new Date(parsed.data.date);

  const [firstSession, lastSession, totalTimeResult] = await Promise.all([
    prisma.candidate_working_hour.findFirst({
      where: { date: dateObj, candidate_id: candidateId },
      orderBy: { created_at: "asc" },
    }),
    prisma.candidate_working_hour.findFirst({
      where: { date: dateObj, candidate_id: candidateId, end_time: { not: null } },
      orderBy: { created_at: "desc" },
    }),
    prisma.candidate_working_hour.aggregate({
      where: { date: dateObj, candidate_id: candidateId, end_time: { not: null } },
      _sum: { total_time: true },
    }),
  ]);

  return {
    stats: {
      checkIn: firstSession?.start_time ? firstSession.start_time.toISOString() : null,
      checkOut: lastSession?.end_time ? lastSession.end_time.toISOString() : null,
      totalTime: totalTimeResult._sum.total_time ?? 0,
      status: lastSession?.status ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// getWorkingDates — dates that have worklogs within an optional range
// ---------------------------------------------------------------------------

export type WorkingDate = {
  date: string;
  totalTime: number | null;
};

export async function getWorkingDates(
  params: z.infer<typeof getWorkingDatesSchema>,
): Promise<{ dates: WorkingDate[]; error?: string }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = getWorkingDatesSchema.safeParse(params);
  if (!parsed.success) {
    return { dates: [], error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const where: Record<string, unknown> = { candidate_id: candidateId };
  if (parsed.data.startDate && parsed.data.endDate) {
    where.date = { gte: new Date(parsed.data.startDate), lte: new Date(parsed.data.endDate) };
  }

  const rows = await prisma.candidate_working_hour.groupBy({
    by: ["date"],
    where: where as any,
    _sum: { total_time: true },
    orderBy: { date: "desc" },
  });

  return {
    dates: rows.map((r) => ({
      date: r.date ? r.date.toISOString().split("T")[0] : "",
      totalTime: r._sum.total_time ?? 0,
    })),
  };
}

// ---------------------------------------------------------------------------
// getAppealDetail — single appeal by UUID
// ---------------------------------------------------------------------------

export type AppealDetail = {
  appealUuid: string;
  worklogUuid: string;
  reason: string | null;
  status: number;
  createdAt: string;
};

export async function getAppealDetail(
  params: z.infer<typeof getAppealDetailSchema>,
): Promise<{ appeal: AppealDetail | null; error?: string }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = getAppealDetailSchema.safeParse(params);
  if (!parsed.success) {
    return { appeal: null, error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const row = await prisma.candidate_working_hour_appeal.findFirst({
    where: {
      appeal_uuid: parsed.data.appealUuid,
      candidate_id: candidateId,
    },
  });

  if (!row) {
    return { appeal: null, error: "Appeal not found." };
  }

  return {
    appeal: {
      appealUuid: row.appeal_uuid,
      worklogUuid: row.candidate_working_hour_uuid,
      reason: row.reason ?? null,
      status: row.status ?? 0,
      createdAt: row.created_at ? row.created_at.toISOString() : "",
    },
  };
}

// ---------------------------------------------------------------------------
// markAppealUpdateRead — mark an appeal update as read (is_new -> false)
// ---------------------------------------------------------------------------

export type MarkAppealUpdateReadState = {
  success: boolean;
  error?: string;
};

export async function markAppealUpdateRead(
  _prevState: MarkAppealUpdateReadState,
  formData: FormData,
): Promise<MarkAppealUpdateReadState> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = markAppealUpdateReadSchema.safeParse({
    appealUpdateUuid: formData.get("appealUpdateUuid"),
  });
  if (!parsed.success) {
    return { success: false, error: "Invalid appeal update identifier." };
  }

  const existing = await prisma.candidate_working_hour_appeal_updates.findFirst({
    where: {
      appeal_update_uuid: parsed.data.appealUpdateUuid,
    },
    select: { appeal_update_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Appeal update not found." };
  }

  await prisma.candidate_working_hour_appeal_updates.update({
    where: { appeal_update_uuid: parsed.data.appealUpdateUuid },
    data: { is_new: false },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// Barrel export
// ---------------------------------------------------------------------------

export {
  createWorklogSchema,
  listWorklogsSchema,
  updateWorklogSchema,
  deleteWorklogSchema,
  appealWorklogSchema,
  getWorklogSchema,
  getWorklogStatsSchema,
  getWorkingDatesSchema,
  getAppealDetailSchema,
  markAppealUpdateReadSchema,
};
