"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

export async function createStoryAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const suggestionUuid = String(formData.get("suggestion_uuid") ?? "").trim() || null;
  const numberOfEmployees = Number(formData.get("number_of_employees")) || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid) {
    redirect(basePath as Route);
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

  const now = new Date();
  const storyUuid = `story_${crypto.randomUUID()}`;
  const staffId = Number(session.id);

  const operations: any[] = [
    prisma.story.create({
      data: {
        story_uuid: storyUuid,
        request_uuid: requestUuid,
        suggestion_uuid: suggestionUuid,
        staff_id: staffId,
        number_of_employees: numberOfEmployees,
        story_status: 0,
        story_created_at: now,
        story_last_updated_at: now
      }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ];

  if (note) {
    operations.push(
      prisma.note.create({
        data: {
          note_uuid: `note_${crypto.randomUUID()}`,
          request_uuid: requestUuid,
          story_uuid: storyUuid,
          company_id: request.company_id,
          note_type: "Story",
          note_text: note,
          created_by: staffId,
          updated_by: staffId,
          note_created_datetime: now,
          note_updated_datetime: now
        }
      })
    );
  }

  await prisma.$transaction(operations);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=story-created` as Route);
}

export async function updateStoryStatusAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const storyUuid = String(formData.get("story_uuid") ?? "").trim();
  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const newStatus = Number(formData.get("status"));
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!storyUuid || !requestUuid || !Number.isInteger(newStatus)) {
    redirect(`${detailPath}?notice=missing-fields` as Route);
  }

  if (session.role === "staff") {
    const owned = await prisma.request.findFirst({
      where: { request_uuid: requestUuid, staff_id: Number(session.id) },
      select: { request_uuid: true }
    });
    if (!owned) redirect(`${detailPath}?notice=not-found` as Route);
  }

  const story = await prisma.story.findFirst({
    where: { story_uuid: storyUuid, request_uuid: requestUuid },
    select: { story_uuid: true }
  });

  if (!story) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.story.update({
      where: { story_uuid: storyUuid },
      data: { story_status: newStatus, story_last_updated_at: now }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=story-updated` as Route);
}
