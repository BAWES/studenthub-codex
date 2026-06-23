"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InterviewEvaluationListItem = {
  interview_evaluation_uuid: string;
  request_uuid: string | null;
  company_id: number | null;
  candidate_id: number;
  staff_id: number | null;
  candidate_name: string | null;
  created_at: Date | null;
};

export type InterviewEvaluationListResult = {
  evaluations: InterviewEvaluationListItem[];
  total: number;
};

export type InterviewEvaluationDetailResult = InterviewEvaluationListItem | null;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listInterviewEvaluationsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
});

export type ListInterviewEvaluationsParams = z.input<typeof listInterviewEvaluationsSchema>;

const getInterviewEvaluationSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
});

export type GetInterviewEvaluationParams = z.input<typeof getInterviewEvaluationSchema>;

const interviewEvaluationNoteItemSchema = z.object({
  note: z.string().min(1, "Note text is required"),
});

const createInterviewEvaluationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  staffId: z.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  companyId: z.number().int().positive().optional(),
  interviewEvaluationNotes: z.array(interviewEvaluationNoteItemSchema).optional(),
});

export type CreateInterviewEvaluationParams = z.input<typeof createInterviewEvaluationSchema>;

export type CreateInterviewEvaluationResult = {
  interview_evaluation_uuid: string;
  operation: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List interview evaluations with optional candidate_id filter.
 * Ordered by created_at DESC (most recent first).
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionList().
 *
 * @param params - Optional candidateId filter
 * @returns Interview evaluations list with total count
 */
export async function listInterviewEvaluations(
  params: ListInterviewEvaluationsParams = {},
): Promise<InterviewEvaluationListResult> {
  await requireCapability("staff.read");

  const parsed = listInterviewEvaluationsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { candidateId } = parsed.data;

  const where: Record<string, unknown> = {};
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [evaluations, total] = await Promise.all([
    prisma.interview_evaluation.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      include: {
        candidate: {
          select: { candidate_name: true },
        },
      },
    }),
    prisma.interview_evaluation.count({ where: where as any }),
  ]);

  return {
    evaluations: evaluations.map((e: typeof evaluations[number]) => ({
      interview_evaluation_uuid: e.interview_evaluation_uuid,
      request_uuid: e.request_uuid,
      company_id: e.company_id,
      candidate_id: e.candidate_id,
      staff_id: e.staff_id,
      candidate_name: e.candidate?.candidate_name ?? null,
      created_at: e.created_at,
    })),
    total,
  };
}

/**
 * Get a single interview evaluation by UUID.
 * Returns null if not found.
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionView($id).
 *
 * @param params - Object with `uuid` (interview evaluation UUID)
 * @returns The interview evaluation record, or null if not found
 */
export async function getInterviewEvaluation(
  params: GetInterviewEvaluationParams,
): Promise<InterviewEvaluationDetailResult> {
  await requireCapability("staff.read");

  const parsed = getInterviewEvaluationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid interview evaluation UUID");
  }

  const { uuid } = parsed.data;

  const evaluation = await prisma.interview_evaluation.findFirst({
    where: { interview_evaluation_uuid: uuid },
    include: {
      candidate: {
        select: { candidate_name: true },
      },
    },
  });

  if (!evaluation) {
    return null;
  }

  return {
    interview_evaluation_uuid: evaluation.interview_evaluation_uuid,
    request_uuid: evaluation.request_uuid,
    company_id: evaluation.company_id,
    candidate_id: evaluation.candidate_id,
    staff_id: evaluation.staff_id,
    candidate_name: evaluation.candidate?.candidate_name ?? null,
    created_at: evaluation.created_at,
  };
}

/**
 * Create a new interview evaluation record.
 * Maps to the legacy Yii2 InterviewEvaluationController create logic.
 *
 * @param params - Object with candidateId (required), staffId, requestUuid, companyId (optional)
 * @returns The created interview evaluation's UUID and status
 */
export async function createInterviewEvaluation(
  params: CreateInterviewEvaluationParams,
): Promise<CreateInterviewEvaluationResult> {
  await requireCapability("candidate.evaluation.write");

  const parsed = createInterviewEvaluationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid create parameters");
  }

  const { candidateId, staffId, requestUuid, companyId, interviewEvaluationNotes } = parsed.data;

  const interviewEvaluationUuid = `interview_evaluation_${crypto.randomUUID()}`;
  const now = new Date();

  await prisma.interview_evaluation.create({
    data: {
      interview_evaluation_uuid: interviewEvaluationUuid,
      request_uuid: requestUuid ?? null,
      company_id: companyId ?? null,
      candidate_id: candidateId,
      staff_id: staffId ?? null,
      created_at: now,
      updated_at: now,
    },
  });

  // Create note version + notes if provided (mirrors legacy Yii2 create flow)
  if (interviewEvaluationNotes && interviewEvaluationNotes.length > 0) {
    // Find latest version number for this evaluation
    const latestVersion = await prisma.interview_evaluation_note_version.findFirst({
      where: { interview_evaluation_uuid: interviewEvaluationUuid },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const ienvUuid = `ienv_${crypto.randomUUID()}`;
    const newVersion = (latestVersion?.version ?? 0) + 1;

    await prisma.interview_evaluation_note_version.create({
      data: {
        ienv_uuid: ienvUuid,
        interview_evaluation_uuid: interviewEvaluationUuid,
        version: newVersion,
        staff_id: staffId ?? null,
        created_at: now,
        updated_at: now,
      },
    });

    // Create individual notes
    for (const item of interviewEvaluationNotes) {
      await prisma.interview_evaluation_note.create({
        data: {
          ien_uuid: `ien_${crypto.randomUUID()}`,
          ienv_uuid: ienvUuid,
          note: item.note,
        },
      });
    }
  }

  revalidatePath("/staff/candidates/interview-evaluation");

  return {
    interview_evaluation_uuid: interviewEvaluationUuid,
    operation: "success",
    message: "Interview evaluation created successfully",
  };
}

// ---------------------------------------------------------------------------
// Types for version + note results
// ---------------------------------------------------------------------------

export type InterviewEvaluationVersionItem = {
  ienv_uuid: string;
  version: number | null;
  staff_id: number | null;
  staff_name: string | null;
  created_at: Date | null;
};

export type InterviewEvaluationNoteItem = {
  ien_uuid: string;
  ienv_uuid: string | null;
  note: string | null;
};

export type InterviewEvaluationVersionsResult = {
  versions: InterviewEvaluationVersionItem[];
  total: number;
};

export type InterviewEvaluationNoteVersionResult = {
  ienv_uuid: string;
  operation: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Schemas — new actions
// ---------------------------------------------------------------------------

const updateInterviewEvaluationSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
  requestUuid: z.string().optional(),
  companyId: z.number().int().positive().optional(),
  interviewEvaluationNotes: z.array(interviewEvaluationNoteItemSchema).optional(),
});

export type UpdateInterviewEvaluationParams = z.input<typeof updateInterviewEvaluationSchema>;

const deleteInterviewEvaluationSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
});

export type DeleteInterviewEvaluationParams = z.input<typeof deleteInterviewEvaluationSchema>;

const getInterviewEvaluationVersionsSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
});

export type GetInterviewEvaluationVersionsParams = z.input<typeof getInterviewEvaluationVersionsSchema>;

const addInterviewEvaluationNoteVersionSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
  notes: z.array(interviewEvaluationNoteItemSchema).min(1, "At least one note is required"),
});

export type AddInterviewEvaluationNoteVersionParams = z.input<typeof addInterviewEvaluationNoteVersionSchema>;

const addInterviewEvaluationNoteSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
  noteText: z.string().min(1, "Note text is required"),
});

export type AddInterviewEvaluationNoteParams = z.input<typeof addInterviewEvaluationNoteSchema>;

export type UpdateInterviewEvaluationResult = {
  operation: string;
  message: string;
  data?: {
    interview_evaluation_uuid: string;
  };
};

export type DeleteInterviewEvaluationResult = {
  operation: string;
  message: string;
};

export type AddInterviewEvaluationNoteResult = {
  operation: string;
  message: string;
};

// ---------------------------------------------------------------------------
// updateInterviewEvaluation
// ---------------------------------------------------------------------------

/**
 * Update an existing interview evaluation record.
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionUpdate($id).
 * Creates a new note version with notes if interviewEvaluationNotes is provided.
 */
export async function updateInterviewEvaluation(
  params: UpdateInterviewEvaluationParams,
): Promise<UpdateInterviewEvaluationResult> {
  await requireCapability("candidate.evaluation.write");

  const parsed = updateInterviewEvaluationSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };
  }

  const { uuid, requestUuid, companyId, interviewEvaluationNotes } = parsed.data;

  // Check the evaluation exists
  const existing = await prisma.interview_evaluation.findFirst({
    where: { interview_evaluation_uuid: uuid },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Interview evaluation not found",
    };
  }

  // Resolve company ID from request if not provided directly
  let resolvedCompanyId: number | undefined = companyId;
  if (requestUuid && resolvedCompanyId === undefined) {
    const request = await prisma.request.findFirst({
      where: { request_uuid: requestUuid },
      select: { company_id: true },
    });
    if (request && request.company_id !== null) {
      resolvedCompanyId = request.company_id;
    }
  }

  // Update the evaluation record
  await prisma.interview_evaluation.update({
    where: { interview_evaluation_uuid: uuid },
    data: {
      request_uuid: requestUuid ?? existing.request_uuid,
      company_id: resolvedCompanyId ?? (existing.company_id ?? undefined),
      updated_at: new Date(),
    },
  });

  // If notes provided, create a new note version (mirrors legacy flow)
  if (interviewEvaluationNotes && interviewEvaluationNotes.length > 0) {
    const latestVersion = await prisma.interview_evaluation_note_version.findFirst({
      where: { interview_evaluation_uuid: uuid },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const ienvUuid = `ienv_${crypto.randomUUID()}`;
    const newVersion = (latestVersion?.version ?? 0) + 1;
    const now = new Date();

    await prisma.interview_evaluation_note_version.create({
      data: {
        ienv_uuid: ienvUuid,
        interview_evaluation_uuid: uuid,
        version: newVersion,
        staff_id: null,
        created_at: now,
        updated_at: now,
      },
    });

    for (const item of interviewEvaluationNotes) {
      await prisma.interview_evaluation_note.create({
        data: {
          ien_uuid: `ien_${crypto.randomUUID()}`,
          ienv_uuid: ienvUuid,
          note: item.note,
        },
      });
    }
  }

  revalidatePath("/staff/candidates/interview-evaluation");

  return {
    operation: "success",
    message: "Interview evaluation updated successfully",
    data: { interview_evaluation_uuid: uuid },
  };
}

// ---------------------------------------------------------------------------
// deleteInterviewEvaluation
// ---------------------------------------------------------------------------

/**
 * Delete an interview evaluation record.
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionDelete($id).
 */
export async function deleteInterviewEvaluation(
  params: DeleteInterviewEvaluationParams,
): Promise<DeleteInterviewEvaluationResult> {
  await requireCapability("candidate.evaluation.write");

  const parsed = deleteInterviewEvaluationSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid delete parameters",
    };
  }

  const { uuid } = parsed.data;

  const existing = await prisma.interview_evaluation.findFirst({
    where: { interview_evaluation_uuid: uuid },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Interview evaluation not found",
    };
  }

  await prisma.interview_evaluation.delete({
    where: { interview_evaluation_uuid: uuid },
  });

  revalidatePath("/staff/candidates/interview-evaluation");

  return {
    operation: "success",
    message: "Interview evaluation deleted successfully",
  };
}

// ---------------------------------------------------------------------------
// getInterviewEvaluationVersions
// ---------------------------------------------------------------------------

/**
 * Get all note versions for an interview evaluation.
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionVersions($id).
 */
export async function getInterviewEvaluationVersions(
  params: GetInterviewEvaluationVersionsParams,
): Promise<InterviewEvaluationVersionsResult> {
  await requireCapability("staff.read");

  const parsed = getInterviewEvaluationVersionsSchema.safeParse(params);
  if (!parsed.success) {
    return { versions: [], total: 0 };
  }

  const { uuid } = parsed.data;

  const [versions, total] = await Promise.all([
    prisma.interview_evaluation_note_version.findMany({
      where: { interview_evaluation_uuid: uuid },
      orderBy: { version: "desc" },
      include: {
        staff: {
          select: { staff_name: true },
        },
      },
    }),
    prisma.interview_evaluation_note_version.count({
      where: { interview_evaluation_uuid: uuid },
    }),
  ]);

  return {
    versions: versions.map((v) => ({
      ienv_uuid: v.ienv_uuid,
      version: v.version,
      staff_id: v.staff_id,
      staff_name: v.staff?.staff_name ?? null,
      created_at: v.created_at,
    })),
    total,
  };
}

// ---------------------------------------------------------------------------
// addInterviewEvaluationNoteVersion
// ---------------------------------------------------------------------------

/**
 * Add a new note version (with notes) to an interview evaluation.
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionAddNewVersion($id).
 */
export async function addInterviewEvaluationNoteVersion(
  params: AddInterviewEvaluationNoteVersionParams,
): Promise<InterviewEvaluationNoteVersionResult> {
  await requireCapability("candidate.evaluation.write");

  const parsed = addInterviewEvaluationNoteVersionSchema.safeParse(params);
  if (!parsed.success) {
    return {
      ienv_uuid: "",
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  }

  const { uuid, notes } = parsed.data;

  const existing = await prisma.interview_evaluation.findFirst({
    where: { interview_evaluation_uuid: uuid },
  });

  if (!existing) {
    return {
      ienv_uuid: "",
      operation: "error",
      message: "Interview evaluation not found",
    };
  }

  // Find latest version number
  const latestVersion = await prisma.interview_evaluation_note_version.findFirst({
    where: { interview_evaluation_uuid: uuid },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const ienvUuid = `ienv_${crypto.randomUUID()}`;
  const newVersion = (latestVersion?.version ?? 0) + 1;
  const now = new Date();

  await prisma.interview_evaluation_note_version.create({
    data: {
      ienv_uuid: ienvUuid,
      interview_evaluation_uuid: uuid,
      version: newVersion,
      staff_id: null,
      created_at: now,
      updated_at: now,
    },
  });

  // Create individual notes
  for (const item of notes) {
    await prisma.interview_evaluation_note.create({
      data: {
        ien_uuid: `ien_${crypto.randomUUID()}`,
        ienv_uuid: ienvUuid,
        note: item.note,
      },
    });
  }

  revalidatePath("/staff/candidates/interview-evaluation");

  return {
    ienv_uuid: ienvUuid,
    operation: "success",
    message: "Interview evaluation version created successfully",
  };
}

// ---------------------------------------------------------------------------
// addInterviewEvaluationNote
// ---------------------------------------------------------------------------

/**
 * Add a general note (not versioned) to an interview evaluation.
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionAddNote($id).
 */
export async function addInterviewEvaluationNote(
  params: AddInterviewEvaluationNoteParams,
): Promise<AddInterviewEvaluationNoteResult> {
  await requireCapability("candidate.evaluation.write");

  const parsed = addInterviewEvaluationNoteSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  }

  const { uuid, noteText } = parsed.data;

  const existing = await prisma.interview_evaluation.findFirst({
    where: { interview_evaluation_uuid: uuid },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Interview evaluation not found",
    };
  }

  // Create a note linked to the evaluation (using the note model, via note_type)
  const now = new Date();
  await prisma.note.create({
    data: {
      note_uuid: `note_${crypto.randomUUID()}`,
      interview_evaluation_uuid: uuid,
      request_uuid: existing.request_uuid,
      company_id: existing.company_id,
      note_text: noteText,
      note_type: "Interview Evaluation",
      note_created_datetime: now,
      note_updated_datetime: now,
    },
  });

  revalidatePath("/staff/candidates/interview-evaluation");

  return {
    operation: "success",
    message: "Note added successfully",
  };
}
