import { z } from "zod";
import { updateScheduleStatusSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schemas for candidate/schedule/[id] actions
// ---------------------------------------------------------------------------

/**
 * Validate a UUID string for get/delete operations.
 */
export const getScheduleEntrySchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

export const deleteScheduleEntrySchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

/**
 * Update schedule entry — re-uses the parent status validation but adds an
 * optional reason string for mutating operations.
 */
const VALID_SCHEDULE_STATUSES = [0, 1, 2, 3] as const;

export const updateScheduleEntrySchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
  status: z
    .number({ required_error: "Status is required", invalid_type_error: "Status must be a number" })
    .int("Status must be an integer")
    .refine((s) => (VALID_SCHEDULE_STATUSES as readonly number[]).includes(s), {
      message: "Status must be one of: 0 (Pending), 1 (Confirmed), 2 (Cancelled), 3 (Completed)",
    }),
  reason: z.string().max(1000).optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validate the shape of an existing schedule entry record.
 * Accepts null (entry not found) or a valid record shape.
 */
export const scheduleEntryExistenceSchema = z
  .object({
    cwd_uuid: z.string().min(1),
    status: z.number().int().optional(),
  })
  .nullable();

/**
 * Discriminated union for action results — enforces that every return
 * from an action is either `{ success: true }` or `{ success: false, error: string }`.
 */
export const scheduleEntryActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetScheduleEntryInput = z.input<typeof getScheduleEntrySchema>;
export type UpdateScheduleEntryInput = z.input<typeof updateScheduleEntrySchema>;
export type DeleteScheduleEntryInput = z.input<typeof deleteScheduleEntrySchema>;

export type ScheduleEntryResponse = z.output<typeof scheduleEntryActionResultSchema>;
