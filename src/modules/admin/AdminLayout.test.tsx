import { describe, it, expect, vi } from "vitest";

const mockRequireRoleCapability = vi.hoisted(() => vi.fn());

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: Parameters<typeof mockRequireRoleCapability>) => {
    mockRequireRoleCapability(...args);
    return Promise.resolve({
      role: "admin",
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

const { AdminLayout } = await import("./index");

describe("AdminLayout", () => {
  it("renders without crashing", async () => {
    const result = await AdminLayout({ children: "child" });
    expect(result).toBeDefined();
  });

  it("calls requireRoleCapability with admin role and admin.system capability", async () => {
    mockRequireRoleCapability.mockClear();
    await AdminLayout({ children: "child" });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("admin", "admin.system");
  });

  it("exports dynamic as force-dynamic", async () => {
    const mod = await import("./AdminLayout");
    expect(mod.dynamic).toBe("force-dynamic");
  });

  it("is re-exported from barrel", () => {
    expect(AdminLayout).toBeDefined();
    expect(AdminLayout.name).toBe("AdminLayout");
  });
});
