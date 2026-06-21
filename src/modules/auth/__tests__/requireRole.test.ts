import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Test the multi-role requireRole logic
//
// The production implementation in session.ts uses server-only APIs
// (cookies, redirect). We test the core logic inline here: a role check
// should pass if EITHER the active role matches OR any of the user's
// assigned roles match.
// ---------------------------------------------------------------------------

type Role = "admin" | "staff" | "company" | "candidate" | "inspector";

interface MockSession {
  role: Role;
  roles?: Role[];
}

/**
 * Inline version of the requireRole logic.
 * Returns true if access is allowed, false if it should redirect.
 */
function checkRoleAccess(
  session: MockSession,
  requiredRole: Role,
): boolean {
  return session.role === requiredRole || (session.roles ?? []).includes(requiredRole);
}

describe("requireRole multi-role check", () => {
  it("should allow access when active role matches the required role (single role)", () => {
    const session: MockSession = { role: "admin" };
    expect(checkRoleAccess(session, "admin")).toBe(true);
  });

  it("should deny access when active role does not match (single role)", () => {
    const session: MockSession = { role: "staff" };
    expect(checkRoleAccess(session, "admin")).toBe(false);
  });

  it("should allow access when active role matches the required role (multi-role)", () => {
    const session: MockSession = { role: "admin", roles: ["admin", "staff"] };
    expect(checkRoleAccess(session, "admin")).toBe(true);
  });

  it("should allow access when a secondary role matches (active role is different)", () => {
    const session: MockSession = { role: "staff", roles: ["staff", "admin"] };
    expect(checkRoleAccess(session, "admin")).toBe(true);
  });

  it("should allow access when user has many roles and one matches", () => {
    const session: MockSession = {
      role: "candidate",
      roles: ["candidate", "staff", "admin", "company", "inspector"],
    };
    expect(checkRoleAccess(session, "inspector")).toBe(true);
  });

  it("should deny access when no roles match (multi-role)", () => {
    const session: MockSession = { role: "candidate", roles: ["candidate", "company"] };
    expect(checkRoleAccess(session, "admin")).toBe(false);
  });

  it("should deny access when roles array is empty", () => {
    const session: MockSession = { role: "staff", roles: [] };
    expect(checkRoleAccess(session, "admin")).toBe(false);
  });

  it("should handle undefined roles (backward compat)", () => {
    const session: MockSession = { role: "admin" };
    expect(checkRoleAccess(session, "admin")).toBe(true);
    expect(checkRoleAccess(session, "staff")).toBe(false);
  });

  it("should handle all role types correctly", () => {
    const session: MockSession = { role: "staff", roles: ["staff", "company"] };
    expect(checkRoleAccess(session, "admin")).toBe(false);
    expect(checkRoleAccess(session, "staff")).toBe(true);
    expect(checkRoleAccess(session, "company")).toBe(true);
    expect(checkRoleAccess(session, "candidate")).toBe(false);
    expect(checkRoleAccess(session, "inspector")).toBe(false);
  });
});
