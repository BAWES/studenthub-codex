import { z } from "zod";
import {
  agencyItemOutputSchema,
  agencyActionResultOutputSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Output validation — delegates to parent schemas for [id] route actions
// ---------------------------------------------------------------------------

export { agencyItemOutputSchema, agencyActionResultOutputSchema };

/**
 * Drop-in output schema for functions that return Promise<AgencyItem | null>.
 */
export const agencyDetailOutputSchema = agencyItemOutputSchema.nullable();
