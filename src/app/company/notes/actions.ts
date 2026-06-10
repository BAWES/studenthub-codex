"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCompanyNotesSchema,
  getCompanyNoteSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  deleteCompanyNoteSchema,
  type ListCompanyNotesInput,
  type CreateCompanyNoteInput,
  type UpdateCompanyNoteInput,
  type CompanyNoteListItem,
  type CompanyNoteDetail,
  type ListCompanyNotesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List notes for a company with pagination.
 */
export async function listCompanyNotes(
  params: ListCompanyNotesInput = {},
): Promise<ListCompanyNotesResult> {
  await requireCapability("company.read.linked");

  const parsed = listCompanyNotesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }

  const [raw, total] = await Promise.all([
    prisma.note.findMany({
      where: where as any,
      orderBy: { note_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        note_uuid: true,
        note_text: true,
        note_type: true,
        company_id: true,
        created_by: true,
        note_created_datetime: true,
        note_updated_datetime: true,
        company: {
          select: { company_name: true },
        },
      },
    }),
    prisma.note.count({ where: where as any }),
  ]);

  const notes: CompanyNoteListItem[] = raw.map((n) => ({
    note_uuid: n.note_uuid,
    note_text: n.note_text,
    note_type: n.note_type,
    company_id: n.company_id,
    created_by: n.created_by,
    created_at: n.note_created_datetime?.toISOString() ?? null,
    updated_at: n.note_updated_datetime?.toISOString() ?? null,
    company_name: n.company?.company_name ?? null,
  }));

  return {
    notes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single company note by UUID.
 */
export async function getCompanyNote(
  noteUuid: string,
): Promise<CompanyNoteDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getCompanyNoteSchema.safeParse({ noteUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note UUID");
  }

  const raw = await prisma.note.findUnique({
    where: { note_uuid: parsed.data.noteUuid },
    select: {
      note_uuid: true,
      company_id: true,
      note_text: true,
      note_type: true,
      created_by: true,
      updated_by: true,
      note_created_datetime: true,
      note_updated_datetime: true,
      company: {
        select: { company_name: true },
      },
    },
  });

  if (!raw) return null;

  return {
    note_uuid: raw.note_uuid,
    company_id: raw.company_id,
    note_text: raw.note_text,
    note_type: raw.note_type,
    created_by: raw.created_by,
    updated_by: raw.updated_by,
    created_at: raw.note_created_datetime?.toISOString() ?? null,
    updated_at: raw.note_updated_datetime?.toISOString() ?? null,
    company_name: raw.company?.company_name ?? null,
  };
}

/**
 * Create a new note for a company.
 */
export async function createCompanyNote(
  data: CreateCompanyNoteInput,
): Promise<{ note_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = createCompanyNoteSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note data");
  }

  const note = await prisma.note.create({
    data: {
      note_uuid: crypto.randomUUID(),
      company_id: parsed.data.company_id,
      note_text: parsed.data.note_text,
      note_type: parsed.data.note_type ?? "Internal Note",
      created_by: parsed.data.created_by ?? null,
      note_created_datetime: new Date(),
      note_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/notes`);
  return { note_uuid: note.note_uuid };
}

/**
 * Update an existing company note.
 */
export async function updateCompanyNote(
  data: UpdateCompanyNoteInput,
): Promise<{ note_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = updateCompanyNoteSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note data");
  }

  const updateData: Record<string, unknown> = {
    note_updated_datetime: new Date(),
    updated_by: parsed.data.updated_by ?? null,
  };
  if (parsed.data.note_text !== undefined) {
    updateData.note_text = parsed.data.note_text;
  }
  if (parsed.data.note_type !== undefined) {
    updateData.note_type = parsed.data.note_type;
  }

  await prisma.note.update({
    where: { note_uuid: parsed.data.noteUuid },
    data: updateData as any,
  });

  revalidatePath(`/company/notes`);
  return { note_uuid: parsed.data.noteUuid };
}

/**
 * Soft-delete a company note (set null out company_id reference).
 */
export async function deleteCompanyNote(
  noteUuid: string,
): Promise<{ success: boolean }> {
  await requireCapability("company.read.linked");

  const parsed = deleteCompanyNoteSchema.safeParse({ noteUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note UUID");
  }

  // Soft-delete by removing the company association
  await prisma.note.update({
    where: { note_uuid: parsed.data.noteUuid },
    data: {
      company_id: null,
      note_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/notes`);
  return { success: true };
}
