"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

export async function addCandidateNoteAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const candidateId = Number(formData.get("candidate_id"));
  const noteText = String(formData.get("note_text") ?? "").trim();
  const requestUuid = String(formData.get("request_uuid") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const returnPath = requestUuid
    ? (`${basePath}/${requestUuid}` as Route)
    : session.role === "admin"
      ? `/admin/candidates/${candidateId}` as Route
      : `/staff/candidates?candidate=${candidateId}` as Route;

  if (!Number.isInteger(candidateId) || candidateId <= 0 || !noteText) {
    redirect(`${returnPath}?notice=missing-fields` as Route);
  }

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!candidate) {
    redirect(`${returnPath}?notice=not-found` as Route);
  }

  const now = new Date();
  const staffId = Number(session.id);

  await prisma.candidate_note.create({
    data: {
      candidate_note_uuid: `cnote_${crypto.randomUUID()}`,
      candidate_id: candidateId,
      note_text: noteText,
      created_by: staffId,
      updated_by: staffId,
      note_created_datetime: now,
      note_updated_datetime: now
    }
  });

  revalidatePath(returnPath);
  if (requestUuid) revalidatePath(`${basePath}/${requestUuid}`);
  redirect(`${returnPath}?notice=note-added` as Route);
}

export async function addCandidateTagAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const candidateId = Number(formData.get("candidate_id"));
  const tag = String(formData.get("tag") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const requestUuid = String(formData.get("request_uuid") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const returnPath = requestUuid
    ? (`${basePath}/${requestUuid}` as Route)
    : session.role === "admin"
      ? `/admin/candidates/${candidateId}` as Route
      : `/staff/candidates?candidate=${candidateId}` as Route;

  if (!Number.isInteger(candidateId) || candidateId <= 0 || !tag) {
    redirect(`${returnPath}?notice=missing-fields` as Route);
  }

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!candidate) {
    redirect(`${returnPath}?notice=not-found` as Route);
  }

  const now = new Date();
  const staffId = Number(session.id);

  await prisma.candidate_tag.create({
    data: {
      candidate_id: candidateId,
      tag,
      reason,
      created_by: staffId,
      created_at: now,
      updated_at: now
    }
  });

  revalidatePath(returnPath);
  if (requestUuid) revalidatePath(`${basePath}/${requestUuid}`);
  redirect(`${returnPath}?notice=tag-added` as Route);
}

export async function removeCandidateTagAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const tagId = Number(formData.get("tag_id"));
  const candidateId = Number(formData.get("candidate_id"));
  const requestUuid = String(formData.get("request_uuid") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const returnPath = requestUuid
    ? (`${basePath}/${requestUuid}` as Route)
    : session.role === "admin"
      ? `/admin/candidates/${candidateId}` as Route
      : `/staff/candidates?candidate=${candidateId}` as Route;

  if (!Number.isInteger(tagId) || tagId <= 0) {
    redirect(`${returnPath}?notice=missing-fields` as Route);
  }

  await prisma.candidate_tag.update({
    where: { tag_id: tagId },
    data: { deleted: 1, updated_at: new Date() }
  });

  revalidatePath(returnPath);
  if (requestUuid) revalidatePath(`${basePath}/${requestUuid}`);
  redirect(`${returnPath}?notice=tag-removed` as Route);
}

export async function addCandidateWarningAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const candidateId = Number(formData.get("candidate_id"));
  const message = String(formData.get("message") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const requestUuid = String(formData.get("request_uuid") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const returnPath = requestUuid
    ? (`${basePath}/${requestUuid}` as Route)
    : session.role === "admin"
      ? `/admin/candidates/${candidateId}` as Route
      : `/staff/candidates?candidate=${candidateId}` as Route;

  if (!Number.isInteger(candidateId) || candidateId <= 0 || !message) {
    redirect(`${returnPath}?notice=missing-fields` as Route);
  }

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!candidate) {
    redirect(`${returnPath}?notice=not-found` as Route);
  }

  const now = new Date();
  const staffId = Number(session.id);

  await prisma.candidate_warning.create({
    data: {
      candidate_id: candidateId,
      title: title ?? "Staff warning",
      message,
      created_by: staffId,
      updated_by: staffId,
      created_at: now,
      updated_at: now
    }
  });

  revalidatePath(returnPath);
  if (requestUuid) revalidatePath(`${basePath}/${requestUuid}`);
  redirect(`${returnPath}?notice=warning-added` as Route);
}
