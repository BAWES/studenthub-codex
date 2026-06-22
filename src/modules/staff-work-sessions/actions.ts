"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStaffWorkSessionsResultSchema,
  staffWorkSessionSchema,
  createStaffWorkSessionResultSchema,
} from "./schemas";
import type {
  StaffWorkSession,
  ListStaffWorkSessionsResult,
  CreateStaffWorkSessionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStaffWorkSessionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const getStaffWorkSessionSchema = z.object({
  workSessionUuid: z.string().min(1, "Work session UUID is required"),
});

// ---------------------------------------------------------------------------
// listStaffWorkSessions
// ---------------------------------------------------------------------------

/**
 * List staff work sessions with optional filtering.
 * Mirrors the legacy admin StaffWorkSessionController::actionList().
 * Admin-only capability: staff.read
 */
export async function listStaffWorkSessions(
  params: FormData | z.input<typeof listStaffWorkSessionsSchema> = {},
): Promise<ListStaffWorkSessionsResult> {
  await requireCapability("staff.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          staffId: params.get("staffId"),
          startDate: params.get("startDate"),
          endDate: params.get("endDate"),
        }
      : params;

  const parsed = listStaffWorkSessionsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page, limit, staffId, startDate, endDate } = parsed.data;

  // Build where clause
  const where: Record<string, unknown> = {};

  if (staffId) {
    where.staff_id = staffId;
  }

  if (startDate || endDate) {
    const createdDate: Record<string, Date | string> = {};
    if (startDate) {
      createdDate.gte = startDate;
    }
    if (endDate) {
      createdDate.lte = endDate;
    }
    where.created_at = createdDate;
  }

  const [sessions, total] = await Promise.all([
    prisma.staff_work_session.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        work_session_uuid: true,
        staff_id: true,
        total_minutes: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.staff_work_session.count({ where: where as any }),
  ]);

  const result: ListStaffWorkSessionsResult = {
    sessions: sessions.map((s) => ({
      work_session_uuid: s.work_session_uuid,
      staff_id: s.staff_id,
      total_minutes: s.total_minutes,
      created_at: s.created_at.toISOString(),
      updated_at: s.updated_at.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listStaffWorkSessionsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-work-sessions] listStaffWorkSessions output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStaffWorkSession
// ---------------------------------------------------------------------------

/**
 * Get a single staff work session by UUID.
 * Mirrors the legacy admin StaffWorkSessionController::actionView().
 * Returns null if not found.
 */
export async function getStaffWorkSession(
  params: FormData | z.input<typeof getStaffWorkSessionSchema>,
): Promise<StaffWorkSession | null> {
  await requireCapability("staff.read");

  const raw =
    params instanceof FormData
      ? { workSessionUuid: params.get("workSessionUuid") }
      : params;

  const parsed = getStaffWorkSessionSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const session = await prisma.staff_work_session.findUnique({
    where: { work_session_uuid: parsed.data.workSessionUuid },
    select: {
      work_session_uuid: true,
      staff_id: true,
      total_minutes: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!session) return null;

  const result: StaffWorkSession = {
    work_session_uuid: session.work_session_uuid,
    staff_id: session.staff_id,
    total_minutes: session.total_minutes,
    created_at: session.created_at.toISOString(),
    updated_at: session.updated_at.toISOString(),
  };

  const outputParsed = staffWorkSessionSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-work-sessions] getStaffWorkSession output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createStaffWorkSession
// ---------------------------------------------------------------------------

const createStaffWorkSessionSchema = z.object({
  staff_id: z.coerce.number().int().positive("Staff ID is required"),
  total_minutes: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Create a new staff work session.
 * Mirrors the legacy Yii2 REST POST to StaffWorkSessionController, which
 * auto-generates work_session_uuid with a UUID prefixed by "work_session_".
 * Staff-write capability: staff.write
 */
export async function createStaffWorkSession(
  data: z.input<typeof createStaffWorkSessionSchema>,
): Promise<CreateStaffWorkSessionResult> {
  await requireCapability("admin.write");

  const parsed = createStaffWorkSessionSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { staff_id, total_minutes } = parsed.data;
  const work_session_uuid = `work_session_${crypto.randomUUID()}`;
  const now = new Date();

  const session = await prisma.staff_work_session.create({
    data: {
      work_session_uuid,
      staff_id,
      total_minutes,
      created_at: now,
      updated_at: now,
    },
    select: {
      work_session_uuid: true,
      staff_id: true,
      total_minutes: true,
    },
  });

  return {
    work_session_uuid: session.work_session_uuid,
    staff_id: session.staff_id,
    total_minutes: session.total_minutes,
  };
}
