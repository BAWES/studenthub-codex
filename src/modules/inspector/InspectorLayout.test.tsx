import { describe, it, expect, vi } from "vitest";

const mockRequireRoleCapability = vi.hoisted(() => vi.fn());

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: Parameters<typeof mockRequireRoleCapability>) => {
    mockRequireRoleCapability(...args);
    return Promise.resolve({
      role: "inspector",
      id: "1",
      name: "Test User",
      email: "test@test.com",
      issuedAt: Date.now(),
    });
  },
}));

vi.mock("@/modules/workspace/WorkspaceOS", () => ({
  WorkspaceOS: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/modules/workspace/RoleLayoutShell", () => ({
  RoleLayoutShell: ({ children }: { children: React.ReactNode }) => children,
}));

const { InspectorLayout } = await import("./index");

describe("InspectorLayout", () => {
  it("renders without crashing", async () => {
    const result = await InspectorLayout({ children: "child" });
    expect(result).toBeDefined();
  });

  it("calls requireRoleCapability with inspector role and id_review.read capability", async () => {
    mockRequireRoleCapability.mockClear();
    await InspectorLayout({ children: "child" });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("inspector", "id_review.read");
  });

  it("exports dynamic as force-dynamic", async () => {
    const mod = await import("./InspectorLayout");
    expect(mod.dynamic).toBe("force-dynamic");
  });

  it("is re-exported from barrel", () => {
    expect(InspectorLayout).toBeDefined();
    expect(InspectorLayout.name).toBe("InspectorLayout");
  });
});
