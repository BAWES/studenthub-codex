import { z } from "zod";
import { HUB_SCOPES } from "@/modules/app/utils";

// ---------------------------------------------------------------------------
// Input schemas — Hub page server action
// ---------------------------------------------------------------------------

export const getHubDataSchema = z.object({
  query: z.string().optional(),
  scope: z.enum(HUB_SCOPES).optional(),
  record: z.string().optional(),
  required: z.string().optional(),
});

export type GetHubDataInput = z.input<typeof getHubDataSchema>;
