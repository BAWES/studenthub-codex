"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listNotesSchema = z.object({
  companyId: z.number().int().optional(),
  staffId: z.number().int().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  endDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getNoteSchema = z.object({
  id: z.string().min(1, "Invalid note ID"),
});

export const createNoteSchema = z.object({
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.number().int().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  noteType: z.string().optional(),
  candidateId: z.number().int().optional(),
});

export const updateNoteSchema = z.object({
  id: z.string().min(1, "Invalid note ID"),
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListNotesParams = z.input<typeof listNotesSchema>;
export type GetNoteParams = z.input<typeof getNoteSchema>;
export type CreateNoteParams = z.input<typeof createNoteSchema>;
export type UpdateNoteParams = z.input<typeof updateNoteSchema>;

export type NoteItem = {
  note_uuid: string;
  company_id: number | null;
  request_uuid: string | null;
  story_uuid: string | null;
  note_type: string | null;
  note_text: string | null;
  created_by: number | null;
  updated_by: number | null;
  note_created_datetime: Date | null;
  note_updated_datetime: Date | null;
  staff_created: { staff_name: string } | null;
  staff_updated: { staff_name: string } | null;
};

export type ListNotesResult = {
  notes: NoteItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const noteSelect = {
  note_uuid: true,
  company_id: true,
  request_uuid: true,
  story_uuid: true,
  note_type: true,
  note_text: true,
  created_by: true,
  updated_by: true,
  note_created_datetime: true,
  note_updated_datetime: true,
  staff_note_created_byTostaff: {
    select: { staff_name: true },
  },
  staff_note_updated_byTostaff: {
    select: { staff_name: true },
  },
} as const;

function mapNote(note: any): NoteItem {
  return {
    note_uuid: note.note_uuid,
    company_id: note.company_id,
    request_uuid: note.request_uuid,
    story_uuid: note.story_uuid,
    note_type: note.note_type,
    note_text: note.note_text,
    created_by: note.created_by,
    updated_by: note.updated_by,
    note_created_datetime: note.note_created_datetime,
    note_updated_datetime: note.note_updated_datetime,
    staff_created: note.staff_note_created_byTostaff
      ? { staff_name: note.staff_note_created_byTostaff.staff_name }
      : null,
    staff_updated: note.staff_note_updated_byTostaff
      ? { staff_name: note.staff_note_updated_byTostaff.staff_name }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List notes with pagination and optional filters.
 * Mirrors the legacy Yii2 NoteController::actionList.
 */
export async function listNotes(
  params: ListNotesParams = {},
): Promise<ListNotesResult> {
  await requireCapability("admin.read");

  const parsed = listNotesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const {
    companyId,
    staffId,
    requestUuid,
    storyUuid,
    type,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = parsed.data;

  const where: Record<string, unknown> = {};

  if (companyId !== undefined) where.company_id = companyId;
  if (staffId !== undefined) where.created_by = staffId;
  if (requestUuid) where.request_uuid = requestUuid;
  if (storyUuid) where.story_uuid = storyUuid;
  if (type) where.note_type = type;
  if (startDate || endDate) {
    const noteCreated: Record<string, unknown> = {};
    if (startDate) noteCreated.gte = new Date(startDate);
    if (endDate) noteCreated.lte = new Date(endDate);
    where.note_created_datetime = noteCreated;
  }

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: where as any,
      orderBy: { note_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: noteSelect,
    }),
    prisma.note.count({ where: where as any }),
  ]);

  return {
    notes: notes.map(mapNote),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single note by UUID.
 * Mirrors the legacy Yii2 NoteController::actionView.
 */
export async function getNote(
  params: GetNoteParams,
): Promise<NoteItem | null> {
  await requireCapability("admin.read");

  const parsed = getNoteSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note ID");
  }

  const { id } = parsed.data;

  const note = await prisma.note.findFirst({
    where: { note_uuid: id },
    select: noteSelect,
  });

  if (!note) return null;

  return mapNote(note);
}

/**
 * Create a new note.
 * Mirrors the legacy Yii2 NoteController::actionCreate.
 */
export async function createNote(
  params: CreateNoteParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = createNoteSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
  }

  const { noteText, companyId, requestUuid, storyUuid, noteType, candidateId } =
    parsed.data;

  try {
    await prisma.note.create({
      data: {
        note_uuid: crypto.randomUUID(),
        note_text: noteText,
        company_id: companyId ?? null,
        request_uuid: requestUuid ?? null,
        story_uuid: storyUuid ?? null,
        note_type: noteType ?? null,
        candidate_id: candidateId ?? null,
        note_created_datetime: new Date(),
        note_updated_datetime: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Note created successfully",
    };
  } catch (error) {
    return {
      operation: "error",
      message: "We've faced a problem creating the Note, please contact us for assistance.",
    };
  }
}

/**
 * Update an existing note.
 * Mirrors the legacy Yii2 NoteController::actionUpdate.
 */
export async function updateNote(
  params: UpdateNoteParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = updateNoteSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };
  }

  const { id, noteText, companyId } = parsed.data;

  const existing = await prisma.note.findFirst({
    where: { note_uuid: id },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Note not found",
    };
  }

  try {
    await prisma.note.update({
      where: { note_uuid: id },
      data: {
        note_text: noteText,
        company_id: companyId ?? existing.company_id,
        note_updated_datetime: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Note successfully updated",
    };
  } catch (error) {
    return {
      operation: "error",
      message: "We've faced a problem updating the Note, please contact us for assistance.",
    };
  }
}
