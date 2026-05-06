"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

export async function addCandidateSuggestionAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const requestUuid = String(formData.get("request_uuid") ?? "");
  const candidateId = Number(formData.get("candidate_id"));
  const reason = String(formData.get("reason") ?? "").trim();
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid || !Number.isInteger(candidateId) || candidateId <= 0 || !reason) {
    redirect(`${detailPath}?notice=missing-suggestion` as Route);
  }

  const request = await prisma.request.findFirst({
    where: session.role === "staff" ? { request_uuid: requestUuid, staff_id: Number(session.id) } : { request_uuid: requestUuid },
    select: { request_uuid: true, company_id: true, contact_uuid: true }
  });

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!request || !candidate) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const duplicate = await prisma.suggestion.findFirst({
    where: { request_uuid: requestUuid, candidate_id: candidateId, suggestion_status: 1 },
    select: { suggestion_uuid: true }
  });

  if (duplicate) {
    redirect(`${detailPath}?notice=duplicate-suggestion` as Route);
  }

  const now = new Date();
  const noteUuid = `note_${crypto.randomUUID()}`;
  const suggestionUuid = `suggestion_${crypto.randomUUID()}`;
  const staffId = session.role === "staff" ? Number(session.id) : null;

  await prisma.$transaction([
    prisma.note.create({
      data: {
        note_uuid: noteUuid,
        company_id: request.company_id,
        candidate_id: candidateId,
        request_uuid: requestUuid,
        contact_uuid: request.contact_uuid,
        note_type: "Suggestion",
        note_text: reason,
        created_by: staffId,
        updated_by: staffId,
        note_created_datetime: now,
        note_updated_datetime: now
      }
    }),
    prisma.suggestion.create({
      data: {
        suggestion_uuid: suggestionUuid,
        request_uuid: requestUuid,
        candidate_id: candidateId,
        note_uuid: noteUuid,
        suggestion_status: 1,
        suggestion_datetime: now
      }
    }),
    prisma.note.update({
      where: { note_uuid: noteUuid },
      data: { suggestion_uuid: suggestionUuid }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=suggestion-added` as Route);
}
