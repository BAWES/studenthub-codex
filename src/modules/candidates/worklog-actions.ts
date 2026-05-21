"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Status constants
// ---------------------------------------------------------------------------

const WORK_LOG_APPROVED = 1;
const WORK_LOG_REJECTED = 2;
const APPEAL_RESOLVED = 1;
const APPEAL_REJECTED = 2;

// ---------------------------------------------------------------------------
// Scope helpers
// ---------------------------------------------------------------------------

async function verifyStaffScope(staffId: number, candidateId: number) {
  const history = await prisma.candidate_work_history.findFirst({
    where: { staff_id: staffId, candidate_id: candidateId },
    select: { id: true },
  });
  return history !== null;
}

async function resolveWorkLogScope(workLogUuid: string, staffId: number, role: string) {
  const workLog = await prisma.candidate_working_hour.findFirst({
    where: { candidate_working_hour_uuid: workLogUuid },
    select: {
      candidate_working_hour_uuid: true,
      candidate_id: true,
      store_id: true,
      store: { select: { company_id: true } },
    },
  });

  if (!workLog) return { error: "Work log not found." };
  if (workLog.candidate_id === null) return { error: "Work log has no associated candidate." };

  if (role !== "admin") {
    const inScope = await verifyStaffScope(staffId, workLog.candidate_id);
    if (!inScope) return { error: "You are not assigned to this candidate." };
  }

  return { workLog };
}

async function resolveAppealScope(appealUuid: string, staffId: number, role: string) {
  const appeal = await prisma.candidate_working_hour_appeal.findFirst({
    where: { appeal_uuid: appealUuid },
    select: {
      appeal_uuid: true,
      candidate_id: true,
      candidate_working_hour_uuid: true,
      status: true,
    },
  });

  if (!appeal) return { error: "Appeal not found." };

  if (role !== "admin") {
    const inScope = await verifyStaffScope(staffId, appeal.candidate_id);
    if (!inScope) return { error: "You are not assigned to this candidate." };
  }

  return { appeal };
}

// ---------------------------------------------------------------------------
// Approve / reject work log entries
// ---------------------------------------------------------------------------

export async function approveWorkLog(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const workLogUuid = String(formData.get("workLogUuid") ?? "");

  if (!workLogUuid) return { error: "Missing work log identifier." };

  const resolved = await resolveWorkLogScope(workLogUuid, staffId, session.role);
  if ("error" in resolved) return { error: resolved.error };

  await prisma.candidate_working_hour.update({
    where: { candidate_working_hour_uuid: workLogUuid },
    data: { status: WORK_LOG_APPROVED, updated_at: new Date() },
  });

  revalidatePath("/staff/candidates");
  revalidatePath("/candidate/work-logs");
  return { error: "" };
}

export async function rejectWorkLog(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const workLogUuid = String(formData.get("workLogUuid") ?? "");

  if (!workLogUuid) return { error: "Missing work log identifier." };

  const resolved = await resolveWorkLogScope(workLogUuid, staffId, session.role);
  if ("error" in resolved) return { error: resolved.error };

  await prisma.candidate_working_hour.update({
    where: { candidate_working_hour_uuid: workLogUuid },
    data: { status: WORK_LOG_REJECTED, updated_at: new Date() },
  });

  revalidatePath("/staff/candidates");
  revalidatePath("/candidate/work-logs");
  return { error: "" };
}

// ---------------------------------------------------------------------------
// Resolve work log appeals
// ---------------------------------------------------------------------------

export async function resolveWorkLogAppeal(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const appealUuid = String(formData.get("appealUuid") ?? "");
  const resolution = String(formData.get("resolution") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!appealUuid) return { error: "Missing appeal identifier." };
  if (resolution !== "approve" && resolution !== "reject") return { error: "Invalid resolution. Use \"approve\" or \"reject\"." };

  const resolved = await resolveAppealScope(appealUuid, staffId, session.role);
  if ("error" in resolved) return { error: resolved.error };

  const newStatus = resolution === "approve" ? APPEAL_RESOLVED : APPEAL_REJECTED;
  const now = new Date();

  const operations: any[] = [
    prisma.candidate_working_hour_appeal.update({
      where: { appeal_uuid: appealUuid },
      data: { status: newStatus, updated_at: now },
    }),
  ];

  if (note) {
    operations.push(
      prisma.candidate_working_hour_appeal_updates.create({
        data: {
          appeal_update_uuid: `appeal_update_${crypto.randomUUID()}`,
          appeal_uuid: appealUuid,
          update: resolution === "approve" ? "Appeal approved" : "Appeal rejected",
          detail: note,
          created_by: staffId,
          created_at: now,
          updated_at: now,
        },
      })
    );
  }

  await prisma.$transaction(operations);

  revalidatePath("/staff/candidates");
  revalidatePath("/candidate/work-logs");
  return { error: "" };
}

// ---------------------------------------------------------------------------
// Add work log feedback
// ---------------------------------------------------------------------------

export async function addWorkLogFeedback(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const workLogUuid = String(formData.get("workLogUuid") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const ratingStr = formData.get("rating");
  const isPublic = formData.get("isPublic") === "true";

  if (!workLogUuid) return { error: "Missing work log identifier." };
  if (!note && !reason) return { error: "Please provide a note or reason." };

  const resolved = await resolveWorkLogScope(workLogUuid, staffId, session.role);
  if ("error" in resolved) return { error: resolved.error };

  if (resolved.workLog.store_id === null) return { error: "Work log has no associated store." };

  const rating = ratingStr === "positive" ? true : ratingStr === "negative" ? false : null;

  await prisma.candidate_work_log_feedback.create({
    data: {
      cwlf_uuid: `cwlf_${crypto.randomUUID()}`,
      candidate_id: resolved.workLog.candidate_id!,
      store_id: resolved.workLog.store_id,
      company_id: resolved.workLog.store?.company_id ?? 0,
      date: new Date(),
      candidate_working_hour_uuid: workLogUuid,
      status: 1,
      note: note || undefined,
      reason: reason || undefined,
      is_public: isPublic,
      rating,
      created_by: `staff:${staffId}`,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/staff/candidates");
  revalidatePath("/candidate/work-logs");
  return { error: "" };
}

// ---------------------------------------------------------------------------
// Add appeal update note
// ---------------------------------------------------------------------------

export async function addAppealUpdateNote(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const appealUuid = String(formData.get("appealUuid") ?? "");
  const update = String(formData.get("update") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();

  if (!appealUuid) return { error: "Missing appeal identifier." };
  if (!update) return { error: "Please provide an update summary." };

  const resolved = await resolveAppealScope(appealUuid, staffId, session.role);
  if ("error" in resolved) return { error: resolved.error };

  await prisma.candidate_working_hour_appeal_updates.create({
    data: {
      appeal_update_uuid: `appeal_update_${crypto.randomUUID()}`,
      appeal_uuid: appealUuid,
      update,
      detail: detail || undefined,
      created_by: staffId,
      updated_by: staffId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/staff/candidates");
  revalidatePath("/candidate/work-logs");
  return { error: "" };
}
