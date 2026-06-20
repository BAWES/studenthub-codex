import { z } from "zod";

// ---------------------------------------------------------------------------
// signupSchema — validates the signup form inputs (role, name, email, password)
// ---------------------------------------------------------------------------

export const signupSchema = z
  .object({
    role: z.enum(["worker", "employer"], {
      required_error: "Choose whether you want to work or hire.",
    }),
    name: z
      .string({ required_error: "Full name is required" })
      .min(2, "Full name must be at least 2 characters")
      .max(255, "Full name is too long"),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.input<typeof signupSchema>;

export type SignupState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  role?: string;
  email?: string;
};

/** Maps the signup role choice ("worker" / "employer") to the internal Role type. */
export function signupRoleToInternal(
  signupRole: "worker" | "employer"
): "candidate" | "company" {
  if (signupRole === "worker") return "candidate";
  return "company";
}
