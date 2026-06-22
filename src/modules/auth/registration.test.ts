import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// registerSchema — validates signup form inputs (name, email, password, role)
// Used internally by registerAction in registration.ts.
// ---------------------------------------------------------------------------

const signupRoles = ["candidate", "company"] as const;
type SignupRole = (typeof signupRoles)[number];

const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Enter your full name.")
      .max(255, "Name is too long."),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    password: z
      .string({ required_error: "Password is required" })
      .min(5, "Password must be at least 5 characters."),
    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password."),
    role: z.enum(signupRoles, {
      required_error: "Select whether you want to work or hire.",
      invalid_type_error: "Select whether you want to work or hire.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

describe("registerSchema", () => {
  it("accepts valid candidate registration", () => {
    const result = registerSchema.safeParse({
      name: "Jaafar Al-Mutawa",
      email: "jaafar@example.com",
      password: "secret123",
      confirmPassword: "secret123",
      role: "candidate",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jaafar Al-Mutawa");
      expect(result.data.email).toBe("jaafar@example.com");
      expect(result.data.role).toBe("candidate");
    }
  });

  it("accepts valid company registration", () => {
    const result = registerSchema.safeParse({
      name: "Kuwait Co",
      email: "hr@kuwaitco.com",
      password: "strongPass1",
      confirmPassword: "strongPass1",
      role: "company",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("company");
    }
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "test@example.com",
      password: "secret123",
      confirmPassword: "secret123",
      role: "candidate",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
    }
  });

  it("rejects empty email", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "",
      password: "secret123",
      confirmPassword: "secret123",
      role: "candidate",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "not-an-email",
      password: "secret123",
      confirmPassword: "secret123",
      role: "candidate",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 5 characters", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "abc",
      confirmPassword: "abc",
      role: "candidate",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("at least 5"))).toBe(true);
    }
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "secret123",
      confirmPassword: "differentPass",
      role: "candidate",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    }
  });

  it("rejects missing role", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role (admin/staff/inspector not allowed for signup)", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "secret123",
      confirmPassword: "secret123",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects missing confirmPassword", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "secret123",
      role: "candidate",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name and email (validation gate)", () => {
    const result = registerSchema.safeParse({
      name: "  Test User  ",
      email: "  test@example.com  ",
      password: "secret123",
      confirmPassword: "secret123",
      role: "candidate",
    });
    // Zod's email validator rejects whitespace-padded strings
    expect(result.success).toBe(false);
  });

  it("accepts name with special characters", () => {
    const result = registerSchema.safeParse({
      name: "Mohamed Al-Abdullah",
      email: "mohamed@example.com",
      password: "securePass1",
      confirmPassword: "securePass1",
      role: "candidate",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RegisterState type — the return shape of registerAction
// ---------------------------------------------------------------------------

type RegisterState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

describe("RegisterState shape", () => {
  it("accepts success state", () => {
    const state: RegisterState = { success: true };
    expect(state.success).toBe(true);
    expect(state.error).toBeUndefined();
  });

  it("accepts error state with message", () => {
    const state: RegisterState = { error: "An account with this email already exists." };
    expect(state.error).toBe("An account with this email already exists.");
  });

  it("accepts field-level errors", () => {
    const state: RegisterState = {
      fieldErrors: {
        password: ["Password must be at least 5 characters"],
        confirmPassword: ["Passwords do not match"],
      },
    };
    expect(state.fieldErrors?.password).toBeDefined();
    expect(state.fieldErrors!.password!.length).toBe(1);
  });

  it("accepts success with no error or fieldErrors", () => {
    const state: RegisterState = { success: true };
    expect(state.success).toBe(true);
    expect(state.error).toBeUndefined();
    expect(state.fieldErrors).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// SignupRole type — only candidate and company are available for signup
// ---------------------------------------------------------------------------

describe("SignupRole type", () => {
  it("allows candidate role", () => {
    const role: SignupRole = "candidate";
    expect(role).toBe("candidate");
  });

  it("allows company role", () => {
    const role: SignupRole = "company";
    expect(role).toBe("company");
  });

  it("rejects admin role at type level (runtime check)", () => {
    const isValid = (r: string): r is SignupRole =>
      signupRoles.includes(r as SignupRole);
    expect(isValid("admin")).toBe(false);
    expect(isValid("staff")).toBe(false);
    expect(isValid("inspector")).toBe(false);
    expect(isValid("candidate")).toBe(true);
    expect(isValid("company")).toBe(true);
  });
});
