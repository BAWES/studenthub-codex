// ---------------------------------------------------------------------------
// Working date — pure helpers (label mapping, types)
// Extracted from workspace/data/working-date.ts so the data/ directory can be
// removed.  Consumers that need Prisma queries use the colocated actions in
// app/candidate/schedule/actions.ts instead.
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
