import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listWorkLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  date: z.string().optional(),
});

export const getWorkLogDetailSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export const submitWorkLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  totalTime: z.coerce.number().int().optional(),
  note: z.string().optional(),
  storeId: z.coerce.number().int().optional(),
});

export const updateWorkLogStatusSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
  status: z.coerce.number().int().min(0, "Status must be 0 or greater"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WorkLogItem = {
  candidate_working_hour_uuid: string;
  date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  store_name: string | null;
  company_name: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type WorkLogDetail = WorkLogItem & {
  start_location_lat: number | null;
  start_location_long: number | null;
  end_location_lat: number | null;
  end_location_long: number | null;
  store_location: string | null;
};

export type ListWorkLogsResult = {
  items: WorkLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SubmitWorkLogResult = {
  operation: "success" | "error";
  message: string;
  workLog?: WorkLogItem;
};

export type UpdateWorkLogStatusResult = {
  operation: "success" | "error";
  message: string;
  workLog?: WorkLogItem;
};
