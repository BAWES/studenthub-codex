"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  submitWorkLogSchema,
  type WorkLogItem,
  type SubmitWorkLogResult,
} from "../schemas";
import { createWorkLogResultOutputSchema } from "./schemas";

// ---------------------------------------------------------------------------
// createWorkLog — create a new work log entry for the current candidate
// ---------------------------------------------------------------------------

/**
 * Create a new work log entry for the current candidate.
 * Wraps the parent submitWorkLog with a create-route-friendly alias.
 * Accepts date, startTime, endTime, totalTime, note, and storeId.
 * Revalidates /candidate/work-logs on success.
 */
export async function createWorkLog(
  params: z.input<typeof submitWorkLogSchema>,
): Promise<SubmitWorkLogResult> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = submitWorkLogSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid work log data",
    };
  }

  const { date, startTime, endTime, totalTime, note, storeId } = parsed.data;
  const candidateId = Number(session.id);
  const now = new Date();

  // Calculate total_time if endTime provided but totalTime not
  let computedTotalTime = totalTime;
  if (computedTotalTime === undefined && endTime) {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
      computedTotalTime = Math.round((endMs - startMs) / 1000 / 60); // minutes
    }
  }

  try {
    const created = await prisma.candidate_working_hour.create({
      data: {
        candidate_working_hour_uuid: `wh_${crypto.randomUUID()}`,
        candidate_id: candidateId,
        store_id: storeId ?? null,
        date: new Date(date),
        start_time: new Date(startTime),
        end_time: endTime ? new Date(endTime) : null,
        total_time: computedTotalTime ?? null,
        note: note ?? null,
        status: 0,
        via: "Manual Log",
        created_at: now,
        updated_at: now,
      },
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
        created_at: true,
        updated_at: true,
        store: {
          select: {
            store_name: true,
            company: { select: { company_name: true } },
          },
        },
      },
    });

    revalidatePath("/candidate/work-logs");

    const successResult = {
      operation: "success" as const,
      message: "Work log created successfully",
      workLog: {
        candidate_working_hour_uuid: created.candidate_working_hour_uuid,
        date: created.date,
        start_time: created.start_time,
        end_time: created.end_time,
        total_time: created.total_time,
        status: created.status,
        via: created.via,
        note: created.note,
        store_name: created.store?.store_name ?? null,
        company_name: created.store?.company?.company_name ?? null,
        created_at: created.created_at,
        updated_at: created.updated_at,
      },
    };

    // Validate output shape
    const outputParsed = createWorkLogResultOutputSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error(
        "[candidate/work-logs/create] createWorkLog output validation failed:",
        outputParsed.error.issues,
      );
    }

    return successResult;
  } catch (err) {
    const errorResult = {
      operation: "error" as const,
      message:
        err instanceof Error ? err.message : "Failed to create work log",
    };

    // Validate output shape
    const errorOutputParsed = createWorkLogResultOutputSchema.safeParse(errorResult);
    if (!errorOutputParsed.success) {
      console.error(
        "[candidate/work-logs/create] createWorkLog error output validation failed:",
        errorOutputParsed.error.issues,
      );
    }

    return errorResult;
  }
}
