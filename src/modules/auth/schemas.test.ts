import { describe, it, expect } from "vitest";
import {
  loginStateSchema,
  changePasswordStateSchema,
  verifySessionAuthenticatedSchema,
  verifySessionUnauthenticatedSchema,
  verifySessionResultSchema,
  switchRoleSchema,
  impersonationUserSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// loginStateSchema
// ---------------------------------------------------------------------------
describe("loginStateSchema", () => {
  const valid = {
    error: "Invalid credentials",
    email: "user@example.com",
    accounts: [
      {
        accountKey: "key-1",
        role: "candidate",
        label: "Candidate",
        name: "John Doe",
        email: "john@example.com",
      },
    ],
  };

  it("accepts a valid login state", () => {
    expect(loginStateSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    expect(loginStateSchema.safeParse({}).success).toBe(true);
  });

  it("accepts missing accounts", () => {
    const { accounts: _, ...rest } = valid;
    expect(loginStateSchema.safeParse(rest).success).toBe(true);
  });

  it("accepts empty accounts array", () => {
    expect(
      loginStateSchema.safeParse({ ...valid, accounts: [] }).success,
    ).toBe(true);
  });

  it("rejects wrong type for error", () => {
    expect(
      loginStateSchema.safeParse({ error: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// changePasswordStateSchema
// ---------------------------------------------------------------------------
describe("changePasswordStateSchema", () => {
  const valid = {
    success: true,
    error: "Something went wrong",
    fieldErrors: { password: ["Too short"] },
  };

  it("accepts a valid change password state", () => {
    expect(changePasswordStateSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    expect(changePasswordStateSchema.safeParse({}).success).toBe(true);
  });

  it("rejects wrong type for success", () => {
    expect(
      changePasswordStateSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for fieldErrors", () => {
    expect(
      changePasswordStateSchema.safeParse({ fieldErrors: "error" }).success,
    ).toBe(false);
  });

  it("rejects non-array field error values", () => {
    expect(
      changePasswordStateSchema.safeParse({ fieldErrors: { password: "single error" } }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// verifySessionAuthenticatedSchema
// ---------------------------------------------------------------------------
describe("verifySessionAuthenticatedSchema", () => {
  const valid = {
    authenticated: true as const,
    user: {
      role: "admin",
      roles: ["admin", "staff"],
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      issuedAt: 1700000000,
    },
  };

  it("accepts a valid authenticated session", () => {
    expect(verifySessionAuthenticatedSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing optional roles", () => {
    const { roles: _, ...user } = valid.user;
    expect(
      verifySessionAuthenticatedSchema.safeParse({ ...valid, user }).success,
    ).toBe(true);
  });

  it("rejects authenticated=false", () => {
    expect(
      verifySessionAuthenticatedSchema.safeParse({ ...valid, authenticated: false }).success,
    ).toBe(false);
  });

  it("rejects missing user fields", () => {
    const { name: _, ...user } = valid.user;
    expect(
      verifySessionAuthenticatedSchema.safeParse({ ...valid, user }).success,
    ).toBe(false);
  });

  it("rejects wrong type for issuedAt", () => {
    expect(
      verifySessionAuthenticatedSchema.safeParse({
        ...valid,
        user: { ...valid.user, issuedAt: "now" },
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// verifySessionUnauthenticatedSchema
// ---------------------------------------------------------------------------
describe("verifySessionUnauthenticatedSchema", () => {
  const valid = {
    authenticated: false as const,
    user: null,
  };

  it("accepts unauthenticated session", () => {
    expect(verifySessionUnauthenticatedSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects authenticated=true", () => {
    expect(
      verifySessionUnauthenticatedSchema.safeParse({ ...valid, authenticated: true }).success,
    ).toBe(false);
  });

  it("rejects non-null user", () => {
    expect(
      verifySessionUnauthenticatedSchema.safeParse({ ...valid, user: { name: "test" } }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// verifySessionResultSchema (discriminated union)
// ---------------------------------------------------------------------------
describe("verifySessionResultSchema", () => {
  it("accepts authenticated session", () => {
    const result = verifySessionResultSchema.safeParse({
      authenticated: true,
      user: {
        role: "admin",
        id: "user-1",
        name: "Admin",
        email: "admin@example.com",
        issuedAt: 1700000000,
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.authenticated).toBe(true);
    }
  });

  it("accepts unauthenticated session", () => {
    const result = verifySessionResultSchema.safeParse({
      authenticated: false,
      user: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.authenticated).toBe(false);
    }
  });

  it("rejects missing discriminated union field", () => {
    expect(verifySessionResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// switchRoleSchema
// ---------------------------------------------------------------------------
describe("switchRoleSchema", () => {
  it("accepts valid role", () => {
    expect(switchRoleSchema.safeParse({ targetRole: "admin" }).success).toBe(true);
  });

  it("accepts all valid roles", () => {
    const roles = ["admin", "staff", "company", "candidate", "inspector"] as const;
    for (const role of roles) {
      expect(switchRoleSchema.safeParse({ targetRole: role }).success).toBe(true);
    }
  });

  it("rejects invalid role", () => {
    expect(switchRoleSchema.safeParse({ targetRole: "superadmin" }).success).toBe(false);
  });

  it("rejects missing targetRole", () => {
    expect(switchRoleSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(switchRoleSchema.safeParse({ targetRole: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// impersonationUserSchema
// ---------------------------------------------------------------------------
describe("impersonationUserSchema", () => {
  const valid = {
    role: "admin",
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
  };

  it("accepts valid admin user", () => {
    expect(impersonationUserSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all valid roles", () => {
    const roles = ["admin", "staff", "candidate", "company", "inspector"] as const;
    for (const role of roles) {
      expect(impersonationUserSchema.safeParse({ ...valid, role }).success).toBe(true);
    }
  });

  it("rejects null name", () => {
    expect(
      impersonationUserSchema.safeParse({ ...valid, name: null }).success,
    ).toBe(false);
  });

  it("rejects invalid role", () => {
    expect(
      impersonationUserSchema.safeParse({ ...valid, role: "superadmin" }).success,
    ).toBe(false);
  });

  it("rejects empty id", () => {
    expect(
      impersonationUserSchema.safeParse({ ...valid, id: "" }).success,
    ).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = valid;
    expect(impersonationUserSchema.safeParse(rest).success).toBe(false);
  });
});
