import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single employee option returned by getEmployeeOptions.
 */
export const employeeOptionSchema = z.object({
  uuid: z.string(),
  name: z.string(),
});

export type EmployeeOption = z.output<typeof employeeOptionSchema>;

/**
 * Schema for the list of employee options returned by getEmployeeOptions.
 */
export const listEmployeeOptionsResultSchema = z.array(employeeOptionSchema);

export type ListEmployeeOptionsResult = z.output<typeof listEmployeeOptionsResultSchema>;
