"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LeaveRecord = {
  staff_leave_uuid: string;
  staff_id: number | null;
  from_date: Date | null;
  to_date: Date | null;
  note: string | null;
  category: string | null;
  file: string | null;
  status: number | null;
  created_at: Date | null;
};

export type LeaveListResult = {
  leaves: LeaveRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateLeaveResult = {
  operation: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listLeavesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  category: z.string().optional(),
  status: z.number().int().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListLeavesParams = z.input<typeof listLeavesSchema>;

const getLeaveSchema = z.object({
  id: z.string().min(1),
});

export type GetLeaveParams = z.input<typeof getLeaveSchema>;

const createLeaveSchema = z.object({
  staffId: z.number().int().positive(),
  fromDate: z.string().min(1),
  toDate: z.string().min(1),
  note: z.string().optional(),
  category: z.string().optional(),
  file: z.string().optional(),
});

export type CreateLeaveParams = z.input<typeof createLeaveSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type LeaveWhereInput = {
  staff_id?: number;
  category?: string;
  status?: number;
};

/**
 * Build a Prisma where clause from filter params.
 */
function buildLeaveFilter(params: {
  staffId?: number;
  category?: string;
  status?: number;
}): LeaveWhereInput {
  const where: LeaveWhereInput = {};

  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }

  if (params.category && params.category.trim()) {
    where.category = params.category;
  }

  if (params.status !== undefined) {
    where.status = params.status;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List staff leave records with optional filters (staffId, category, status)
 * and pagination. Ordered by created_at descending.
 * Mirrors the legacy Yii2 StaffLeaveController::actionList().
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated leave list with total count
 */
export async function listLeaves(
  params: ListLeavesParams = {},
): Promise<LeaveListResult> {
  await requireCapability("staff_leave.read");

  const parsed = listLeavesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { staffId, category, status, page = 1, limit = 20 } = parsed.data;
  const where = buildLeaveFilter({ staffId, category, status });

  const [rows, total] = await Promise.all([
    prisma.staff_leave.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        staff_leave_uuid: true,
        staff_id: true,
        from_date: true,
        to_date: true,
        note: true,
        category: true,
        file: true,
        status: true,
        created_at: true,
      },
    }),
    prisma.staff_leave.count({ where: where as any }),
  ]);

  const leaves: LeaveRecord[] = rows.map((r) => ({
    staff_leave_uuid: r.staff_leave_uuid,
    staff_id: r.staff_id,
    from_date: r.from_date,
    to_date: r.to_date,
    note: r.note,
    category: r.category,
    file: r.file,
    status: r.status,
    created_at: r.created_at,
  }));

  return {
    leaves,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single staff leave record by UUID. Returns null if not found.
 * Mirrors the legacy Yii2 StaffLeaveController::actionView().
 *
 * @param params - Object with `id` (leave UUID string)
 * @returns The leave record, or null if not found
 */
export async function getLeave(
  params: GetLeaveParams,
): Promise<LeaveRecord | null> {
  await requireCapability("staff_leave.read");

  const parsed = getLeaveSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid leave ID");
  }

  const { id } = parsed.data;

  const leave = await prisma.staff_leave.findFirst({
    where: {
      staff_leave_uuid: id,
    },
    select: {
      staff_leave_uuid: true,
      staff_id: true,
      from_date: true,
      to_date: true,
      note: true,
      category: true,
      file: true,
      status: true,
      created_at: true,
    },
  });

  if (!leave) return null;

  return leave;
}

/**
 * Create a new staff leave request.
 * Mirrors the legacy Yii2 StaffLeaveController::actionCreate().
 *
 * @param params - Leave creation details
 * @returns Operation result with success/error message
 */
export async function createLeave(
  params: CreateLeaveParams,
): Promise<CreateLeaveResult> {
  await requireCapability("staff_leave.write");

  const parsed = createLeaveSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
  }

  const { staffId, fromDate, toDate, note, category, file } = parsed.data;

  try {
    await prisma.staff_leave.create({
      data: {
        staff_leave_uuid: `staff_leave_${Date.now()}_${staffId}`,
        staff_id: staffId,
        from_date: new Date(fromDate),
        to_date: new Date(toDate),
        note: note ?? null,
        category: category ?? null,
        file: file ?? null,
        status: 0, // Default: pending
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Request saved!",
    };
  } catch (error) {
    return {
      operation: "error",
      message: error instanceof Error ? error.message : "Failed to save leave request",
    };
  }
}
