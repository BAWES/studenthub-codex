"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStaffLeavesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
});

const getStaffLeaveSchema = z.object({
  leaveUuid: z.string().min(1, "Leave UUID is required"),
});

const createStaffLeaveSchema = z.object({
  staffId: z.coerce.number().int().positive().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  note: z.string().optional(),
  category: z.string().optional(),
  status: z.coerce.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StaffLeaveListItem = {
  staff_leave_uuid: string;
  staff_id: number | null;
  from_date: string | null;
  to_date: string | null;
  note: string | null;
  category: string | null;
  status: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListStaffLeavesResult = {
  leaves: StaffLeaveListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateStaffLeaveResult = {
  staff_leave_uuid: string;
};

// ---------------------------------------------------------------------------
// listStaffLeaves
// ---------------------------------------------------------------------------

/**
 * List staff leave records with pagination and optional filtering.
 * Mirrors the legacy Yii2 StaffLeaveController::actionList().
 */
export async function listStaffLeaves(
  params: FormData | z.input<typeof listStaffLeavesSchema> = {},
): Promise<ListStaffLeavesResult> {
  await requireCapability("staff_leave.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          staffId: params.get("staffId"),
          status: params.get("status"),
        }
      : params;

  const parsed = listStaffLeavesSchema.safeParse(raw);
  if (!parsed.success) {
    return { leaves: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, staffId, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (staffId !== undefined) where.staff_id = staffId;
  if (status !== undefined) where.status = status;

  const [leaves, total] = await Promise.all([
    prisma.staff_leave.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.staff_leave.count({ where: where as any }),
  ]);

  return {
    leaves: leaves.map((l: any): StaffLeaveListItem => ({
      staff_leave_uuid: l.staff_leave_uuid,
      staff_id: l.staff_id ?? null,
      from_date: l.from_date?.toISOString() ?? null,
      to_date: l.to_date?.toISOString() ?? null,
      note: l.note ?? null,
      category: l.category ?? null,
      status: l.status ?? null,
      created_at: l.created_at?.toISOString() ?? null,
      updated_at: l.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getStaffLeave
// ---------------------------------------------------------------------------

/**
 * Get a single staff leave record by UUID.
 * Returns null if not found.
 */
export async function getStaffLeave(
  leaveUuid: string,
): Promise<StaffLeaveListItem | null> {
  await requireCapability("staff_leave.read");

  const parsed = getStaffLeaveSchema.safeParse({ leaveUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid leave UUID",
    );
  }

  const leave = await prisma.staff_leave.findFirst({
    where: { staff_leave_uuid: parsed.data.leaveUuid },
  });

  if (!leave) return null;

  const raw = leave as any;
  return {
    staff_leave_uuid: raw.staff_leave_uuid,
    staff_id: raw.staff_id ?? null,
    from_date: raw.from_date?.toISOString() ?? null,
    to_date: raw.to_date?.toISOString() ?? null,
    note: raw.note ?? null,
    category: raw.category ?? null,
    status: raw.status ?? null,
    created_at: raw.created_at?.toISOString() ?? null,
    updated_at: raw.updated_at?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// createStaffLeave
// ---------------------------------------------------------------------------

/**
 * Create a new staff leave record.
 * Generates a UUID prefixed with "sl_".
 * Mirrors the legacy Yii2 StaffLeaveController::actionCreate().
 */
export async function createStaffLeave(
  data: z.input<typeof createStaffLeaveSchema>,
): Promise<CreateStaffLeaveResult> {
  await requireCapability("staff_leave.write");

  const parsed = createStaffLeaveSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid staff leave data");
  }

  const { staffId, fromDate, toDate, note, category, status } = parsed.data;

  const leave = await prisma.staff_leave.create({
    data: {
      staff_leave_uuid: `sl_${crypto.randomUUID()}`,
      staff_id: staffId ?? null,
      from_date: fromDate ? new Date(fromDate) : null,
      to_date: toDate ? new Date(toDate) : null,
      note: note ?? null,
      category: category ?? null,
      status: status ?? null,
    } as any,
  });

  revalidatePath("/staff-leaves");

  return { staff_leave_uuid: leave.staff_leave_uuid };
}
