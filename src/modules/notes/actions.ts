"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  listNotesResultSchema,
  noteDetailNullableSchema,
  createNoteResultSchema,
  updateNoteResultSchema,
  deleteNoteResultSchema,
  type ListNotesResult,
  type ListNotesParams,
  type GetNoteParams,
  type CreateNoteParams,
  type UpdateNoteParams,
  type DeleteNoteParams,
  type NoteListItem,
  type NoteDetail,
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

  const result: ListNotesResult = {
    notes: notes as NoteListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
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

  const result = note as NoteDetail | null;

  // Validate output shape
  const outputParsed = noteDetailNullableSchema.safeParse(result);
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
): Promise<z.infer<typeof createNoteResultSchema>> {
  await requireCapability("notes.create");

  const parsed = createNoteSchema.safeParse(params);
  if (!parsed.success) {
    const result = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };

    // Validate output shape (error result)
    const outputParsed = createNoteResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/notes] createNote output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
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

  const result: z.infer<typeof createNoteResultSchema> = {
    operation: "success",
    message: "Note created successfully",
    note: note as NoteDetail,
  };

  // Validate output shape
  const outputParsed = createNoteResultSchema.safeParse(result);
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
): Promise<z.infer<typeof updateNoteResultSchema>> {
  await requireCapability("notes.update");

  const parsed = updateNoteSchema.safeParse(params);
  if (!parsed.success) {
    const result = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };

    // Validate output shape (error result)
    const outputParsed = updateNoteResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/notes] updateNote output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const { uuid, noteText, noteType } = parsed.data;

  const existing = await prisma.note.findFirst({ where: { note_uuid: uuid } });
  if (!existing) {
    const result = { operation: "error", message: "Note not found" };

    // Validate output shape (error result)
    const outputParsed = updateNoteResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/notes] updateNote output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
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

  const result: z.infer<typeof updateNoteResultSchema> = {
    operation: "success",
    message: "Note successfully updated",
    note: note as NoteDetail,
  };

  // Validate output shape
  const outputParsed = updateNoteResultSchema.safeParse(result);
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
): Promise<z.infer<typeof deleteNoteResultSchema>> {
  await requireCapability("notes.delete");

  const parsed = deleteNoteSchema.safeParse(params);
  if (!parsed.success) {
    const result = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid delete parameters",
    };

    // Validate output shape (error result)
    const outputParsed = deleteNoteResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/notes] deleteNote output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const { uuid } = parsed.data;

  const existing = await prisma.note.findFirst({ where: { note_uuid: uuid } });
  if (!existing) {
    const result = { operation: "error", message: "Note not found or already deleted" };

    // Validate output shape (error result)
    const outputParsed = deleteNoteResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/notes] deleteNote output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  await prisma.note.delete({ where: { note_uuid: uuid } });

  revalidatePath("/notes");

  const result = { operation: "success", message: "Note deleted successfully" };

  // Validate output shape
  const outputParsed = deleteNoteResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/notes] deleteNote output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
