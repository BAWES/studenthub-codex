"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
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
  updateWorklogStatusSchema,
  listWorklogsResultSchema,
  getWorklogResultSchema,
  getWorklogStatsResultSchema,
  getWorkingDatesResultSchema,
  getAppealDetailResultSchema,
} from "./schemas";
import type {
  ListWorklogsInput,
  GetWorklogInput,
  GetWorklogStatsInput,
  GetWorkingDatesInput,
  GetAppealDetailInput,
  UpdateWorklogStatusInput,
  WorklogRow,
  WorklogStats,
  WorkingDate,
  AppealDetail,
  WorklogState,
  MarkAppealUpdateReadState,
} from "./schemas";

// ---------------------------------------------------------------------------
// listWorklogs
// ---------------------------------------------------------------------------

export async function listWorklogs(
  params: ListWorklogsInput,
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

  const result = {
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

  // Output validation — log mismatches without throwing
  const outputParsed = listWorklogsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/worklogs] listWorklogs output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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
// updateWorklogStatus — update only the status of a worklog
// ---------------------------------------------------------------------------

export async function updateWorklogStatus(
  params: UpdateWorklogStatusInput,
): Promise<{ success: boolean; error?: string; worklog?: WorklogRow }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = updateWorklogStatusSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
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

  const updated = await prisma.candidate_working_hour.update({
    where: { candidate_working_hour_uuid: parsed.data.worklogUuid },
    data: {
      status: parsed.data.status,
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
    },
  });

  const worklog: WorklogRow = {
    uuid: updated.candidate_working_hour_uuid,
    date: updated.date ? updated.date.toISOString().split("T")[0] : "",
    startTime: updated.start_time ? updated.start_time.toISOString() : null,
    endTime: updated.end_time ? updated.end_time.toISOString() : null,
    totalTime: updated.total_time,
    note: updated.note,
    status: updated.status ?? 0,
    via: updated.via,
    storeId: null,
  };

  return { success: true, worklog };
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
  params: GetWorklogInput,
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

  const result = {
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

  // Output validation — log mismatches without throwing
  const outputParsed = getWorklogResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/worklogs] getWorklog output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getWorklogStats — aggregated stats per date (checkIn, checkOut, totalTime)
// ---------------------------------------------------------------------------

export async function getWorklogStats(
  params: GetWorklogStatsInput,
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

  const result = {
    stats: {
      checkIn: firstSession?.start_time ? firstSession.start_time.toISOString() : null,
      checkOut: lastSession?.end_time ? lastSession.end_time.toISOString() : null,
      totalTime: totalTimeResult._sum.total_time ?? 0,
      status: lastSession?.status ?? null,
    },
  };

  // Output validation — log mismatches without throwing
  const outputParsed = getWorklogStatsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/worklogs] getWorklogStats output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getWorkingDates — dates that have worklogs within an optional range
// ---------------------------------------------------------------------------

export async function getWorkingDates(
  params: GetWorkingDatesInput,
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

  const result = {
    dates: rows.map((r) => ({
      date: r.date ? r.date.toISOString().split("T")[0] : "",
      totalTime: r._sum.total_time ?? 0,
    })),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = getWorkingDatesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/worklogs] getWorkingDates output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getAppealDetail — single appeal by UUID
// ---------------------------------------------------------------------------

export async function getAppealDetail(
  params: GetAppealDetailInput,
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

  const result = {
    appeal: {
      appealUuid: row.appeal_uuid,
      worklogUuid: row.candidate_working_hour_uuid,
      reason: row.reason ?? null,
      status: row.status ?? 0,
      createdAt: row.created_at ? row.created_at.toISOString() : "",
    },
  };

  // Output validation — log mismatches without throwing
  const outputParsed = getAppealDetailResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/worklogs] getAppealDetail output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// markAppealUpdateRead — mark an appeal update as read (is_new -> false)
// ---------------------------------------------------------------------------

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
