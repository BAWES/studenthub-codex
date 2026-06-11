import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const loginAccountChoiceSchema = z.object({
  accountKey: z.string(),
  role: z.string(),
  label: z.string(),
  name: z.string(),
  email: z.string(),
});

export type LoginAccountChoice = z.output<typeof loginAccountChoiceSchema>;

export const loginStateSchema = z.object({
  error: z.string().optional(),
  email: z.string().optional(),
  accounts: z.array(loginAccountChoiceSchema).optional(),
});

export type LoginState = z.output<typeof loginStateSchema>;

export const sessionUserSchema = z.object({
  role: z.string(),
  id: z.string(),
  name: z.string(),
  email: z.string(),
  issuedAt: z.number(),
});

export type SessionUser = z.output<typeof sessionUserSchema>;

export const verifySessionResultSchema = z.discriminatedUnion("authenticated", [
  z.object({
    authenticated: z.literal(false),
    user: z.null(),
  }),
  z.object({
    authenticated: z.literal(true),
    user: sessionUserSchema,
  }),
]);

export type VerifySessionResult = z.output<typeof verifySessionResultSchema>;

export const changePasswordStateSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  fieldErrors: z.record(z.array(z.string())).optional(),
});

export type ChangePasswordState = z.output<typeof changePasswordStateSchema>;
