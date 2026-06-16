"use server";

// ---------------------------------------------------------------------------
// Module-level actions for candidate schedule (working dates)
// ---------------------------------------------------------------------------
// Contains the real Prisma logic for listing, viewing, and updating the
// candidate's working dates. App router actions delegate to this.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listScheduleSchema,
  getScheduleItemSchema,
  getScheduleDetailSchema,
  updateScheduleStatusSchema,
  scheduleItemSchema,
  scheduleStatusResultSchema,
  scheduleDetailSchema,
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

  const items = rows.map((row) => ({
    cwd_uuid: row.cwd_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    store_name: row.store?.store_name ?? null,
    company_name: row.store?.company?.company_name ?? null,
  }));

  // Validate output shape
  const outputParsed = scheduleItemSchema.array().safeParse(items);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/schedule] listSchedule output validation failed:",
      outputParsed.error.issues,
    );
  }

  return items;
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

  const result: ScheduleItem = {
    cwd_uuid: row.cwd_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    store_name: row.store?.store_name ?? null,
    company_name: row.store?.company?.company_name ?? null,
  };

  // Validate output shape
  const outputParsed = scheduleItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/schedule] getScheduleItem output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  const storeObj = row.store
    ? {
        store_name: row.store.store_name,
        company: row.store.company
          ? { company_name: row.store.company.company_name }
          : null,
      }
    : null;

  const result: ScheduleDetail = {
    cwd_uuid: row.cwd_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    store: storeObj,
  };

  // Validate output shape
  const outputParsed = scheduleDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/schedule] getScheduleDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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
  const result: ScheduleStatusResult = { cwd_uuid: updated.cwd_uuid, status: updated.status ?? 0 };

  // Validate output shape
  const outputParsed = scheduleStatusResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/schedule] updateScheduleStatus output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Route-level wrappers (for /candidate/schedule route)
// ---------------------------------------------------------------------------

/** Input schema for listScheduleAction — no candidateId (extracted from session). */
const listScheduleActionSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

type ListScheduleActionInput = z.input<typeof listScheduleActionSchema>;

/** Input schema for getScheduleItemAction. */
const getScheduleItemActionSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

/** Input schema for getScheduleDetailAction. */
const getScheduleDetailActionSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

/** Valid working-date statuses for candidate self-service updates. */
const VALID_SCHEDULE_STATUSES = [0, 1, 2, 3] as const;

/** Input schema for updateScheduleStatusAction. */
const updateScheduleStatusActionSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
  status: z
    .number({ required_error: "Status is required", invalid_type_error: "Status must be a number" })
    .int("Status must be an integer")
    .refine((s) => (VALID_SCHEDULE_STATUSES as readonly number[]).includes(s), {
      message: "Status must be one of: 0 (Pending), 1 (Confirmed), 2 (Cancelled), 3 (Completed)",
    }),
});

type UpdateScheduleStatusActionInput = z.input<typeof updateScheduleStatusActionSchema>;

/**
 * List working dates for the current candidate (paginated, with optional date filter).
 * Extracts candidateId from session and delegates to listSchedule.
 */
export async function listScheduleAction(
  input: ListScheduleActionInput = {},
): Promise<ScheduleItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listScheduleActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule list params");
  }

  return listSchedule(Number(session.id), parsed.data);
}

/**
 * Get a single working date by UUID.
 * Extracts candidateId from session and delegates to getScheduleItem.
 */
export async function getScheduleItemAction(
  cwd_uuid: string,
): Promise<ScheduleItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getScheduleItemActionSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid working date UUID",
    );
  }

  const result = await getScheduleItem(
    Number(session.id),
    parsed.data.cwd_uuid,
  );

  // Validate output shape
  if (result) {
    const outputParsed = scheduleItemSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/schedule] getScheduleItemAction output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Get a single working date detail with full store/company nesting.
 * Extracts candidateId from session and delegates to getScheduleDetail.
 */
export async function getScheduleDetailAction(
  cwd_uuid: string,
): Promise<ScheduleDetail | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getScheduleDetailActionSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid working date UUID",
    );
  }

  const result = await getScheduleDetail(
    Number(session.id),
    parsed.data.cwd_uuid,
  );

  // Validate output shape
  if (result) {
    const outputParsed = scheduleDetailSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/schedule] getScheduleDetailAction output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Update the status of a working date (confirm/cancel).
 * Extracts candidateId from session and delegates to updateScheduleStatus.
 */
export async function updateScheduleStatusAction(
  data: UpdateScheduleStatusActionInput,
): Promise<ScheduleStatusResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateScheduleStatusActionSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid schedule status data",
    );
  }

  const result = await updateScheduleStatus(
    Number(session.id),
    parsed.data,
  );

  // Validate output shape
  const outputParsed = scheduleStatusResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/schedule] updateScheduleStatusAction output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// [id] route wrappers (for /candidate/schedule/[id])
// ---------------------------------------------------------------------------

/** Input schema for getScheduleEntryAction. */
const getScheduleEntryActionSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

/** Input schema for updateScheduleEntryAction. */
const updateScheduleEntryActionSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
  status: z
    .number({ required_error: "Status is required", invalid_type_error: "Status must be a number" })
    .int("Status must be an integer")
    .refine((s) => (VALID_SCHEDULE_STATUSES as readonly number[]).includes(s), {
      message: "Status must be one of: 0 (Pending), 1 (Confirmed), 2 (Cancelled), 3 (Completed)",
    }),
  reason: z.string().max(1000).optional(),
});

type UpdateScheduleEntryActionInput = z.input<typeof updateScheduleEntryActionSchema>;

/** Input schema for deleteScheduleEntryAction. */
const deleteScheduleEntryActionSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

/** Schema for schedule entry existence check. */
const scheduleEntryExistenceActionSchema = z
  .object({
    cwd_uuid: z.string().min(1),
    status: z.number().int().optional(),
  })
  .nullable();

/** Schema for action result (success/failure discriminated union). */
const scheduleEntryActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

type ScheduleEntryActionResult = z.output<typeof scheduleEntryActionResultOutputSchema>;

/**
 * Get a single schedule entry with full detail (store, company, timestamps).
 * Extracts session and delegates to getScheduleDetailAction.
 */
export async function getScheduleEntryAction(
  cwd_uuid: string,
): Promise<ScheduleDetail | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getScheduleEntryActionSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule entry params");
  }

  return getScheduleDetailAction(parsed.data.cwd_uuid);
}

/**
 * Update the status of a schedule entry with an optional reason.
 * Delegates to updateScheduleStatus after verifying ownership.
 */
export async function updateScheduleEntryAction(
  cwd_uuid: string,
  status: number,
  reason?: string,
): Promise<ScheduleEntryActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateScheduleEntryActionSchema.safeParse({ cwd_uuid, status, reason });
  if (!parsed.success) {
    return scheduleEntryActionResultOutputSchema.parse({
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  // Verify the entry exists and belongs to the candidate before mutating
  const existing = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: Number(session.id),
    },
    select: { cwd_uuid: true, status: true },
  });

  const existenceCheck = scheduleEntryExistenceActionSchema.safeParse(existing);
  if (!existenceCheck.success || !existenceCheck.data) {
    return scheduleEntryActionResultOutputSchema.parse({
      success: false as const,
      error: "Schedule entry not found or access denied",
    });
  }

  // Delegate the status update to the Prisma-level function
  await updateScheduleStatus(Number(session.id), {
    cwd_uuid: parsed.data.cwd_uuid,
    status: parsed.data.status,
  });

  revalidatePath("/candidate/schedule");
  revalidatePath(`/candidate/schedule/${parsed.data.cwd_uuid}`);

  return scheduleEntryActionResultOutputSchema.parse({ success: true as const });
}

/**
 * Delete a schedule entry by UUID.
 * Only the owning candidate can delete their own schedule entries.
 */
export async function deleteScheduleEntryAction(
  cwd_uuid: string,
): Promise<ScheduleEntryActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteScheduleEntryActionSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    return scheduleEntryActionResultOutputSchema.parse({
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  // Verify ownership before deleting
  const existing = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: Number(session.id),
    },
    select: { cwd_uuid: true },
  });

  const existenceCheck = scheduleEntryExistenceActionSchema.safeParse(existing);
  if (!existenceCheck.success || !existenceCheck.data) {
    return scheduleEntryActionResultOutputSchema.parse({
      success: false as const,
      error: "Schedule entry not found or access denied",
    });
  }

  await prisma.candidate_working_date.delete({
    where: { cwd_uuid: parsed.data.cwd_uuid },
  });

  revalidatePath("/candidate/schedule");

  return scheduleEntryActionResultOutputSchema.parse({ success: true as const });
}
