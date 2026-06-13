"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/modules/auth/session";
import {
  listWorklogs as moduleListWorklogs,
  getWorklog as moduleGetWorklog,
  createWorklog as moduleCreateWorklog,
  updateWorklogStatus as moduleUpdateWorklogStatus,
} from "@/modules/worklogs/actions";
import {
  listWorkLogsSchema,
  getWorkLogDetailSchema,
  submitWorkLogSchema,
  updateWorkLogStatusSchema,
  workLogItemOutputSchema,
  workLogDetailOutputSchema,
  listWorkLogsResultOutputSchema,
  submitWorkLogResultOutputSchema,
  updateWorkLogStatusResultOutputSchema,
  type WorkLogItem,
  type WorkLogDetail,
  type ListWorkLogsResult,
  type SubmitWorkLogResult,
  type UpdateWorkLogStatusResult,
} from "@/app/candidate/work-logs/schemas";

// ---------------------------------------------------------------------------
// listWorkLogs — paginated list of work logs for the current candidate
// ---------------------------------------------------------------------------

/**
 * List work log entries for the current candidate, paginated.
 * Delegates to modules/worklogs for the core DB query, then adds pagination.
 * Store/company details are not available from the module and will be null
 * in the returned items list.
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

  // Delegate the core DB query to the module
  const moduleResult = await moduleListWorklogs({
    date: date ?? undefined,
  });

  const allRows = moduleResult.worklogs ?? [];

  // Sort by date descending (module orders by created_at desc)
  const sorted = [...allRows].sort((a, b) => b.date.localeCompare(a.date));

  // Paginate
  const offset = (page - 1) * limit;
  const paginated = sorted.slice(offset, offset + limit);

  const items: WorkLogItem[] = paginated.map((row) => ({
    candidate_working_hour_uuid: row.uuid,
    date: row.date ? new Date(row.date) : null,
    start_time: row.startTime ? new Date(row.startTime) : null,
    end_time: row.endTime ? new Date(row.endTime) : null,
    total_time: row.totalTime,
    status: row.status,
    via: row.via,
    note: row.note,
    store_name: null,
    company_name: null,
    created_at: null,
    updated_at: null,
  }));

  const result = {
    items,
    total: sorted.length,
    page,
    limit,
    totalPages: Math.ceil(sorted.length / limit),
  };

  // Validate output shape
  const outputParsed = listWorkLogsResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/work-logs] listWorkLogs output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getWorkLogDetail — get a single work log by UUID with full details
// ---------------------------------------------------------------------------

/**
 * Get a single work log entry by UUID.
 * Delegates to modules/worklogs for the core DB query.
 * Store/company/location details are not available from the module and will
 * be null in the returned detail.
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

  // Delegate to module's getWorklog
  const moduleResult = await moduleGetWorklog({ worklogUuid: workLogUuid });
  if (!moduleResult.worklog) return null;

  const row = moduleResult.worklog;

  const result = {
    candidate_working_hour_uuid: row.uuid,
    date: row.date ? new Date(row.date) : null,
    start_time: row.startTime ? new Date(row.startTime) : null,
    end_time: row.endTime ? new Date(row.endTime) : null,
    total_time: row.totalTime,
    status: row.status,
    via: row.via,
    note: row.note,
    start_location_lat: null,
    start_location_long: null,
    end_location_lat: null,
    end_location_long: null,
    store_name: null,
    store_location: null,
    company_name: null,
    created_at: null,
    updated_at: null,
  };

  // Validate output shape
  const outputParsed = workLogDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/work-logs] getWorkLogDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// submitWorkLog — create a new work log entry
// ---------------------------------------------------------------------------

/**
 * Submit a new work log entry for the current candidate.
 * Delegates to modules/worklogs for the core create operation,
 * converting structured params to FormData for the module's createWorklog.
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

  const { date, startTime, endTime, note } = parsed.data;

  // Convert structured params to FormData for the module's createWorklog
  // Module expects date as YYYY-MM-DD and times as HH:MM
  const dateStr = date;
  const startTimeStr = extractHHMM(startTime);
  const endTimeStr = endTime ? extractHHMM(endTime) : "";

  const fd = new FormData();
  fd.set("date", dateStr);
  fd.set("startTime", startTimeStr);
  if (endTimeStr) fd.set("endTime", endTimeStr);
  if (note) fd.set("note", note);

  const initialState = { success: false };
  const moduleResult = await moduleCreateWorklog(initialState, fd);

  if (!moduleResult.success) {
    return {
      operation: "error",
      message: moduleResult.error ?? "Failed to submit work log",
    };
  }

  revalidatePath("/candidate/work-logs");

  const submitResult = {
    operation: "success" as const,
    message: "Work log submitted successfully",
  };

  // Validate output shape
  const outputParsed = submitWorkLogResultOutputSchema.safeParse(submitResult);
  if (!outputParsed.success) {
    console.error(
      "[candidate/work-logs] submitWorkLog output validation failed:",
      outputParsed.error.issues,
    );
  }

  return submitResult;
}

// ---------------------------------------------------------------------------
// updateWorkLogStatus — update the status of a work log entry
// ---------------------------------------------------------------------------

/**
 * Update the status of a work log entry.
 * Delegates to modules/worklogs for ownership verification via getWorklog,
 * then uses Prisma for the status update (the module has no status-only
 * equivalent yet).
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

  try {
    // Delegate to module-level implementation
    const moduleResult = await moduleUpdateWorklogStatus({
      worklogUuid: workLogUuid,
      status,
    });

    if (!moduleResult.success || !moduleResult.worklog) {
      return {
        operation: "error",
        message: moduleResult.error ?? "Failed to update work log status",
      };
    }

    revalidatePath("/candidate/work-logs");

    const wl = moduleResult.worklog;
    const statusResult = {
      operation: "success" as const,
      message: "Work log status updated",
      workLog: {
        candidate_working_hour_uuid: wl.uuid,
        date: wl.date ? new Date(wl.date) : null,
        start_time: wl.startTime ? new Date(wl.startTime) : null,
        end_time: wl.endTime ? new Date(wl.endTime) : null,
        total_time: wl.totalTime,
        status: wl.status,
        via: wl.via,
        note: wl.note,
        store_name: null,
        company_name: null,
        created_at: null,
        updated_at: null,
      },
    };

    // Validate output shape
    const outputParsed = updateWorkLogStatusResultOutputSchema.safeParse(statusResult);
    if (!outputParsed.success) {
      console.error(
        "[candidate/work-logs] updateWorkLogStatus output validation failed:",
        outputParsed.error.issues,
      );
    }

    return statusResult;
  } catch (error) {
    return {
      operation: "error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract HH:MM from an ISO datetime string like "2026-06-15T08:00:00". */
function extractHHMM(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.slice(11, 16);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso.slice(11, 16);
  }
}
