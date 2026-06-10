import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

function parseCandidateIds(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export async function getInspectorIdRequestRows() {
  const rows = await prisma.candidate_id_request.findMany({
    orderBy: { created_at: "desc" },
    take: 80,
    select: {
      cir_uuid: true,
      candidate_ids: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      updated_at: true,
      staff_candidate_id_request_created_byTostaff: { select: { staff_name: true } },
      staff_candidate_id_request_updated_byTostaff: { select: { staff_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.cir_uuid,
    request: row.cir_uuid.slice(0, 18),
    candidates: row.candidate_ids ? row.candidate_ids.split(",").filter(Boolean).length : 0,
    status: row.status ?? "pending",
    createdBy: row.staff_candidate_id_request_created_byTostaff?.staff_name ?? "System",
    updatedBy: row.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "System",
    created: formatDate(row.created_at),
    updated: formatDate(row.updated_at)
  }));
}

export async function getInspectorIdRequestDetail(requestUuid: string) {
  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: requestUuid },
    select: {
      cir_uuid: true,
      candidate_ids: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      updated_at: true,
      staff_candidate_id_request_created_byTostaff: { select: { staff_name: true, staff_email: true } },
      staff_candidate_id_request_updated_byTostaff: { select: { staff_name: true, staff_email: true } }
    }
  });

  const candidateIds = parseCandidateIds(request?.candidate_ids);
  const candidates = candidateIds.length
    ? await prisma.candidate.findMany({
        where: { candidate_id: { in: candidateIds } },
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_email: true,
          candidate_civil_need_verification: true,
          candidate_civil_expiry_date: true,
          candidate_status: true,
          approved: true
        }
      })
    : [];

  return {
    request,
    metrics: [
      { label: "Status", value: request?.status ?? "Missing", note: "Legacy ID request status" },
      { label: "Candidates", value: candidateIds.length, note: "IDs included in this batch" },
      { label: "Matched", value: candidates.length, note: "Candidate rows found in prod clone" },
      { label: "Updated", value: formatDate(request?.updated_at), note: request?.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "System" }
    ],
    candidates: candidates.map((candidate) => ({
      id: candidate.candidate_id,
      title: candidate.candidate_name,
      subtitle: candidate.candidate_email,
      meta: `${candidate.candidate_civil_need_verification ? "Needs verification" : "No flag"} · expires ${formatDate(candidate.candidate_civil_expiry_date)}`
    }))
  };
}
