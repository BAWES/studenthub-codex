// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks — vi.mock() is hoisted, so use vi.hoisted() for dependencies
// ---------------------------------------------------------------------------

const mockSession = vi.hoisted(() => ({
  id: "1",
  role: "admin" as const,
  name: "Alice",
  email: "alice@example.com",
  issuedAt: Date.now(),
  avatar: null,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue(mockSession),
}));

vi.mock("@/modules/workspace/WorkspaceOS", () => ({
  WorkspaceOS: vi.fn(({ children }: { children: React.ReactNode }) => children),
}));

// ---------------------------------------------------------------------------
// Module under test
// ---------------------------------------------------------------------------

import { RoleWorkspaceLayout } from "./RoleWorkspaceLayout";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("RoleWorkspaceLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is exported as an async function", () => {
    expect(RoleWorkspaceLayout.constructor.name).toBe("AsyncFunction");
  });

  it("calls requireRoleCapability with the given role and capability", async () => {
    await RoleWorkspaceLayout({
      role: "admin",
      capability: "admin.system",
      children: <div>Hello</div>,
    });

    expect(requireRoleCapability).toHaveBeenCalledTimes(1);
    expect(requireRoleCapability).toHaveBeenCalledWith("admin", "admin.system");
  });

  it("supports all five role/capability pairs used by the route layouts", async () => {
    const cases = [
      { role: "admin" as const, capability: "admin.system" as const },
      { role: "staff" as const, capability: "request.read.assigned" as const },
      { role: "candidate" as const, capability: "candidate.read.own" as const },
      { role: "company" as const, capability: "company.read.linked" as const },
      { role: "inspector" as const, capability: "id_review.read" as const },
    ];

    for (const { role, capability } of cases) {
      await RoleWorkspaceLayout({ role, capability, children: <div>Content</div> });
    }

    for (const { role, capability } of cases) {
      expect(requireRoleCapability).toHaveBeenCalledWith(role, capability);
    }
  });

  it("returns a React element with WorkspaceOS as the component type", async () => {
    const element = await RoleWorkspaceLayout({
      role: "admin",
      capability: "admin.system",
      children: <div>Hello</div>,
    }) as React.ReactElement;

    expect(element).toBeDefined();
    // $$typeof is either "react.element" or "react.transitional.element" depending on the JSX runtime
    expect(element.$$typeof?.toString()).toMatch(/react\.(transitional\.)?element/);
    // The JSX type should be the WorkspaceOS mock function
    expect(element.type).toBe(WorkspaceOS);
  });

  it("passes the session from requireRoleCapability as a prop to WorkspaceOS", async () => {
    const element = await RoleWorkspaceLayout({
      role: "staff",
      capability: "request.read.assigned",
      children: <div>Content</div>,
    }) as React.ReactElement & { props: { session: typeof mockSession } };

    expect(element.props.session).toEqual(
      expect.objectContaining({
        role: "admin",
        email: "alice@example.com",
      }),
    );
  });

  it("passes children through as a prop from the RoleWorkspaceLayout return value", async () => {
    const children = <div>Passed through</div>;
    const element = await RoleWorkspaceLayout({
      role: "admin",
      capability: "admin.system",
      children,
    }) as React.ReactElement & { props: { children: React.ReactNode } };

    expect(element.props.children).toBe(children);
  });
});
