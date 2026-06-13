// ---------------------------------------------------------------------------
// Candidate Schedule — colocated server actions
// Delegates to module-level actions in @/modules/candidates/schedule/actions
// (No "use server" — the module-level actions already have it.)
// ---------------------------------------------------------------------------

export {
  listScheduleAction as listSchedule,
  getScheduleItemAction as getScheduleItem,
  getScheduleDetailAction as getScheduleDetail,
  updateScheduleStatusAction as updateScheduleStatus,
} from "@/modules/candidates/schedule/actions";

export type {
  ScheduleItem,
  ScheduleDetail,
  ScheduleStatusResult,
  UpdateScheduleStatusInput,
} from "@/modules/candidates/schedule/schemas";
