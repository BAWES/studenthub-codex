"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// StoryController — Server Actions
// ---------------------------------------------------------------------------
// Manages stories (work assignments tied to a request/position).
// Ported from Yii2 staff/modules/v1/controllers/StoryController.php
// Actions: listStories, getStory, assignStory, getActiveStory, listOldStories
//
// NOTE: Zod schemas and types are in story-schemas.ts because "use server"
// files can only export async functions.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

import {
  listStoriesSchema,
  getStorySchema,
  assignStorySchema,
  getActiveStorySchema,
  listOldStoriesSchema,
} from "./story-schemas";

// ---------------------------------------------------------------------------
// listStories — list stories with pagination and optional filters
// ---------------------------------------------------------------------------

export async function listStories(
  params: Record<string, unknown> = {},
): Promise<import("./story-schemas").ListStoriesResult> {
  await requireCapability("admin.read");

  const parsed = listStoriesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { page, limit, status, keyword, staffId } = parsed.data;

  const where: Record<string, unknown> = {};

  if (status !== undefined) {
    where.story_status = status;
  }
  if (staffId !== undefined) {
    where.staff_id = staffId;
  }

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: where as any,
      include: {
        request: {
          select: {
            request_position_title: true,
            request_position_type: true,
            company: { select: { company_name: true } },
          },
        },
        staff: { select: { staff_name: true } },
      },
      orderBy: { story_created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.story.count({ where: where as any }),
  ]);

  return {
    stories: stories.map((s) => ({
      story_uuid: s.story_uuid,
      request_uuid: s.request_uuid,
      staff_id: s.staff_id,
      number_of_employees: s.number_of_employees,
      story_status: s.story_status,
      is_old: s.is_old,
      story_created_at: s.story_created_at,
      story_last_updated_at: s.story_last_updated_at,
      request: {
        request_position_title: s.request?.request_position_title ?? null,
        request_position_type: s.request?.request_position_type ?? null,
        company: s.request?.company
          ? { company_name: s.request.company.company_name }
          : null,
      },
      staff: s.staff ? { staff_name: s.staff.staff_name } : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getStory — get a single story by UUID with full details
// ---------------------------------------------------------------------------

export async function getStory(
  params: Record<string, unknown>,
): Promise<import("./story-schemas").StoryDetail | null> {
  await requireCapability("admin.read");

  const parsed = getStorySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid story UUID",
    );
  }

  const { storyUuid } = parsed.data;

  const story = await prisma.story.findUnique({
    where: { story_uuid: storyUuid },
    include: {
      request: {
        select: {
          request_position_title: true,
          request_position_type: true,
          request_status: true,
          request_priority: true,
          company: { select: { company_name: true } },
        },
      },
      staff: { select: { staff_name: true } },
      story_activity: {
        select: {
          activity_status: true,
          activity_created_at: true,
          staff: { select: { staff_name: true } },
        },
        orderBy: { activity_created_at: "desc" },
      },
    },
  });

  if (!story) return null;

  return {
    story_uuid: story.story_uuid,
    request_uuid: story.request_uuid,
    staff_id: story.staff_id,
    number_of_employees: story.number_of_employees,
    story_status: story.story_status,
    is_old: story.is_old,
    story_time_spent: story.story_time_spent,
    story_created_at: story.story_created_at,
    story_last_updated_at: story.story_last_updated_at,
    request: {
      request_position_title: story.request?.request_position_title ?? null,
      request_position_type: story.request?.request_position_type ?? null,
      request_status: story.request?.request_status ?? null,
      request_priority: story.request?.request_priority ?? null,
      company: story.request?.company
        ? { company_name: story.request.company.company_name }
        : null,
    },
    staff: story.staff ? { staff_name: story.staff.staff_name } : null,
    story_activity: story.story_activity.map((a) => ({
      activity_status: a.activity_status,
      activity_created_at: a.activity_created_at,
      staff: a.staff ? { staff_name: a.staff.staff_name } : null,
    })),
  };
}

// ---------------------------------------------------------------------------
// assignStory — assign a story to a staff member
// ---------------------------------------------------------------------------

export async function assignStory(
  params: Record<string, unknown>,
): Promise<import("./story-schemas").AssignStoryResult> {
  await requireCapability("admin.write");

  const parsed = assignStorySchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid assign parameters",
    };
  }

  const { storyUuid, staffId } = parsed.data;

  const story = await prisma.story.findUnique({
    where: { story_uuid: storyUuid },
  });

  if (!story) {
    return { operation: "error", message: "Story not found" };
  }

  const staff = await prisma.staff.findUnique({
    where: { staff_id: staffId },
  });

  if (!staff) {
    return { operation: "error", message: "Staff member not found" };
  }

  try {
    await prisma.story.update({
      where: { story_uuid: storyUuid },
      data: {
        staff_id: staffId,
        story_last_updated_at: new Date(),
      },
    });

    return { operation: "success", message: "Story assigned successfully" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to assign story",
    };
  }
}

// ---------------------------------------------------------------------------
// getActiveStory — get active (non-old) stories for a staff member
// ---------------------------------------------------------------------------

export async function getActiveStory(
  params: Record<string, unknown>,
): Promise<import("./story-schemas").ActiveStoryResult> {
  await requireCapability("admin.read");

  const parsed = getActiveStorySchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid staff ID",
    };
  }

  const { staffId } = parsed.data;

  try {
    const stories = await prisma.story.findMany({
      where: {
        staff_id: staffId,
        is_old: false,
      },
      include: {
        request: {
          select: {
            request_position_title: true,
            request_position_type: true,
            company: { select: { company_name: true } },
          },
        },
        staff: { select: { staff_name: true } },
      },
      orderBy: { story_created_at: "desc" },
    });

    return {
      operation: "success",
      stories: stories.map((s) => ({
        story_uuid: s.story_uuid,
        request_uuid: s.request_uuid,
        staff_id: s.staff_id,
        number_of_employees: s.number_of_employees,
        story_status: s.story_status,
        is_old: s.is_old,
        story_created_at: s.story_created_at,
        story_last_updated_at: s.story_last_updated_at,
        request: {
          request_position_title: s.request?.request_position_title ?? null,
          request_position_type: s.request?.request_position_type ?? null,
          company: s.request?.company
            ? { company_name: s.request.company.company_name }
            : null,
        },
        staff: s.staff ? { staff_name: s.staff.staff_name } : null,
      })),
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to fetch active stories",
    };
  }
}

// ---------------------------------------------------------------------------
// listOldStories — list old/archived stories for a staff member
// ---------------------------------------------------------------------------

export async function listOldStories(
  params: Record<string, unknown>,
): Promise<import("./story-schemas").ListOldStoriesResult> {
  await requireCapability("admin.read");

  const parsed = listOldStoriesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { staffId, page, limit } = parsed.data;

  const where: Record<string, unknown> = {
    staff_id: staffId,
    is_old: true,
  };

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: where as any,
      include: {
        request: {
          select: {
            request_position_title: true,
            request_position_type: true,
            company: { select: { company_name: true } },
          },
        },
        staff: { select: { staff_name: true } },
      },
      orderBy: { story_last_updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.story.count({ where: where as any }),
  ]);

  return {
    stories: stories.map((s) => ({
      story_uuid: s.story_uuid,
      request_uuid: s.request_uuid,
      staff_id: s.staff_id,
      number_of_employees: s.number_of_employees,
      story_status: s.story_status,
      is_old: s.is_old,
      story_created_at: s.story_created_at,
      story_last_updated_at: s.story_last_updated_at,
      request: {
        request_position_title: s.request?.request_position_title ?? null,
        request_position_type: s.request?.request_position_type ?? null,
        company: s.request?.company
          ? { company_name: s.request.company.company_name }
          : null,
      },
      staff: s.staff ? { staff_name: s.staff.staff_name } : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// createStoryAction — create a story/update log from the request fulfillment UI
// ---------------------------------------------------------------------------

export async function createStoryAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const requestUuid = String(formData.get("request_uuid") ?? "").trim();
  const noteText = String(formData.get("note") ?? "").trim();
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid) {
    redirect(`${detailPath}?notice=missing-fields` as Route);
  }

  if (session.role === "staff") {
    const owned = await prisma.request.findFirst({
      where: { request_uuid: requestUuid, staff_id: Number(session.id) },
      select: { request_uuid: true },
    });
    if (!owned) redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();
  const storyUuid = `story_${crypto.randomUUID()}`;

  await prisma.story.create({
    data: {
      story_uuid: storyUuid,
      request_uuid: requestUuid,
      story_status: 0,
      story_created_at: now,
      story_last_updated_at: now,
    },
  });

  if (noteText) {
    await prisma.note.create({
      data: {
        note_uuid: `note_${crypto.randomUUID()}`,
        request_uuid: requestUuid,
        story_uuid: storyUuid,
        note_text: noteText,
        note_type: "story_log",
        note_created_datetime: now,
        note_updated_datetime: now,
      },
    });
  }

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=story-created` as Route);
}

// ---------------------------------------------------------------------------
// updateStoryStatusAction — update a story's status (complete, cancel, etc.)
// ---------------------------------------------------------------------------

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
      select: { request_uuid: true },
    });
    if (!owned) redirect(`${detailPath}?notice=not-found` as Route);
  }

  const story = await prisma.story.findUnique({
    where: { story_uuid: storyUuid },
    select: { story_uuid: true },
  });

  if (!story) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.story.update({
      where: { story_uuid: storyUuid },
      data: {
        story_status: newStatus,
        story_last_updated_at: now,
      },
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now },
    }),
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=story-updated` as Route);
}
