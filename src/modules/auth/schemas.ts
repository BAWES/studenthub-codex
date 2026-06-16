import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const loginStateSchema = z.object({
  error: z.string().optional(),
  email: z.string().optional(),
  accounts: z
    .array(
      z.object({
        accountKey: z.string(),
        role: z.string(),
        label: z.string(),
        name: z.string(),
        email: z.string(),
      }),
    )
    .optional(),
});

export const changePasswordStateSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  fieldErrors: z.record(z.array(z.string())).optional(),
});

export type ChangePasswordState = z.output<typeof changePasswordStateSchema>;

export const verifySessionAuthenticatedSchema = z.object({
  authenticated: z.literal(true),
  user: z.object({
    role: z.string(),
    roles: z.array(z.string()).optional(),
    id: z.string(),
    name: z.string(),
    email: z.string(),
    issuedAt: z.number(),
  }),
});

export const verifySessionUnauthenticatedSchema = z.object({
  authenticated: z.literal(false),
  user: z.null(),
});

export const verifySessionResultSchema = z.discriminatedUnion("authenticated", [
  verifySessionAuthenticatedSchema,
  verifySessionUnauthenticatedSchema,
]);

/**
 * Schema for the switchRole form action.
 */
export const switchRoleSchema = z.object({
  targetRole: z.enum(["admin", "staff", "company", "candidate", "inspector"]),
});

/**
 * Schema for dev impersonation user lookup result.
 * Guarded by NODE_ENV=development — never exposed in production.
 */
export const impersonationUserSchema = z.object({
  role: z.enum(["admin", "staff", "candidate", "company", "inspector"]),
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
});

export type ImpersonationUser = z.output<typeof impersonationUserSchema>;
