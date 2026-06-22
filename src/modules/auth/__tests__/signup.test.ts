import { describe, it, expect } from "vitest";
import { signupSchema, signupRoleToInternal } from "@/modules/auth/signupSchema";
import type { SignupState } from "@/modules/auth/signupSchema";

describe("signupSchema", () => {
  it("accepts valid worker signup", () => {
    const result = signupSchema.safeParse({
      role: "worker",
      name: "John Student",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("worker");
      expect(result.data.name).toBe("John Student");
    }
  });

  it("accepts valid employer signup", () => {
    const result = signupSchema.safeParse({
      role: "employer",
      name: "Jane Employer",
      email: "jane@company.com",
      password: "securePass456",
      confirmPassword: "securePass456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("employer");
    }
  });

  it("rejects empty name", () => {
    const result = signupSchema.safeParse({
      role: "worker",
      name: "",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = signupSchema.safeParse({
      role: "worker",
      name: "A",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = signupSchema.safeParse({
      role: "worker",
      name: "John Student",
      email: "",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = signupSchema.safeParse({
      role: "worker",
      name: "John Student",
      email: "not-an-email",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      role: "worker",
      name: "John Student",
      email: "john@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("at least 8"))).toBe(true);
    }
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      role: "worker",
      name: "John Student",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "differentPass",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    }
  });

  it("rejects empty role", () => {
    const result = signupSchema.safeParse({
      name: "John Student",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role value", () => {
    const result = signupSchema.safeParse({
      role: "admin",
      name: "John Student",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "securePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = signupSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// signupRoleToInternal — maps signup role choice to internal role
// ---------------------------------------------------------------------------

describe("signupRoleToInternal", () => {
  it("maps worker to candidate", () => {
    expect(signupRoleToInternal("worker")).toBe("candidate");
  });

  it("maps employer to company", () => {
    expect(signupRoleToInternal("employer")).toBe("company");
  });

  it("defaults unrecognized values to company (type-safe fallback)", () => {
    // TypeScript prevents invalid args at compile time;
    // runtime fallback is company for any non-worker value
    const result = signupRoleToInternal("admin" as "worker" | "employer");
    expect(result).toBe("company");
  });
});

// ---------------------------------------------------------------------------
// SignupState — the return type for the signup server action
// ---------------------------------------------------------------------------

describe("SignupState shape", () => {
  it("accepts success state", () => {
    const state: SignupState = { success: true };
    expect(state.success).toBe(true);
    expect(state.error).toBeUndefined();
  });

  it("accepts error state with message", () => {
    const state: SignupState = {
      error: "An account with this email already exists.",
    };
    expect(state.error).toBe("An account with this email already exists.");
  });

  it("accepts field-level errors", () => {
    const state: SignupState = {
      fieldErrors: {
        password: ["Password must be at least 8 characters"],
      },
    };
    expect(state.fieldErrors?.password).toBeDefined();
    expect(state.fieldErrors!.password!.length).toBe(1);
  });

  it("accepts state with role preserved for re-render", () => {
    const state: SignupState = {
      role: "worker",
      email: "john@example.com",
    };
    expect(state.role).toBe("worker");
    expect(state.email).toBe("john@example.com");
  });
});
