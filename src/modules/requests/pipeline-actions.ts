"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// Re-exports from individual action files
export { createInvitationAction, updateInvitationStatusAction } from "./invitation-actions";
export { transitionApplicationAction } from "./application-actions";
export { scheduleInterviewAction, updateInterviewAction } from "./interview-actions";

export async function createInterviewEvaluationAction(formData: FormData) {
  const session = await requireCapability("request.interview");

  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const candidateId = Number(formData.get("candidate_id"));
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid || !Number.isInteger(candidateId) || candidateId <= 0) {
    redirect(`${detailPath}?notice=missing-evaluation-fields` as Route);
  }

  const request = await prisma.request.findFirst({
    where: session.role === "staff"
      ? { request_uuid: requestUuid, staff_id: Number(session.id) }
      : { request_uuid: requestUuid },
    select: { request_uuid: true, company_id: true }
  });

  if (!request) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!candidate) {
    redirect(`${detailPath}?notice=candidate-not-found` as Route);
  }

  const now = new Date();
  const evaluationUuid = `iveval_${crypto.randomUUID()}`;
  const staffId = Number(session.id);

  await prisma.$transaction([
    prisma.interview_evaluation.create({
      data: {
        interview_evaluation_uuid: evaluationUuid,
        request_uuid: requestUuid,
        company_id: request.company_id,
        candidate_id: candidateId,
        staff_id: staffId,
        created_at: now,
        updated_at: now
      }
    }),
    prisma.request_activity.create({
      data: {
        activity_uuid: `req_act_${crypto.randomUUID()}`,
        request_uuid: requestUuid,
        staff_id: staffId,
        activity_detail: "Interview evaluation created.",
        activity_created_datetime: now,
        activity_updated_datetime: now
      }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=evaluation-created` as Route);
}

export async function addInterviewEvaluationNoteAction(formData: FormData) {
  const session = await requireCapability("request.interview");

  const evaluationUuid = String(formData.get("interview_evaluation_uuid") ?? "").trim();
  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const noteText = String(formData.get("note") ?? "").trim();
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!evaluationUuid || !requestUuid || !noteText) {
    redirect(`${detailPath}?notice=missing-evaluation-note-fields` as Route);
  }

  const evaluation = await prisma.interview_evaluation.findFirst({
    where: { interview_evaluation_uuid: evaluationUuid, request_uuid: requestUuid },
    select: { interview_evaluation_uuid: true, request_uuid: true }
  });

  if (!evaluation) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  // Staff scope: verify the parent request is assigned to this staff member
  if (session.role === "staff") {
    const request = await prisma.request.findFirst({
      where: { request_uuid: requestUuid, staff_id: Number(session.id) },
      select: { request_uuid: true }
    });
    if (!request) {
      redirect(`${detailPath}?notice=not-found` as Route);
    }
  }

  const now = new Date();
  const staffId = Number(session.id);
  const noteVersionUuid = `ienv_${crypto.randomUUID()}`;
  const noteUuid = `ien_${crypto.randomUUID()}`;

  await prisma.$transaction([
    prisma.interview_evaluation_note_version.create({
      data: {
        ienv_uuid: noteVersionUuid,
        interview_evaluation_uuid: evaluationUuid,
        version: 1,
        staff_id: staffId,
        created_at: now,
        updated_at: now
      }
    }),
    prisma.interview_evaluation_note.create({
      data: {
        ien_uuid: noteUuid,
        ienv_uuid: noteVersionUuid,
        note: noteText
      }
    }),
    prisma.interview_evaluation.update({
      where: { interview_evaluation_uuid: evaluationUuid },
      data: { updated_at: now }
    }),
    prisma.request_activity.create({
      data: {
        activity_uuid: `req_act_${crypto.randomUUID()}`,
        request_uuid: requestUuid,
        staff_id: staffId,
        activity_detail: "Interview evaluation note added.",
        activity_created_datetime: now,
        activity_updated_datetime: now
      }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=evaluation-note-added` as Route);
}
