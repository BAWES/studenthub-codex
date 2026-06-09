"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getCandidateWorkLogDetailSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export const approveWorkLogAppealSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
});

export const rejectWorkLogAppealSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
  reason: z.string().min(1, "Rejection reason is required").max(1000),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateWorkLogDetailInput = z.input<typeof getCandidateWorkLogDetailSchema>;
export type ApproveWorkLogAppealInput = z.input<typeof approveWorkLogAppealSchema>;
export type RejectWorkLogAppealInput = z.input<typeof rejectWorkLogAppealSchema>;

export type WorkLogAppealDetail = {
  appeal_uuid: string;
  candidate_working_hour_uuid: string;
  candidate_id: number;
  reason: string | null;
  status: number;
  created_at: Date | null;
  updated_at: Date | null;
};

export type WorkLogDetailForAppeal = {
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
};

// ---------------------------------------------------------------------------
// getCandidateWorkLogDetail
// ---------------------------------------------------------------------------

/**
 * Get a single work log by UUID with full detail for the [id] route.
 * Verifies the record belongs to the current candidate.
 */
export async function getCandidateWorkLogDetail(
  workLogUuid: string,
): Promise<WorkLogDetailForAppeal | null> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getCandidateWorkLogDetailSchema.safeParse({ workLogUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const candidateId = Number(session.id);

  const row = await prisma.candidate_working_hour.findFirst({
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
      store: {
        select: {
          store_name: true,
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
    store_name: row.store?.store_name ?? null,
    company_name: row.store?.company?.company_name ?? null,
  };
}

// ---------------------------------------------------------------------------
// approveWorkLogAppeal — approve a work log appeal by updating status
// ---------------------------------------------------------------------------

/**
 * Approve a work log appeal.
 * Updates the appeal status to approved (1).
 * The caller must have company-time.write permission.
 */
export async function approveWorkLogAppeal(
  data: ApproveWorkLogAppealInput,
): Promise<{ appeal_uuid: string }> {
  await requireCapability("company.time.write");

  const parsed = approveWorkLogAppealSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const existing = await prisma.candidate_working_hour_appeal.findUnique({
    where: { appeal_uuid: parsed.data.appealUuid },
    select: { appeal_uuid: true, status: true },
  });

  if (!existing) {
    throw new Error("Appeal not found");
  }

  await prisma.candidate_working_hour_appeal.update({
    where: { appeal_uuid: parsed.data.appealUuid },
    data: {
      status: 1, // approved
      updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/work-logs");
  return { appeal_uuid: parsed.data.appealUuid };
}

// ---------------------------------------------------------------------------
// rejectWorkLogAppeal — reject a work log appeal with a reason
// ---------------------------------------------------------------------------

/**
 * Reject a work log appeal with a required reason.
 * Updates the appeal status to rejected (2).
 * The caller must have company-time.write permission.
 */
export async function rejectWorkLogAppeal(
  data: RejectWorkLogAppealInput,
): Promise<{ appeal_uuid: string }> {
  await requireCapability("company.time.write");

  const parsed = rejectWorkLogAppealSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const existing = await prisma.candidate_working_hour_appeal.findUnique({
    where: { appeal_uuid: parsed.data.appealUuid },
    select: { appeal_uuid: true, status: true },
  });

  if (!existing) {
    throw new Error("Appeal not found");
  }

  await prisma.candidate_working_hour_appeal.update({
    where: { appeal_uuid: parsed.data.appealUuid },
    data: {
      status: 2, // rejected
      reason: parsed.data.reason,
      updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/work-logs");
  return { appeal_uuid: parsed.data.appealUuid };
}
