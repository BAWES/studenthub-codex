"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { updatePipelineStageSchema, type UpdatePipelineStageInput } from "./schemas";

import {
  pipelineItemSchema,
  pipelineMetricsSchema,
  updatePipelineStageResultSchema,
  type PipelineItem,
  type PipelineMetrics,
  type UpdatePipelineStageResult,
} from "./schemas";

import { type PipelineStage, stageFromInvitationStatus } from "./stage";

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/staff/pipeline] ${source} output validation failed:`, error);
}

// ── Data fetching ────────────────────────────────────────────────────

export async function getPipelineData(staffId: number) {
  const invitations = await prisma.invitation.findMany({
    where: {
      invitation_created_by_staff: staffId,
    },
    orderBy: { invitation_updated_at: "desc" },
    take: 100,
    select: {
      invitation_uuid: true,
      invitation_status: true,
      invitation_updated_at: true,
      candidate: {
        select: {
          candidate_id: true,
          candidate_name: true,
        },
      },
      request: {
        select: {
          request_uuid: true,
          request_position_title: true,
          company: {
            select: { company_name: true },
          },
        },
      },
    },
  });

  const items: PipelineItem[] = invitations.map((inv) => ({
    id: inv.invitation_uuid,
    requestUuid: inv.request.request_uuid,
    candidateName: inv.candidate?.candidate_name ?? "Unknown candidate",
    candidateId: inv.candidate?.candidate_id ?? null,
    positionTitle: inv.request.request_position_title ?? "Untitled position",
    companyName: inv.request.company?.company_name ?? "No company",
    stage: stageFromInvitationStatus(inv.invitation_status ?? 0),
    updatedAt: inv.invitation_updated_at ?? new Date(),
    priority: "normal" as const,
    invitationStatus: inv.invitation_status ?? 0,
  }));

  const outputParsed = z.array(pipelineItemSchema).safeParse(items);
  if (!outputParsed.success) {
    logOutputError("getPipelineData", outputParsed.error.issues);
  }

  return items;
}

export async function getPipelineMetrics(items: PipelineItem[]): Promise<PipelineMetrics> {
  const byStage = (stage: PipelineStage) => items.filter((i) => i.stage === stage).length;

  const result: PipelineMetrics = {
    pendingReview: byStage("pending_review"),
    interviewing: byStage("interviewing"),
    offered: byStage("offered"),
    hired: byStage("hired"),
    rejected: byStage("rejected"),
    total: items.length,
    trends: {
      pending_review: { direction: "flat", label: "0%" },
      interviewing: { direction: "flat", label: "0%" },
      offered: { direction: "flat", label: "0%" },
      hired: { direction: "flat", label: "0%" },
      rejected: { direction: "flat", label: "0%" },
    },
  };

  const outputParsed = pipelineMetricsSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getPipelineMetrics", outputParsed.error.issues);
  }

  return result;
}

const STATUS_MAP: Record<string, number> = {
  pending_review: 0,
  interviewing: 1,
  offered: 2,
  hired: 3,
  rejected: 4,
};

export async function updatePipelineStageAction(
  input: UpdatePipelineStageInput,
): Promise<UpdatePipelineStageResult> {
  try {
    const session = await requireRoleCapability("staff", "request.read.assigned");
    const parsed = updatePipelineStageSchema.safeParse(input);
    if (!parsed.success) {
      const result: UpdatePipelineStageResult = { success: false, error: "Invalid input: " + parsed.error.issues[0]?.message };
      const outputParsed = updatePipelineStageResultSchema.safeParse(result);
      if (!outputParsed.success) {
        logOutputError("updatePipelineStageAction", outputParsed.error.issues);
      }
      return result;
    }

    const { invitationUuid, stage } = parsed.data;
    const newStatus = STATUS_MAP[stage];

    await prisma.invitation.update({
      where: { invitation_uuid: invitationUuid },
      data: {
        invitation_status: newStatus,
        invitation_updated_by_staff: Number(session.id),
        invitation_updated_at: new Date(),
      },
    });

    revalidatePath("/staff");

    const result: UpdatePipelineStageResult = { success: true, newStage: stage };
    const outputParsed2 = updatePipelineStageResultSchema.safeParse(result);
    if (!outputParsed2.success) {
      logOutputError("updatePipelineStageAction", outputParsed2.error.issues);
    }
    return result;
  } catch (error) {
    const result: UpdatePipelineStageResult = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update pipeline stage",
    };
    const outputParsed = updatePipelineStageResultSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updatePipelineStageAction", outputParsed.error.issues);
    }
    return result;
  }
}
