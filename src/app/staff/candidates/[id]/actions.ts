"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getCandidateSchema,
  addCandidateNoteSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema,
  type GetCandidateInput,
  type AddCandidateNoteInput,
  type CandidateDetail,
  type CandidateNote,
  type CandidateDetailResult,
  type AddNoteResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidate — read a candidate by ID for staff detail view
// ---------------------------------------------------------------------------

/**
 * Get full candidate profile detail and notes for the staff detail view.
 * Requires "candidate.search" capability.
 * Returns null if the candidate is not found.
 */
export async function getCandidate(
  params: z.input<typeof getCandidateSchema>,
): Promise<CandidateDetailResult> {
  await requireCapability("candidate.search");

  const parsed = getCandidateSchema.safeParse(params);
  if (!parsed.success) {
    return { candidate: null, notes: [] };
  }

  const { candidateId } = parsed.data;

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_email: true,
      candidate_phone: true,
      candidate_gender: true,
      candidate_objective: true,
      candidate_intro: true,
      candidate_personal_photo: true,
      candidate_civil_id: true,
      candidate_hourly_rate: true,
      country_id: true,
      university_id: true,
      candidate_birth_date: true,
      candidate_created_at: true,
      candidate_updated_at: true,
    },
  });

  if (!candidate) {
    return { candidate: null, notes: [] };
  }

  const notes = await prisma.note.findMany({
    where: { candidate_id: candidateId },
    orderBy: { note_created_datetime: "desc" },
    take: 50,
    select: {
      note_uuid: true,
      note_text: true,
      note_type: true,
      created_by: true,
      note_created_datetime: true,
    },
  });

  const isoDate = (d: Date | null | undefined): string | null => {
    if (!d) return null;
    return d instanceof Date && isFinite(d.getTime()) ? d.toISOString() : null;
  };

  return {
    candidate: {
      id: candidate.candidate_id,
      name: candidate.candidate_name,
      email: candidate.candidate_email,
      phone: candidate.candidate_phone ?? null,
      gender: candidate.candidate_gender ?? null,
      objective: candidate.candidate_objective ?? null,
      intro: candidate.candidate_intro ?? null,
      photoUrl: candidate.candidate_personal_photo ?? null,
      civilId: candidate.candidate_civil_id ?? null,
      hourlyRate: candidate.candidate_hourly_rate
        ? Number(candidate.candidate_hourly_rate)
        : null,
      countryId: candidate.country_id ?? null,
      universityId: candidate.university_id ?? null,
      birthDate: isoDate(candidate.candidate_birth_date),
      createdAt: isoDate(candidate.candidate_created_at) ?? "",
      updatedAt: isoDate(candidate.candidate_updated_at) ?? "",
    },
    notes: notes.map((n) => ({
      uuid: n.note_uuid,
      text: n.note_text ?? "",
      type: n.note_type ?? "Internal Note",
      })),
      };

      // Validate output shape
      const outputParsed = candidateDetailResultOutputSchema.safeParse(result);
      if (!outputParsed.success) {
      console.error(
        "[staff/candidates/[id]] getCandidate output validation failed:",
        outputParsed.error.issues,
      );
      }

      return result;
      }

      // ---------------------------------------------------------------------------
      // addNote — add a note to a candidate (staff-side)
      // ---------------------------------------------------------------------------

/**
 * Add a note to a candidate record from the staff detail view.
 * Requires "candidate.search" capability.
 * Creates a note record linked to the candidate and the current staff member.
 * Revalidates the staff/candidates path on success.
 */
export async function addNote(
  params: z.input<typeof addCandidateNoteSchema>,
): Promise<AddNoteResult> {
  const session = await requireCapability("candidate.search");

  const parsed = addCandidateNoteSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { candidateId, noteText, noteType } = parsed.data;

  // Verify the candidate exists
  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: { candidate_id: true },
  });

  if (!candidate) {
    return { success: false, error: "Candidate not found" };
  }

  const staffId = Number(session.id);
  const now = new Date();

  await prisma.note.create({
    data: {
      note_uuid: `note_${crypto.randomUUID()}`,
      candidate_id: candidateId,
      note_type: noteType,
      note_text: noteText,
      created_by: staffId,
      updated_by: staffId,
      note_created_datetime: now,
      note_updated_datetime: now,
    },
  });

  // Revalidate cache paths for the candidate detail view
  revalidatePath(`/staff/candidates/${candidateId}`);
  revalidatePath("/staff/candidates");

  return { success: true };
}
