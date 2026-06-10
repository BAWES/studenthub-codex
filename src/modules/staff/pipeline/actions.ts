"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { updatePipelineStageSchema, type UpdatePipelineStageInput } from "./schemas";
import { stageFromInvitationStatus } from "@/modules/staff/pipeline-data";
import type { PipelineStage } from "@/modules/staff/pipeline-data";

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
