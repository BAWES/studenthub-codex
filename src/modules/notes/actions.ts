"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  noteListItemSchema,
  noteDetailSchema,
  listNotesResultSchema,
  noteMutationResultSchema,
  noteDeleteResultSchema,
  type ListNotesParams,
  type GetNoteParams,
  type CreateNoteParams,
  type UpdateNoteParams,
  type DeleteNoteParams,
  type NoteListItem,
  type NoteDetail,
  type ListNotesResult,
  type NoteDetailOrNull,
  type NoteMutationResult,
  type NoteDeleteResult,
} from "./schemas";

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

  const result = {
    notes: notes.map((n) => ({
      note_uuid: n.note_uuid,
      note_type: n.note_type ?? null,
      note_text: n.note_text ?? null,
      company_id: n.company_id ?? null,
      candidate_id: n.candidate_id ?? null,
      created_by: n.created_by ?? null,
      note_created_datetime: n.note_created_datetime?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listNotesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/notes] listNotes output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single note by UUID.
 * Mirrors the legacy Yii2 NoteController::actionView pattern.
 */
export async function getNote(
  params: GetNoteParams,
): Promise<NoteDetailOrNull> {
  await requireCapability("notes.read");

  const parsed = getNoteSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note UUID");
  }

  const { uuid } = parsed.data;

  const note = await prisma.note.findFirst({
    where: { note_uuid: uuid },
  });

  if (!note) return null;

  const result: NoteDetail = {
    note_uuid: note.note_uuid,
    note_type: note.note_type ?? null,
    note_text: note.note_text ?? null,
    company_id: note.company_id ?? null,
    candidate_id: note.candidate_id ?? null,
    created_by: note.created_by ?? null,
    note_created_datetime: note.note_created_datetime?.toISOString() ?? null,
    note_updated_datetime: note.note_updated_datetime?.toISOString() ?? null,
    updated_by: note.updated_by ?? null,
    request_uuid: note.request_uuid ?? null,
    story_uuid: note.story_uuid ?? null,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = noteDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/notes] getNote output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new note.
 * Mirrors the legacy Yii2 NoteController::actionCreate pattern.
 */
export async function createNote(
  params: CreateNoteParams,
): Promise<NoteMutationResult> {
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

  const result: NoteMutationResult = {
    operation: "success",
    message: "Note created successfully",
    note: {
      note_uuid: note.note_uuid,
      note_type: note.note_type ?? null,
      note_text: note.note_text ?? null,
      company_id: note.company_id ?? null,
      candidate_id: note.candidate_id ?? null,
      created_by: note.created_by ?? null,
      note_created_datetime: note.note_created_datetime?.toISOString() ?? null,
      note_updated_datetime: note.note_updated_datetime?.toISOString() ?? null,
      updated_by: note.updated_by ?? null,
      request_uuid: note.request_uuid ?? null,
      story_uuid: note.story_uuid ?? null,
    },
  };

  // Output validation — log mismatches without throwing
  const outputParsed = noteMutationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/notes] createNote output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Update an existing note.
 * Mirrors the legacy Yii2 NoteController::actionUpdate pattern.
 */
export async function updateNote(
  params: UpdateNoteParams,
): Promise<NoteMutationResult> {
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

  const result: NoteMutationResult = {
    operation: "success",
    message: "Note successfully updated",
    note: {
      note_uuid: note.note_uuid,
      note_type: note.note_type ?? null,
      note_text: note.note_text ?? null,
      company_id: note.company_id ?? null,
      candidate_id: note.candidate_id ?? null,
      created_by: note.created_by ?? null,
      note_created_datetime: note.note_created_datetime?.toISOString() ?? null,
      note_updated_datetime: note.note_updated_datetime?.toISOString() ?? null,
      updated_by: note.updated_by ?? null,
      request_uuid: note.request_uuid ?? null,
      story_uuid: note.story_uuid ?? null,
    },
  };

  // Output validation — log mismatches without throwing
  const outputParsed = noteMutationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/notes] updateNote output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Delete a note by UUID.
 * Mirrors the legacy Yii2 NoteController::actionDelete pattern.
 */
export async function deleteNote(
  params: DeleteNoteParams,
): Promise<NoteDeleteResult> {
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
