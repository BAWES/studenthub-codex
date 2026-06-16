"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { z } from "zod";

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

// ---------------------------------------------------------------------------
// Zod schemas (shared with test file — exported for schema-only testing)
// ---------------------------------------------------------------------------

export const getInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
});

export const getInvitationLogSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const markInvitationLogViewedSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
});

export const listInvitationsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  invitationStatus: z.coerce.number().int().optional(),
  staffId: z.coerce.number().int().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export type InvitationDetail = {
  invitationUuid: string;
  candidateId: number | null;
  requestUuid: string;
  storyUuid: string | null;
  invitationStatus: number | null;
  invitationAppSeenAt: string | null;
  invitationEmailSeenAt: string | null;
  invitationSeenIn: number | null;
  invitationSeenVia: string | null;
  invitationCreatedByStaff: number | null;
  invitationUpdatedByStaff: number | null;
  invitationCreatedByCompany: number | null;
  invitationUpdatedByCompany: number | null;
  invitationCreatedAt: string | null;
  invitationUpdatedAt: string | null;
  jobInterestUuid: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  requestTitle: string | null;
  storyTitle: string | null;
};

export type InvitationLogEntry = {
  noteUuid: string;
  noteType: string | null;
  noteText: string | null;
  createdBy: number | null;
  createdAt: string;
};

export type InvitationLogResult = {
  logs: InvitationLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListInvitationsParams = z.input<typeof listInvitationsSchema>;

export type InvitationRow = {
  invitationUuid: string;
  candidateId: number | null;
  requestUuid: string;
  storyUuid: string | null;
  invitationStatus: number | null;
  invitationCreatedAt: string | null;
  candidateName: string | null;
  requestTitle: string | null;
};

export type ListInvitationsResult = {
  invitations: InvitationRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// getInvitation — single invitation detail
// ---------------------------------------------------------------------------

/**
 * Get a single invitation by UUID with related data (candidate, request, story).
 *
 * Mirrors the legacy Yii2 InvitationController actionView($id).
 * Requires the time.read.any capability.
 */
export async function getInvitation(
  params: z.input<typeof getInvitationSchema>,
): Promise<{ invitation: InvitationDetail | null; error?: string }> {
  await requireCapability("time.read.any");

  const parsed = getInvitationSchema.safeParse(params);
  if (!parsed.success) {
    return { invitation: null, error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const row = await prisma.invitation.findUnique({
    where: { invitation_uuid: parsed.data.invitationId },
    include: {
      candidate: {
        select: { candidate_name: true, candidate_email: true },
      },
      request: {
        select: { request_position_title: true },
      },
      job_interest: {
        select: { job_interest_uuid: true },
      },
    },
  });

  if (!row) {
    return { invitation: null, error: "Invitation not found." };
  }

  return {
    invitation: {
      invitationUuid: row.invitation_uuid,
      candidateId: row.candidate_id,
      requestUuid: row.request_uuid,
      storyUuid: row.story_uuid,
      invitationStatus: row.invitation_status,
      invitationAppSeenAt: row.invitation_app_seen_at?.toISOString() ?? null,
      invitationEmailSeenAt: row.invitation_email_seen_at?.toISOString() ?? null,
      invitationSeenIn: row.invitation_seen_in,
      invitationSeenVia: row.invitation_seen_via,
      invitationCreatedByStaff: row.invitation_created_by_staff,
      invitationUpdatedByStaff: row.invitation_updated_by_staff,
      invitationCreatedByCompany: row.invitation_created_by_company,
      invitationUpdatedByCompany: row.invitation_updated_by_company,
      invitationCreatedAt: row.invitation_created_at?.toISOString() ?? null,
      invitationUpdatedAt: row.invitation_updated_at?.toISOString() ?? null,
      jobInterestUuid: row.job_interest_uuid,
      candidateName: row.candidate?.candidate_name ?? null,
      candidateEmail: row.candidate?.candidate_email ?? null,
      requestTitle: row.request?.request_position_title ?? null,
      storyTitle: null, // story has no title field
    },
  };
}

// ---------------------------------------------------------------------------
// getInvitationLog — invitation log/activity (notes)
// ---------------------------------------------------------------------------

/**
 * Get activity log entries (notes) for an invitation.
 *
 * Mirrors the legacy Yii2 InvitationController actionLog().
 * Returns notes linked to the invitation, paginated, newest first.
 */
export async function getInvitationLog(
  params: z.input<typeof getInvitationLogSchema>,
): Promise<InvitationLogResult & { error?: string }> {
  await requireCapability("time.read.any");

  const parsed = getInvitationLogSchema.safeParse(params);
  if (!parsed.success) {
    return { logs: [], total: 0, page: 1, limit: 20, totalPages: 0, error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const { invitationId, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = { invitation_uuid: invitationId };

  const [rows, total] = await Promise.all([
    prisma.note.findMany({
      where,
      skip,
      take: limit,
      orderBy: { note_created_datetime: "desc" },
    }),
    prisma.note.count({ where }),
  ]);

  return {
    logs: rows.map((r) => ({
      noteUuid: r.note_uuid,
      noteType: r.note_type,
      noteText: r.note_text,
      createdBy: r.created_by,
      createdAt: r.note_created_datetime.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// markInvitationLogViewed — mark invitation log as viewed
// ---------------------------------------------------------------------------

/**
 * Mark an invitation's log as viewed by setting invitation_app_seen_at.
 *
 * Mirrors the legacy Yii2 InvitationController actionLogViewed().
 * Updates the timestamp so the UI knows the user has seen the latest activity.
 */
export async function markInvitationLogViewed(
  params: z.input<typeof markInvitationLogViewedSchema>,
): Promise<{ success: boolean; error?: string }> {
  await requireCapability("time.read.any");

  const parsed = markInvitationLogViewedSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const existing = await prisma.invitation.findUnique({
    where: { invitation_uuid: parsed.data.invitationId },
    select: { invitation_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Invitation not found." };
  }

  await prisma.invitation.update({
    where: { invitation_uuid: parsed.data.invitationId },
    data: { invitation_app_seen_at: new Date() },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// listInvitations — paginated invitation list with filters
// ---------------------------------------------------------------------------

/**
 * List invitations with pagination and filters.
 *
 * Mirrors the legacy Yii2 InvitationController actionList().
 * Filters: candidateId, requestUuid, storyUuid, invitationStatus, staffId, date range.
 */
export async function listInvitations(
  params: ListInvitationsParams = {},
): Promise<ListInvitationsResult> {
  await requireCapability("time.read.any");

  const { candidateId, requestUuid, storyUuid, invitationStatus, staffId, dateFrom, dateTo, page, limit } =
    listInvitationsSchema.parse(params);

  const where: Record<string, unknown> = {};

  if (candidateId !== undefined) where.candidate_id = candidateId;
  if (requestUuid !== undefined) where.request_uuid = requestUuid;
  if (storyUuid !== undefined) where.story_uuid = storyUuid;
  if (invitationStatus !== undefined) where.invitation_status = invitationStatus;
  if (staffId !== undefined) where.invitation_created_by_staff = staffId;

  if (dateFrom !== undefined || dateTo !== undefined) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }
    where.invitation_created_at = dateFilter;
  }

  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.invitation.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { invitation_created_at: "desc" },
      include: {
        candidate: {
          select: { candidate_name: true },
        },
        request: {
          select: { request_position_title: true },
        },
      },
    }),
    prisma.invitation.count({ where: where as any }),
  ]);

  return {
    invitations: rows.map((r) => ({
      invitationUuid: r.invitation_uuid,
      candidateId: r.candidate_id,
      requestUuid: r.request_uuid,
      storyUuid: r.story_uuid,
      invitationStatus: r.invitation_status,
      invitationCreatedAt: r.invitation_created_at?.toISOString() ?? null,
      candidateName: (r as any).candidate?.candidate_name ?? null,
      requestTitle: (r as any).request?.request_position_title ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
