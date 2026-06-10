import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Candidate working dates (schedule)
// ---------------------------------------------------------------------------

export type WorkingDateRow = {
  id: string;
  date: string;
  store: string;
  company: string;
  startTime: string;
  endTime: string;
  totalTime: string;
  status: string;
};

export type WorkingDateDetail = {
  cwd_uuid: string;
  date: Date;
  start_time: Date;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  store: { store_name: string | null; company: { company_name: string | null } | null } | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export const WORKING_DATE_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "Cancelled",
  3: "Completed",
};

export function workingDateStatusLabel(status: number | null): string {
  return status != null ? (WORKING_DATE_STATUS_LABELS[status] ?? `Status ${status}`) : "Unknown";
}

export async function getCandidateWorkingDateRows(candidateId: number): Promise<WorkingDateRow[]> {
  const rows = await prisma.candidate_working_date.findMany({
    where: { candidate_id: candidateId },
    orderBy: { date: "desc" },
    take: 80,
    select: {
      cwd_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      store: {
        select: { store_name: true, company: { select: { company_name: true } } },
      },
    },
  });

  return rows.map((row) => ({
    id: row.cwd_uuid,
    date: formatDate(row.date),
    store: row.store?.store_name ?? "No store",
    company: row.store?.company?.company_name ?? "No company",
    startTime: formatDate(row.start_time),
    endTime: formatDate(row.end_time),
    totalTime: row.total_time != null ? `${row.total_time} min` : "—",
    status: workingDateStatusLabel(row.status),
  }));
}

export async function getCandidateWorkingDateDetail(
  candidateId: number,
  cwdUuid: string,
): Promise<WorkingDateDetail | null> {
  const row = await prisma.candidate_working_date.findFirst({
    where: { cwd_uuid: cwdUuid, candidate_id: candidateId },
    select: {
      cwd_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      created_at: true,
      updated_at: true,
      store: {
        select: { store_name: true, company: { select: { company_name: true } } },
      },
    },
  });
  return row;
}
