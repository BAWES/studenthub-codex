"use server";

// ---------------------------------------------------------------------------
// Company Notes [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Thin convenience wrappers for single-note CRUD using Prisma directly.
// Notes are scoped to a company context.
//
// Actions:
//   - getNoteEntry      — fetch a single note by UUID
//   - updateNoteEntry   — update note text
//   - deleteNoteEntry   — delete a note
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

import {
  getNoteEntrySchema,
  updateNoteEntrySchema,
  deleteNoteEntrySchema,
} from "./schemas";
import type { NoteEntryResponse } from "./schemas";

// Re-export note type
import type { NoteItem } from "@/modules/admin/note/schemas";
export type { NoteItem };

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
// getNoteEntry
// ---------------------------------------------------------------------------

/**
 * Get a single note by UUID with full detail.
 * Requires company.read.linked capability.
 */
export async function getNoteEntry(
  noteUuid: string,
): Promise<NoteItem | null> {
  await requireCapability("company.read.linked");

  const parsed = getNoteEntrySchema.safeParse({ noteUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note entry params");
  }

  const note = await prisma.note.findFirst({
    where: { note_uuid: parsed.data.noteUuid },
    select: noteSelect,
  });

  if (!note) return null;

  return mapNote(note);
}

// ---------------------------------------------------------------------------
// updateNoteEntry
// ---------------------------------------------------------------------------

/**
 * Update an existing note's text content.
 *
 * - Requires company.write.linked capability.
 * - Verifies the note exists before updating.
 * - Returns `{ success: true }` on success, `{ success: false, error }` on failure.
 */
export async function updateNoteEntry(
  noteUuid: string,
  noteText: string,
  companyId: number,
): Promise<NoteEntryResponse> {
  await requireCapability("company.write.linked");

  const parsed = updateNoteEntrySchema.safeParse({ noteUuid, noteText, companyId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify the note exists
  const existing = await prisma.note.findFirst({
    where: { note_uuid: parsed.data.noteUuid },
    select: { note_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Note not found" };
  }

  await prisma.note.update({
    where: { note_uuid: parsed.data.noteUuid },
    data: {
      note_text: parsed.data.noteText,
      company_id: parsed.data.companyId,
      note_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/notes/${parsed.data.noteUuid}`);
  revalidatePath("/company/notes");

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteNoteEntry
// ---------------------------------------------------------------------------

/**
 * Delete a note by UUID.
 * Requires company.write.linked capability.
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deleteNoteEntry(
  noteUuid: string,
): Promise<NoteEntryResponse> {
  await requireCapability("company.write.linked");

  const parsed = deleteNoteEntrySchema.safeParse({ noteUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify the note exists before deleting
  const existing = await prisma.note.findFirst({
    where: { note_uuid: parsed.data.noteUuid },
    select: { note_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Note not found" };
  }

  await prisma.note.delete({
    where: { note_uuid: parsed.data.noteUuid },
  });

  revalidatePath("/company/notes");

  return { success: true };
}
