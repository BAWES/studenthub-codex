"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

/**
 * Create a new hiring request for a company.
 * Staff can create requests for their assigned companies. Admin can create for any.
 */
export async function createRequestAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const companyId = Number(formData.get("company_id"));
  const positionTitle = String(formData.get("position_title") ?? "").trim();
  const jobDescription = String(formData.get("job_description") ?? "").trim();
  const compensation = String(formData.get("compensation") ?? "").trim();
  const numberOfEmployees = Number(formData.get("number_of_employees") ?? 0);
  const location = String(formData.get("location") ?? "").trim();
  const additionalInfo = String(formData.get("additional_info") ?? "").trim();
  const priority = Number(formData.get("priority") ?? 0);
  const skills = String(formData.get("skills") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? (session.role === "admin" ? "/admin/requests" : "/staff/requests")).trim();

  if (!positionTitle || !Number.isInteger(companyId) || companyId <= 0 || !(numberOfEmployees > 0)) {
    redirect(`${redirectTo}?notice=missing-fields` as Route);
  }

  const company = await prisma.company.findUnique({
    where: { company_id: companyId, deleted: 0 },
    select: { company_id: true }
  });

  if (!company) {
    redirect(`${redirectTo}?notice=company-not-found` as Route);
  }

  const staffId = session.role === "staff" ? Number(session.id) : null;
  const now = new Date();
  const requestUuid = `request_${crypto.randomUUID()}`;

  const skillList = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  await prisma.$transaction([
    prisma.request.create({
      data: {
        request_uuid: requestUuid,
        company_id: companyId,
        staff_id: staffId,
        request_position_title: positionTitle,
        request_job_description: jobDescription || "No description provided.",
        request_compensation: compensation || "Not set",
        request_number_of_employees: numberOfEmployees,
        request_location: location || null,
        request_additional_info: additionalInfo || null,
        request_status: "pending",
        request_priority: priority,
        request_created_by: Number(session.id),
        request_updated_by: Number(session.id),
        request_created_datetime: now,
        request_updated_datetime: now
      }
    }),
    ...skillList.map((skill) =>
      prisma.request_skill.create({
        data: {
          request_uuid: requestUuid,
          skill
        }
      })
    )
  ]);

  revalidatePath(redirectTo);
  revalidatePath("/admin/requests");
  revalidatePath("/staff/requests");
  redirect(`${redirectTo}/${requestUuid}?notice=request-created` as Route);
}

/**
 * Update an existing request's status and details.
 */
export async function updateRequestAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const positionTitle = String(formData.get("position_title") ?? "").trim();
  const jobDescription = String(formData.get("job_description") ?? "").trim();
  const compensation = String(formData.get("compensation") ?? "").trim();
  const numberOfEmployees = Number(formData.get("number_of_employees"));
  const location = String(formData.get("location") ?? "").trim();
  const additionalInfo = String(formData.get("additional_info") ?? "").trim();
  const newStatus = String(formData.get("status") ?? "").trim();
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid) {
    redirect(basePath as Route);
  }

  const request = await prisma.request.findFirst({
    where: session.role === "staff"
      ? { request_uuid: requestUuid, staff_id: Number(session.id) }
      : { request_uuid: requestUuid },
    select: { request_uuid: true }
  });

  if (!request) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();

  await prisma.request.update({
    where: { request_uuid: requestUuid },
    data: {
      ...(positionTitle ? { request_position_title: positionTitle } : {}),
      ...(jobDescription ? { request_job_description: jobDescription } : {}),
      ...(compensation ? { request_compensation: compensation } : {}),
      ...(numberOfEmployees && numberOfEmployees > 0 ? { request_number_of_employees: numberOfEmployees } : {}),
      ...(location ? { request_location: location } : {}),
      ...(additionalInfo ? { request_additional_info: additionalInfo } : {}),
      ...(newStatus ? { request_status: newStatus as any } : {}),
      request_updated_by: Number(session.id),
      request_updated_datetime: now
    }
  });

  revalidatePath(detailPath);
  revalidatePath(basePath);
  revalidatePath("/admin/requests");
  revalidatePath("/staff/requests");
  redirect(`${detailPath}?notice=request-updated` as Route);
}

/**
 * Assign a staff member to a request (admin only).
 */
export async function assignStaffToRequestAction(formData: FormData) {
  const session = await requireCapability("admin.system");

  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const staffId = Number(formData.get("staff_id"));

  if (!requestUuid || !Number.isInteger(staffId) || staffId <= 0) {
    redirect(`/admin/requests/${requestUuid}?notice=invalid-params` as Route);
  }

  const staff = await prisma.staff.findFirst({
    where: { staff_id: staffId, deleted: 0 },
    select: { staff_id: true }
  });

  if (!staff) {
    redirect(`/admin/requests/${requestUuid}?notice=staff-not-found` as Route);
  }

  const now = new Date();

  await prisma.request.update({
    where: { request_uuid: requestUuid },
    data: {
      staff_id: staffId,
      request_assigned_at: now,
      request_updated_by: Number(session.id),
      request_updated_datetime: now
    }
  });

  revalidatePath(`/admin/requests/${requestUuid}`);
  revalidatePath("/admin/requests");
  revalidatePath("/staff/requests");
  redirect(`/admin/requests/${requestUuid}?notice=staff-assigned` as Route);
}

/**
 * Transition a request to a specific status.
 */
export async function transitionRequestStatusAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const toStatus = String(formData.get("to_status") ?? "").trim();
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid || !toStatus) {
    redirect(`${detailPath}?notice=missing-fields` as Route);
  }

  const request = await prisma.request.findFirst({
    where: session.role === "staff"
      ? { request_uuid: requestUuid, staff_id: Number(session.id) }
      : { request_uuid: requestUuid },
    select: { request_uuid: true, request_status: true }
  });

  if (!request) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: {
        request_status: toStatus as any,
        request_updated_by: Number(session.id),
        request_updated_datetime: now
      }
    }),
    prisma.request_activity.create({
      data: {
        activity_uuid: `req_act_${crypto.randomUUID()}`,
        request_uuid: requestUuid,
        staff_id: Number(session.id),
        activity_detail: `Request status changed from "${request.request_status ?? "Unknown"}" to "${toStatus}".`,
        activity_created_datetime: now,
        activity_updated_datetime: now
      }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=status-changed` as Route);
}
