"use server";

// ---------------------------------------------------------------------------
// Inspector Workspace — server action for the inspector dashboard page
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getInspectorWorkspaceSchema,
  inspectorWorkspaceOutputSchema,
} from "./schemas";
import type { InspectWorkspaceResult } from "./schemas";

// ---------------------------------------------------------------------------
// getInspectorWorkspace
// ---------------------------------------------------------------------------

/**
 * Get the inspector workspace data — metrics and recent ID requests.
 * Replaces the former `getInspectorWorkspace` from `@/modules/workspace/data`.
 */
export async function getInspectorWorkspace(
  inspectorUuid: string,
): Promise<InspectWorkspaceResult> {
  await requireRoleCapability("inspector", "id_review.read");

  // Input validation
  const parsed = getInspectorWorkspaceSchema.safeParse({ inspectorUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid inspector UUID");
  }

  const [inspector, idRequests, idCards, needsVerification, recentIdRequests] =
    await prisma.$transaction([
      prisma.inspector.findUnique({
        where: { inspector_uuid: inspectorUuid },
        select: { inspector_name: true, inspector_email: true },
      }),
      prisma.candidate_id_request.count(),
      prisma.candidate_id_card.count({ where: { deleted: 0 } }),
      prisma.candidate.count({
        where: { deleted: 0, candidate_civil_need_verification: true },
      }),
      prisma.candidate_id_request.findMany({
        orderBy: { created_at: "desc" },
        take: 6,
        select: {
          cir_uuid: true,
          status: true,
          candidate_ids: true,
          created_at: true,
        },
      }),
    ]);

  const result: InspectWorkspaceResult = {
    inspector,
    metrics: [
      {
        label: "ID Requests",
        value: idRequests,
        note: "Verification request batches",
      },
      { label: "ID Cards", value: idCards, note: "Stored ID card records" },
      {
        label: "Needs Verification",
        value: needsVerification,
        note: "Candidates flagged for civil ID review",
      },
      { label: "Mode", value: "Review", note: "Inspector workspace" },
    ],
    requests: recentIdRequests.map((request) => ({
      id: request.cir_uuid,
      title: `Request ${request.cir_uuid.slice(0, 12)}`,
      subtitle: request.candidate_ids
        ? `${request.candidate_ids.length} chars of candidate ids`
        : "No candidates",
      meta: `${request.status ?? "pending"} · ${formatDate(request.created_at)}`,
    })),
  };

  // Output validation
  const outputParsed = inspectorWorkspaceOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[inspector] Output validation failed for getInspectorWorkspace:",
      outputParsed.error.issues,
    );
  }

  return result;
}
