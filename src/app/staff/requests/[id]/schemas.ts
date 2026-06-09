import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const getStaffRequestDetailSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetStaffRequestDetailInput = z.input<typeof getStaffRequestDetailSchema>;
