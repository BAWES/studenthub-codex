import { prisma } from "@/lib/prisma";
import { stageFromInvitationStatus, type PipelineStage } from "./pipeline/stage";

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

// ---------------------------------------------------------------------------
// Pipeline queries
// ---------------------------------------------------------------------------

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
