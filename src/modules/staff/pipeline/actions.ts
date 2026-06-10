"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { updatePipelineStageSchema, type UpdatePipelineStageInput } from "./schemas";

// ── Types ────────────────────────────────────────────────────────────

export type PipelineStage = "pending_review" | "interviewing" | "offered" | "hired" | "rejected";

export interface PipelineItem {
  id: string;
  requestUuid: string;
  candidateName: string;
  candidateId: number | null;
  positionTitle: string;
  companyName: string;
  stage: PipelineStage;
  updatedAt: Date;
  priority: "high" | "normal" | "low";
  /** Invitation status from the DB */
  invitationStatus: number;
}

export interface PipelineMetrics {
  pendingReview: number;
  interviewing: number;
  offered: number;
  hired: number;
  rejected: number;
  total: number;
  trends: Record<PipelineStage, { direction: "up" | "down" | "flat"; label: string }>;
}

// ── Stage mapping ─────────────────────────────────────────────────────

const STATUS_PENDING = 0;   // New / Pending Review
const STATUS_INTERVIEWING = 1; // Invited / Interviewing
const STATUS_OFFERED = 2;    // Offered
const STATUS_HIRED = 3;      // Hired / Placed
const STATUS_REJECTED = 4;   // Rejected / Cancelled

export function stageFromInvitationStatus(status: number): PipelineStage {
  switch (status) {
    case STATUS_PENDING: return "pending_review";
    case STATUS_INTERVIEWING: return "interviewing";
    case STATUS_OFFERED: return "offered";
    case STATUS_HIRED: return "hired";
    case STATUS_REJECTED: return "rejected";
    default: return "pending_review";
  }
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

  return items;
}

export async function getPipelineMetrics(items: PipelineItem[]): Promise<PipelineMetrics> {
  const byStage = (stage: PipelineStage) => items.filter((i) => i.stage === stage).length;

  return {
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
}

const STATUS_MAP: Record<PipelineStage, number> = {
  pending_review: 0,
  interviewing: 1,
  offered: 2,
  hired: 3,
  rejected: 4,
};

export interface UpdatePipelineStageResult {
  success: boolean;
  error?: string;
  newStage?: PipelineStage;
}

export async function updatePipelineStageAction(
  input: UpdatePipelineStageInput,
): Promise<UpdatePipelineStageResult> {
  try {
    const session = await requireRoleCapability("staff", "request.read.assigned");
    const parsed = updatePipelineStageSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input: " + parsed.error.issues[0]?.message };
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
    return { success: true, newStage: stage };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update pipeline stage",
    };
  }
}
