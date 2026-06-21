"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  noteItemSchema,
  listNotesResultSchema,
  operationResultSchema,
  type ListNotesParams,
  type GetNoteParams,
  type CreateNoteParams,
  type UpdateNoteParams,
  type NoteItem,
  type ListNotesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// NOTE: staff_note_created_byTostaff / staff_note_updated_byTostaff relations
// were removed from the Prisma schema. staff_created/staff_updated are set to null
// until those relations are restored.
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
    staff_created: null,
    staff_updated: null,
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

  const result = {
    notes: notes.map(mapNote),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listNotesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/note] listNotes output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  if (!note) {
    // Validate output shape (null case)
    const nullOutputParsed = noteItemSchema.nullable().safeParse(null);
    if (!nullOutputParsed.success) {
      console.error(
        "[modules/admin/note] getNote output validation failed:",
        nullOutputParsed.error.issues,
      );
    }
    return null;
  }

  const result = mapNote(note);

  // Validate output shape
  const outputParsed = noteItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/note] getNote output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/note] createNote output validation failed (input error):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
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

    const successResult = {
      operation: "success",
      message: "Note created successfully",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/note] createNote output validation failed:",
        outputParsed.error.issues,
      );
    }
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "We've faced a problem creating the Note, please contact us for assistance.",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/note] createNote output validation failed (catch):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
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
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/note] updateNote output validation failed (input error):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }

  const { id, noteText, companyId } = parsed.data;

  const existing = await prisma.note.findFirst({
    where: { note_uuid: id },
  });

  if (!existing) {
    const notFoundResult = {
      operation: "error",
      message: "Note not found",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(notFoundResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/note] updateNote output validation failed (not found):",
        outputParsed.error.issues,
      );
    }
    return notFoundResult;
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

    const successResult = {
      operation: "success",
      message: "Note successfully updated",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/note] updateNote output validation failed:",
        outputParsed.error.issues,
      );
    }
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "We've faced a problem updating the Note, please contact us for assistance.",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/note] updateNote output validation failed (catch):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }
}
