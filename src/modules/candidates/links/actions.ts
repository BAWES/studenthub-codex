"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listLinksSchema = z.object({
  candidateId: z.number().int().positive().optional(),
});

const createLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  url: z
    .string()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .url("Invalid URL format"),
});

const updateLinkSchema = z.object({
  linkUuid: z.string().min(1, "Link UUID is required"),
  title: z.string().min(1, "Title is required").max(255).optional(),
  url: z
    .string()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .url("Invalid URL format")
    .optional(),
});

const deleteLinkSchema = z.object({
  linkUuid: z.string().min(1, "Link UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListLinksParams = z.input<typeof listLinksSchema>;
export type CreateLinkParams = z.input<typeof createLinkSchema>;
export type UpdateLinkParams = z.input<typeof updateLinkSchema>;
export type DeleteLinkParams = z.input<typeof deleteLinkSchema>;

export type CandidateLinkItem = {
  cl_uuid: string;
  candidate_id: number;
  title: string;
  url: string;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListLinksResult = {
  items: CandidateLinkItem[];
  total: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List candidate links with optional candidate filter.
 */
export async function listLinks(
  params: ListLinksParams = {},
): Promise<ListLinksResult> {
  await requireCapability("candidate.read.own");

  const parsed = listLinksSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { candidateId } = parsed.data;

  const where: { candidate_id?: number } = {};
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [items, total] = await Promise.all([
    prisma.candidate_link.findMany({
      where,
      orderBy: { created_at: "desc" },
    }),
    prisma.candidate_link.count({ where }),
  ]);

  return {
    items: items as CandidateLinkItem[],
    total,
  };
}

/**
 * Create a new candidate link (social/portfolio URL).
 */
export async function createLink(
  params: CreateLinkParams,
): Promise<CandidateLinkItem> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = createLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { title, url } = parsed.data;
  const now = new Date();

  const item = await prisma.candidate_link.create({
    data: {
      cl_uuid: crypto.randomUUID(),
      candidate_id: candidateId,
      title: title.trim(),
      url: url.trim(),
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/candidate");
  return item as CandidateLinkItem;
}

/**
 * Update an existing candidate link.
 */
export async function updateLink(
  params: UpdateLinkParams,
): Promise<CandidateLinkItem> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = updateLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { linkUuid, title, url } = parsed.data;

  // Verify the record exists and belongs to the candidate
  const existing = await prisma.candidate_link.findFirst({
    where: { cl_uuid: linkUuid, candidate_id: candidateId },
  });
  if (!existing) {
    throw new Error("Link not found");
  }

  const data: Record<string, unknown> = { updated_at: new Date() };
  if (title !== undefined) data.title = title.trim();
  if (url !== undefined) data.url = url.trim();

  const item = await prisma.candidate_link.update({
    where: { cl_uuid: linkUuid },
    data,
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/candidate");
  return item as CandidateLinkItem;
}

/**
 * Delete a candidate link.
 */
export async function deleteLink(
  params: DeleteLinkParams,
): Promise<{ success: boolean }> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = deleteLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { linkUuid } = parsed.data;

  // Verify the record exists and belongs to the candidate
  const existing = await prisma.candidate_link.findFirst({
    where: { cl_uuid: linkUuid, candidate_id: candidateId },
  });
  if (!existing) {
    throw new Error("Link not found");
  }

  await prisma.candidate_link.delete({
    where: { cl_uuid: linkUuid },
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/candidate");
  return { success: true };
}
