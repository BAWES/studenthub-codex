import { describe, it, expect, vi } from "vitest";

const mockRequireRoleCapability = vi.hoisted(() => vi.fn());

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: Parameters<typeof mockRequireRoleCapability>) => {
    mockRequireRoleCapability(...args);
    return Promise.resolve({
      role: "staff",
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

const { StaffLayout } = await import("./index");

describe("StaffLayout", () => {
  it("renders without crashing", async () => {
    const result = await StaffLayout({ children: "child" });
    expect(result).toBeDefined();
  });

  it("calls requireRoleCapability with staff role and request.read.assigned capability", async () => {
    mockRequireRoleCapability.mockClear();
    await StaffLayout({ children: "child" });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("staff", "request.read.assigned");
  });

  it("exports dynamic as force-dynamic", async () => {
    const mod = await import("./StaffLayout");
    expect(mod.dynamic).toBe("force-dynamic");
  });

  it("is re-exported from barrel", () => {
    expect(StaffLayout).toBeDefined();
    expect(StaffLayout.name).toBe("StaffLayout");
  });
});
