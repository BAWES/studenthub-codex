"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

export async function transitionApplicationAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const applicationUuid = String(formData.get("application_uuid") ?? "").trim();
  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const newStatus = Number(formData.get("status"));
  const note = String(formData.get("note") ?? "").trim() || null;
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!applicationUuid || !requestUuid || !Number.isInteger(newStatus)) {
    redirect(`${detailPath}?notice=missing-fields` as Route);
  }

  const application = await prisma.request_application.findFirst({
    where: { application_uuid: applicationUuid, request_uuid: requestUuid },
    select: { application_uuid: true, candidate_id: true }
  });

  if (!application) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();
  const staffId = Number(session.id);

  const operations: any[] = [
    prisma.request_application.update({
      where: { application_uuid: applicationUuid },
      data: { status: newStatus, updated_at: now }
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
          candidate_id: application.candidate_id,
          note_type: "Application",
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
  redirect(`${detailPath}?notice=application-updated` as Route);
}
