import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

export async function getCandidateWorkLogRows(candidateId: number) {
  const rows = await prisma.candidate_working_hour.findMany({
    where: { candidate_id: candidateId },
    orderBy: { date: "desc" },
    take: 80,
    select: {
      candidate_working_hour_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      via: true,
      note: true,
      store: { select: { store_name: true, company: { select: { company_name: true } } } }
    }
  });

  return rows.map((row) => ({
    id: row.candidate_working_hour_uuid,
    date: formatDate(row.date),
    store: row.store?.store_name ?? "No store",
    company: row.store?.company?.company_name ?? "No company",
    total: `${row.total_time ?? 0} minutes`,
    status: `Status ${row.status ?? 0}`,
    via: row.via ?? "Not set",
    note: row.note?.slice(0, 120) ?? ""
  }));
}

export async function getCandidateWorkLogDetail(candidateId: number, workLogUuid: string) {
  const [workLog, appeals, feedback] = await prisma.$transaction([
    prisma.candidate_working_hour.findFirst({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
        start_location_lat: true,
        start_location_long: true,
        end_location_lat: true,
        end_location_long: true,
        created_at: true,
        updated_at: true,
        store: { select: { store_name: true, store_location: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.candidate_working_hour_appeal.findMany({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { appeal_uuid: true, reason: true, status: true, created_at: true }
    }),
    prisma.candidate_work_log_feedback.findMany({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { cwlf_uuid: true, note: true, reason: true, status: true, rating: true, created_at: true }
    })
  ]);

  return {
    workLog,
    metrics: [
      { label: "Total", value: `${workLog?.total_time ?? 0} minutes`, note: "Imported total time" },
      { label: "Status", value: `Status ${workLog?.status ?? 0}`, note: workLog?.via ?? "No source" },
      { label: "Appeals", value: appeals.length, note: "Appeal records linked to this log" },
      { label: "Feedback", value: feedback.length, note: "Feedback records linked to this log" }
    ],
    appeals: appeals.map((appeal) => ({
      id: appeal.appeal_uuid,
      title: `Status ${appeal.status}`,
      subtitle: appeal.reason?.slice(0, 180) ?? "No reason",
      meta: formatDate(appeal.created_at)
    })),
    feedback: feedback.map((item) => ({
      id: item.cwlf_uuid,
      title: item.reason ?? `Status ${item.status ?? 0}`,
      subtitle: item.note?.slice(0, 180) ?? "No note",
      meta: `${item.rating === true ? "Positive" : item.rating === false ? "Negative" : "No rating"} · ${formatDate(item.created_at)}`
    }))
  };
}
