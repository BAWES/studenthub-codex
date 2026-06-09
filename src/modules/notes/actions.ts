"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listNotesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  staffId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  noteType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
});

const getNoteSchema = z.object({
  uuid: z.string().min(1, "Note UUID is required"),
});

const createNoteSchema = z.object({
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.coerce.number().int().positive().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  noteType: z.string().optional().default("Internal Note"),
});

const updateNoteSchema = z.object({
  uuid: z.string().min(1, "Note UUID is required"),
  noteText: z.string().min(1, "Note text is required").optional(),
  noteType: z.string().optional(),
});

const deleteNoteSchema = z.object({
  uuid: z.string().min(1, "Note UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListNotesParams = z.input<typeof listNotesSchema>;
export type GetNoteParams = z.input<typeof getNoteSchema>;
export type CreateNoteParams = z.input<typeof createNoteSchema>;
export type UpdateNoteParams = z.input<typeof updateNoteSchema>;
export type DeleteNoteParams = z.input<typeof deleteNoteSchema>;

export type NoteListItem = {
  note_uuid: string;
  note_type: string | null;
  note_text: string | null;
  company_id: number | null;
  candidate_id: number | null;
  created_by: number | null;
  note_created_datetime: Date | null;
};

export type NoteDetail = NoteListItem & {
  note_updated_datetime: Date | null;
  updated_by: number | null;
  request_uuid: string | null;
  story_uuid: string | null;
};

export type ListNotesResult = {
  notes: NoteListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List notes with pagination and optional filters.
 * Mirrors the legacy Yii2 NoteController::actionList pattern.
 */
export async function listNotes(
  params: ListNotesParams = {},
): Promise<ListNotesResult> {
  await requireCapability("notes.read");

  const parsed = listNotesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const {
    page,
    limit,
    companyId,
    staffId,
    requestUuid,
    storyUuid,
    noteType,
    startDate,
    endDate,
    candidateId,
  } = parsed.data;

  const where: Record<string, unknown> = {};

  if (companyId !== undefined) where.company_id = companyId;
  if (staffId !== undefined) where.created_by = staffId;
  if (requestUuid) where.request_uuid = requestUuid;
  if (storyUuid) where.story_uuid = storyUuid;
  if (noteType) where.note_type = noteType;
  if (candidateId !== undefined) where.candidate_id = candidateId;

  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    where.note_created_datetime = dateFilter;
  }

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: where as any,
      orderBy: { note_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        note_uuid: true,
        note_type: true,
        note_text: true,
        company_id: true,
        candidate_id: true,
        created_by: true,
        note_created_datetime: true,
      },
    }),
    prisma.note.count({ where: where as any }),
  ]);

  return {
    notes: notes as NoteListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single note by UUID.
 * Mirrors the legacy Yii2 NoteController::actionView pattern.
 */
export async function getNote(
  params: GetNoteParams,
): Promise<NoteDetail | null> {
  await requireCapability("notes.read");

  const parsed = getNoteSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note UUID");
  }

  const { uuid } = parsed.data;

  const note = await prisma.note.findFirst({
    where: { note_uuid: uuid },
  });

  return note as NoteDetail | null;
}

/**
 * Create a new note.
 * Mirrors the legacy Yii2 NoteController::actionCreate pattern.
 */
export async function createNote(
  params: CreateNoteParams,
): Promise<{ operation: string; message: string; note?: NoteDetail }> {
  await requireCapability("notes.create");

  const parsed = createNoteSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
  }

  const { noteText, companyId, candidateId, requestUuid, storyUuid, noteType } =
    parsed.data;

  const note = await prisma.note.create({
    data: {
      note_uuid: crypto.randomUUID(),
      note_text: noteText,
      company_id: companyId ?? null,
      candidate_id: candidateId ?? null,
      request_uuid: requestUuid ?? null,
      story_uuid: storyUuid ?? null,
      note_type: noteType,
      note_created_datetime: new Date(),
      note_updated_datetime: new Date(),
    },
  });

  revalidatePath("/notes");

  return {
    operation: "success",
    message: "Note created successfully",
    note: note as NoteDetail,
  };
}

/**
 * Update an existing note.
 * Mirrors the legacy Yii2 NoteController::actionUpdate pattern.
 */
export async function updateNote(
  params: UpdateNoteParams,
): Promise<{ operation: string; message: string; note?: NoteDetail }> {
  await requireCapability("notes.update");

  const parsed = updateNoteSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };
  }

  const { uuid, noteText, noteType } = parsed.data;

  const existing = await prisma.note.findFirst({ where: { note_uuid: uuid } });
  if (!existing) {
    return { operation: "error", message: "Note not found" };
  }

  const data: Record<string, unknown> = {
    note_updated_datetime: new Date(),
  };
  if (noteText !== undefined) data.note_text = noteText;
  if (noteType !== undefined) data.note_type = noteType;

  const note = await prisma.note.update({
    where: { note_uuid: uuid },
    data: data as any,
  });

  revalidatePath("/notes");

  return {
    operation: "success",
    message: "Note successfully updated",
    note: note as NoteDetail,
  };
}

/**
 * Delete a note by UUID.
 * Mirrors the legacy Yii2 NoteController::actionDelete pattern.
 */
export async function deleteNote(
  params: DeleteNoteParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("notes.delete");

  const parsed = deleteNoteSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid delete parameters",
    };
  }

  const { uuid } = parsed.data;

  const existing = await prisma.note.findFirst({ where: { note_uuid: uuid } });
  if (!existing) {
    return { operation: "error", message: "Note not found or already deleted" };
  }

  await prisma.note.delete({ where: { note_uuid: uuid } });

  revalidatePath("/notes");

  return { operation: "success", message: "Note deleted successfully" };
}
