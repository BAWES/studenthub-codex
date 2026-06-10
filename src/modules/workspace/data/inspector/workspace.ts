import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

export async function getInspectorWorkspace(inspectorUuid: string) {
  const [inspector, idRequests, idCards, needsVerification, recentIdRequests] = await prisma.$transaction([
    prisma.inspector.findUnique({
      where: { inspector_uuid: inspectorUuid },
      select: { inspector_name: true, inspector_email: true }
    }),
    prisma.candidate_id_request.count(),
    prisma.candidate_id_card.count({ where: { deleted: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, candidate_civil_need_verification: true } }),
    prisma.candidate_id_request.findMany({
      orderBy: { created_at: "desc" },
      take: 6,
      select: {
        cir_uuid: true,
        status: true,
        candidate_ids: true,
        created_at: true
      }
    })
  ]);

  return {
    inspector,
    metrics: [
      { label: "ID Requests", value: idRequests, note: "Verification request batches" },
      { label: "ID Cards", value: idCards, note: "Stored ID card records" },
      { label: "Needs Verification", value: needsVerification, note: "Candidates flagged for civil ID review" },
      { label: "Mode", value: "Review", note: "Inspector workspace" }
    ],
    requests: recentIdRequests.map((request) => ({
      id: request.cir_uuid,
      title: `Request ${request.cir_uuid.slice(0, 12)}`,
      subtitle: request.candidate_ids ? `${request.candidate_ids.length} chars of candidate ids` : "No candidates",
      meta: `${request.status ?? "pending"} · ${formatDate(request.created_at)}`
    }))
  };
}
