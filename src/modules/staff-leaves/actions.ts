"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  staffLeaveListItemSchema,
  listStaffLeavesResultSchema,
  createStaffLeaveResultSchema,
  listStaffLeavesSchema,
  getStaffLeaveSchema,
  createStaffLeaveSchema,
  type StaffLeaveListItem,
  type ListStaffLeavesResult,
  type CreateStaffLeaveResult,
} from "./schemas";

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
      include: { staff: true },
    }),
    prisma.staff_leave.count({ where: where as any }),
  ]);

  const result = {
    leaves: leaves.map((l: any): StaffLeaveListItem => ({
      staff_leave_uuid: l.staff_leave_uuid,
      staff_id: l.staff_id ?? null,
      staff_name:
        l.staff?.first_name
          ? `${l.staff.first_name ?? ""} ${l.staff.last_name ?? ""}`.trim() || null
          : null,
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

  // Validate output shape
  const outputParsed = listStaffLeavesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-leaves] listStaffLeaves output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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
    include: { staff: true },
  });

  if (!leave) return null;

  const raw = leave as any;
  const item = {
    staff_leave_uuid: raw.staff_leave_uuid,
    staff_id: raw.staff_id ?? null,
    staff_name:
      raw.staff?.first_name
        ? `${raw.staff.first_name ?? ""} ${raw.staff.last_name ?? ""}`.trim() || null
        : null,
    from_date: raw.from_date?.toISOString() ?? null,
    to_date: raw.to_date?.toISOString() ?? null,
    note: raw.note ?? null,
    category: raw.category ?? null,
    status: raw.status ?? null,
    created_at: raw.created_at?.toISOString() ?? null,
    updated_at: raw.updated_at?.toISOString() ?? null,
  };

  // Validate output shape
  const outputParsed = staffLeaveListItemSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-leaves] getStaffLeave output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item;
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

  const result = { staff_leave_uuid: leave.staff_leave_uuid };

  // Validate output shape
  const outputParsed = createStaffLeaveResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-leaves] createStaffLeave output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
