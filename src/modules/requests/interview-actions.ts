"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

export async function scheduleInterviewAction(formData: FormData) {
  const session = await requireCapability("request.interview");

  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const candidateId = Number(formData.get("candidate_id"));
  const applicationUuid = String(formData.get("application_uuid") ?? "").trim() || null;
  const interviewAt = String(formData.get("interview_at") ?? "").trim();
  const internalNote = String(formData.get("internal_note") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid || !Number.isInteger(candidateId) || candidateId <= 0 || !interviewAt) {
    redirect(`${detailPath}?notice=missing-interview-fields` as Route);
  }

  const parsedInterviewAt = new Date(interviewAt);
  if (isNaN(parsedInterviewAt.getTime())) {
    redirect(`${detailPath}?notice=invalid-interview-at` as Route);
  }

  const request = await prisma.request.findFirst({
    where: session.role === "staff"
      ? { request_uuid: requestUuid, staff_id: Number(session.id) }
      : { request_uuid: requestUuid },
    select: { request_uuid: true }
  });

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!request || !candidate) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();
  const interviewUuid = `interview_${crypto.randomUUID()}`;
  const staffId = Number(session.id);

  await prisma.$transaction([
    prisma.request_interview.create({
      data: {
        request_interview_uuid: interviewUuid,
        application_uuid: applicationUuid ?? interviewUuid,
        request_uuid: requestUuid,
        candidate_id: candidateId,
        interview_at: parsedInterviewAt,
        status: 0,
        staff_id: staffId,
        internal_note: internalNote,
        created_at: now,
        updated_at: now
      }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=interview-scheduled` as Route);
}

export async function updateInterviewAction(formData: FormData) {
  const session = await requireCapability("request.interview");

  const interviewUuid = String(formData.get("interview_uuid") ?? "").trim();
  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const status = Number(formData.get("status"));
  const interviewNote = String(formData.get("interview_note") ?? "").trim() || null;
  const internalNote = String(formData.get("internal_note") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!interviewUuid || !requestUuid) {
    redirect(`${detailPath}?notice=missing-fields` as Route);
  }

  if (session.role === "staff") {
    const owned = await prisma.request.findFirst({
      where: { request_uuid: requestUuid, staff_id: Number(session.id) },
      select: { request_uuid: true }
    });
    if (!owned) redirect(`${detailPath}?notice=not-found` as Route);
  }

  const interview = await prisma.request_interview.findFirst({
    where: { request_interview_uuid: interviewUuid, request_uuid: requestUuid },
    select: { request_interview_uuid: true }
  });

  if (!interview) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();

  const data: Record<string, unknown> = { updated_at: now };
  if (Number.isInteger(status)) data.status = status;
  if (interviewNote !== null) data.interview_note = interviewNote;
  if (internalNote !== null) data.internal_note = internalNote;

  await prisma.$transaction([
    prisma.request_interview.update({
      where: { request_interview_uuid: interviewUuid },
      data
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=interview-updated` as Route);
}
