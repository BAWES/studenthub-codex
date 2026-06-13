"use server";

// ---------------------------------------------------------------------------
// Candidate Schedule [id] — colocated server actions
// Delegates to module-level actions in @/modules/candidates/schedule/actions
// ---------------------------------------------------------------------------

export {
  getScheduleEntryAction as getScheduleEntry,
  updateScheduleEntryAction as updateScheduleEntry,
  deleteScheduleEntryAction as deleteScheduleEntry,
} from "@/modules/candidates/schedule/actions";

export type {
  ScheduleDetail,
  ScheduleItem,
  ScheduleStatusResult,
} from "@/modules/candidates/schedule/schemas";
