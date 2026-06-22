import { z } from "zod";
import { submitWorkLogResultOutputSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Output validation — re-exports parent schemas for create route
// ---------------------------------------------------------------------------

export { submitWorkLogResultOutputSchema };

/**
 * Drop-in alias for the create route — validates the SubmitWorkLogResult shape.
 */
export const createWorkLogResultOutputSchema = submitWorkLogResultOutputSchema;
