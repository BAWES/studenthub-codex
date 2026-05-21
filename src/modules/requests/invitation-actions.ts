"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

export async function createInvitationAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const requestUuid = String(formData.get("request_uuid") ?? "");
  const candidateId = Number(formData.get("candidate_id"));
  const suggestionUuid = String(formData.get("suggestion_uuid") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid || !Number.isInteger(candidateId) || candidateId <= 0) {
    redirect(`${detailPath}?notice=missing-invitation-fields` as Route);
  }

  const request = await prisma.request.findFirst({
    where: session.role === "staff"
      ? { request_uuid: requestUuid, staff_id: Number(session.id) }
      : { request_uuid: requestUuid },
    select: { request_uuid: true, company_id: true, contact_uuid: true }
  });

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!request || !candidate) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const duplicate = await prisma.invitation.findFirst({
    where: { request_uuid: requestUuid, candidate_id: candidateId },
    select: { invitation_uuid: true }
  });

  if (duplicate) {
    redirect(`${detailPath}?notice=duplicate-invitation` as Route);
  }

  const now = new Date();
  const invitationUuid = `invitation_${crypto.randomUUID()}`;
  const staffId = session.role === "staff" ? Number(session.id) : null;

  await prisma.$transaction([
    prisma.invitation.create({
      data: {
        invitation_uuid: invitationUuid,
        request_uuid: requestUuid,
        candidate_id: candidateId,
        story_uuid: suggestionUuid || null,
        invitation_status: 1,
        invitation_created_by_staff: staffId,
        invitation_created_at: now,
        invitation_updated_at: now
      }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=invitation-created` as Route);
}

export async function updateInvitationStatusAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const invitationUuid = String(formData.get("invitation_uuid") ?? "").trim();
  const newStatus = Number(formData.get("status"));
  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!invitationUuid || !Number.isInteger(newStatus) || !requestUuid) {
    redirect(`${detailPath}?notice=missing-fields` as Route);
  }

  if (session.role === "staff") {
    const owned = await prisma.request.findFirst({
      where: { request_uuid: requestUuid, staff_id: Number(session.id) },
      select: { request_uuid: true }
    });
    if (!owned) redirect(`${detailPath}?notice=not-found` as Route);
  }

  const invitation = await prisma.invitation.findFirst({
    where: { invitation_uuid: invitationUuid, request_uuid: requestUuid },
    select: { invitation_uuid: true }
  });

  if (!invitation) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();
  const staffId = session.role === "staff" ? Number(session.id) : null;

  await prisma.$transaction([
    prisma.invitation.update({
      where: { invitation_uuid: invitationUuid },
      data: {
        invitation_status: newStatus,
        invitation_updated_by_staff: staffId,
        invitation_updated_at: now
      }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=invitation-updated` as Route);
}
